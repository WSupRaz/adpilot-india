import Anthropic from "@anthropic-ai/sdk";
import { BaseAdapter, AIRequestOptions, AIResponse } from "./BaseAdapter";
import { config } from "../../../config";

// Pricing per 1M tokens (USD) — update when Anthropic changes pricing
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.25, output: 1.25 },
};

export class AnthropicAdapter extends BaseAdapter {
  readonly provider = "anthropic";
  readonly defaultModel = "claude-sonnet-4-6";

  private client = new Anthropic({ apiKey: config.ai.anthropicKey });

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    const model = options.model ?? this.defaultModel;
    const systemMessage = options.messages.find((m) => m.role === "system");
    const userMessages = options.messages.filter((m) => m.role !== "system");

    const response = await this.client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 4096,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    const promptTokens = response.usage.input_tokens;
    const completionTokens = response.usage.output_tokens;

    return {
      content,
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
