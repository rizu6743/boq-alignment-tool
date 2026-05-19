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
    const { boqData, userQuestion } = req.body;

    if (!boqData) {
      return res.status(400).json({
        error: "Missing BOQ data"
      });
    }

    const prompt = `
You are a Senior Estimator AI for Candy CCS to Client BOQ reconciliation.

Your job:
- Review the Client BOQ and CCS BOQ alignment.
- Transfer ONLY rates from CCS.
- Do NOT transfer CCS totals.
- Match line items using description and quantity.
- Do NOT rely blindly on row order.
- Detect additional items in CCS which are not in Client BOQ.
- Advise where additional items should be inserted based on Client BOQ structure.
- Check formulas: Amount = Quantity × Rate.
- Check bill totals and summary formulas.
- Warn the estimator before applying rates if risk is high.

BOQ DATA:
${JSON.stringify(boqData, null, 2)}

USER QUESTION:
${userQuestion || "Give full AI review and advice."}

Give practical estimator advice in clear steps.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a careful Senior Estimator AI assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    });

    return res.status(200).json({
      success: true,
      reply: response.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
