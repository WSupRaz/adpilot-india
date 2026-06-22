import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAdapter, AIRequestOptions, AIResponse } from "./BaseAdapter";
import { config } from "../../../config";

export class GeminiAdapter extends BaseAdapter {
  readonly provider = "google";
  readonly defaultModel = "gemini-2.0-flash";

  private client = new GoogleGenerativeAI(config.ai.googleKey);

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    const model = options.model ?? this.defaultModel;
    const genModel = this.client.getGenerativeModel({ model });

    const systemInstruction = options.messages.find((m) => m.role === "system")?.content;
    const history = options.messages
      .filter((m) => m.role !== "system")
      .slice(0, -1)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    const lastMessage = options.messages.filter((m) => m.role !== "system").at(-1);

    const chat = genModel.startChat({
      history,
      systemInstruction,
    });

    const result = await chat.sendMessage(lastMessage?.content ?? "");
    const text = result.response.text();
    const usage = result.response.usageMetadata;

    const promptTokens = usage?.promptTokenCount ?? 0;
    const completionTokens = usage?.candidatesTokenCount ?? 0;

    return {
      content: text,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      model,
      provider: this.provider,
      costUSD: 0, // Gemini pricing varies; implement as needed
    };
  }
}
