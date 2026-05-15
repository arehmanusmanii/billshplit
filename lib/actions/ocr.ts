"use server";

export async function parseReceiptWithOllama(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    // Convert file to base64 for Ollama
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const prompt = `You are a highly accurate receipt parsing AI. 
Analyze this receipt image and extract ONLY the purchased food/drink items and their individual prices. 
DO NOT include tax, tip, totals, change, or subtotal. 
If an item has a quantity like "2x Burger $10.00", split it or return the individual price if possible, or just return the item name exactly as is and the price.
Return the result strictly as a JSON array of objects with the keys "name" (string) and "price" (number). Do not include markdown formatting or any other text.
Example format:
[{"name": "Burger", "price": 5.00}, {"name": "Fries", "price": 3.50}]`;

    // Make request to local Ollama API
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "glm-ocr", // The model the user requested
        prompt: prompt,
        images: [base64Image],
        stream: false,
        format: "json", // Forces JSON output if supported by model
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API Error:", errorText);
      throw new Error("Failed to communicate with local Ollama server");
    }

    const data = await response.json();
    let jsonString = data.response;
    
    // Safely extract JSON array if the model wrapped it in markdown
    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    // Parse the JSON string
    const parsedData = JSON.parse(jsonString);
    
    // Validate and add unique IDs to the items
    const finalItems = parsedData
      .filter((item: any) => item.name && typeof item.price === 'number')
      .map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        name: String(item.name).trim(),
        price: Number(item.price)
      }));

    return finalItems;

  } catch (error) {
    console.error("OCR Server Action Error:", error);
    throw new Error("Failed to parse receipt. Is Ollama running?");
  }
}
