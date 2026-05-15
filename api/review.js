import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {
    const { auditData } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: `
You are a Senior Estimator reviewing Candy CCS to Client BOQ alignment.

Review this audit data:
${JSON.stringify(auditData, null, 2)}

Give:
1. Risk level
2. Wrong sheet mapping risks
3. Wrong column mapping risks
4. Additional item risks
5. Total mismatch reasons
6. Missing BOQ item risks
7. Final recommendation:
SAFE TO EXPORT or DO NOT EXPORT
`
    });

    res.status(200).json({
      review: response.output_text
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
