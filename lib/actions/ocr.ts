"use server";

import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const prompt = `You are a highly accurate receipt parsing AI.
Analyze this receipt image and extract the purchased food/drink items and their individual prices,
AND the total tax amount if visible on the receipt.
If an item has a quantity like "2x Burger $10.00", split it into separate items or return the item name as-is with the individual price.
Return the result strictly as a JSON object with this exact shape. Do not include markdown formatting or any other text.
{
  "items": [{"name": string, "price": number}],
  "tax": number | null
}
If tax, tip, or service charge is visible, include it as "tax". If not visible, use null.
Do NOT include totals, subtotals, change, or cash amounts in items.
Example:
{"items": [{"name": "Burger", "price": 5.00}, {"name": "Fries", "price": 3.50}], "tax": 0.85}`;

export interface OcrResult {
  items: { id: string; name: string; price: number }[];
  tax: number | null;
}

export async function parseReceiptWithGroq(formData: FormData): Promise<OcrResult> {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0,
    });

    let jsonString = completion.choices[0]?.message?.content ?? "";

    // Extract JSON object, stripping any markdown fencing
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonString = jsonMatch[0];

    const parsed = JSON.parse(jsonString);

    const items = (Array.isArray(parsed.items) ? parsed.items : [])
      .filter((item: any) => item.name && typeof item.price === "number")
      .map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        name: String(item.name).trim(),
        price: Number(item.price),
      }));

    const tax = typeof parsed.tax === "number" ? Number(parsed.tax) : null;

    return { items, tax };
  } catch (error: any) {
    console.error("OCR Server Action Error:", error);
    throw new Error(
      `OCR Failed: ${error.message || "Unknown error"}. Please try again or add items manually.`
    );
  }
}
