import OpenAI from "openai";
import { BaseAdapter, AIRequestOptions, AIResponse } from "./BaseAdapter";
import { config } from "../../../config";

export class OpenRouterAdapter extends BaseAdapter {
  readonly provider = "openrouter";
  readonly defaultModel = "anthropic/claude-sonnet-4-6";

  private client = new OpenAI({
    apiKey: config.ai.openrouterKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://adpilotindia.com",
      "X-Title": "AdPilot India",
    },
  });

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    const model = options.model ?? this.defaultModel;

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: options.maxTokens ?? 4096,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const choice = response.choices[0];
    const promptTokens = response.usage?.prompt_tokens ?? 0;
    const completionTokens = response.usage?.completion_tokens ?? 0;

    return {
      content: choice.message.content ?? "",
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      model,
      provider: this.provider,
      costUSD: 0,
    };
  }
}
