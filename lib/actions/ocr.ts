"use server";

import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const prompt = `You are a highly accurate receipt parsing AI.
Analyze this receipt image and extract ONLY the purchased food/drink items and their individual prices.
DO NOT include tax, tip, totals, change, or subtotal.
If an item has a quantity like "2x Burger $10.00", split it or return the individual price if possible, or just return the item name exactly as is and the price.
Return the result strictly as a JSON array of objects with the keys "name" (string) and "price" (number). Do not include markdown formatting or any other text.
Example format:
[{"name": "Burger", "price": 5.00}, {"name": "Fries", "price": 3.50}]`;

export async function parseReceiptWithGroq(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

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

    // Safely extract JSON array if the model wrapped it in markdown
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const parsedData = JSON.parse(jsonString);

    const finalItems = parsedData
      .filter((item: any) => item.name && typeof item.price === "number")
      .map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        name: String(item.name).trim(),
        price: Number(item.price),
      }));

    return finalItems;
  } catch (error: any) {
    console.error("OCR Server Action Error:", error);
    throw new Error(
      `OCR Failed: ${error.message || "Unknown error"}. Please try again or add items manually.`
    );
  }
}
