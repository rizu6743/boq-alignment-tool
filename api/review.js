import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests allowed"
    });
  }

  try {
    const { boqData } = req.body;

    if (!boqData) {
      return res.status(400).json({
        error: "Missing BOQ data"
      });
    }

    const prompt = `
You are a Senior Estimator AI specializing in Candy CCS BOQ reconciliation.

You are reviewing a Client BOQ and a Candy CCS BOQ.

STRICT RULES:

1. DO NOT transfer totals from CCS.
2. Transfer ONLY RATE values.
3. Match items by:
   - Description similarity
   - Quantity matching
   - BOQ element order
   - Bill structure
4. DO NOT use row order blindly.
5. Identify any CCS item not found in Client BOQ as ADDITIONAL ITEM.
6. If client BOQ instructions require additional items:
   - under respective bill,
   - under heading section,
   - or at end of bill,
   follow that structure intelligently.
7. Check formulas:
   - Total = Quantity × Rate
8. Check bill totals and summary formulas.
9. Detect missing line items.
10. Detect wrong quantity mapping.
11. Detect duplicate transfer risk.
12. Warn user if confidence is low.

Review the following BOQ analysis data:

${JSON.stringify(boqData, null, 2)}

Return JSON only in this structure:

{
  "overallRisk": "",
  "confidenceScore": "",
  "additionalItems": [],
  "missingItems": [],
  "formulaIssues": [],
  "warnings": [],
  "recommendation": "",
  "safeToApply": true
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a world-class Senior Estimator AI for BOQ reconciliation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    });

    const result = response.choices[0].message.content;

    return res.status(200).json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
