let aiClient;

async function getAIClient() {
  if (!aiClient) {
    const { GoogleGenAI } = await import("@google/genai");

    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return aiClient;
}

const getSuggestions = async (req, res) => {
  try {
    const { text, mode, style = "casual" } = req.body || {};

    if (typeof text !== "string" || !text.trim() || text.length > 1000) {
      return res.status(400).json({
        message: "Please provide valid text",
      });
    }

    if (!["typing", "replies"].includes(mode)) {
      return res.status(400).json({
        message: "Mode must be typing or replies",
      });
    }

    const prompt =
      mode === "typing"
        ? `You are an assistant for a chat application.
           Suggest exactly 3 concise ways to continue this unfinished message.
           Message: ${JSON.stringify(text)}
           Tone: ${style}.
           Return only relevant phrases, not explanations.`
        : `You are an assistant for a chat application.
           Generate exactly 3 short, appropriate replies to this incoming message.
           Incoming message: ${JSON.stringify(text)}
           Tone: ${style}.
           Do not assume facts that are not provided.`;

    const ai = await getAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
    });

    const suggestions = JSON.parse(response.text);

    if (
      !Array.isArray(suggestions) ||
      !suggestions.every((item) => typeof item === "string")
    ) {
      throw new Error("Invalid Gemini response");
    }

    res.status(200).json({
      suggestions: suggestions.filter((item) => item.trim()).slice(0, 3),
    });
  } catch (error) {
    console.error("Gemini error:", error.message);

    res.status(502).json({
      message: "AI suggestions are temporarily unavailable",
    });
  }
};

async function getAISuggestions(text, mode) {
  try {
    const result = await apiRequest("/ai/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        mode: mode,
        style: "casual",
      }),
    });

    console.log("AI suggestions response:", result);

    return result.suggestions || [];
  } catch (error) {
    console.error("AI suggestions failed:", error);
    return [];
  }
}
module.exports = {
  getSuggestions,
  getAISuggestions,
};
