import OpenAI from "openai";
import { BaseAdapter, AIRequestOptions, AIResponse } from "./BaseAdapter";
import { config } from "../../../config";

const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

export class OpenAIAdapter extends BaseAdapter {
  readonly provider = "openai";
  readonly defaultModel = "gpt-4o";

  private client = new OpenAI({ apiKey: config.ai.openaiKey });

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    const model = options.model ?? this.defaultModel;

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      response_format: options.responseFormat === "json" ? { type: "json_object" } : { type: "text" },
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
      costUSD: this.calculateCost(model, promptTokens, completionTokens),
    };
  }

  protected calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = PRICING[model];
    if (!pricing) return 0;
    return (
      (promptTokens / 1_000_000) * pricing.input +
      (completionTokens / 1_000_000) * pricing.output
    );
  }
}
