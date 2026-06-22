import { BaseAdapter, AIRequestOptions, AIResponse } from "./adapters/BaseAdapter";
import { AnthropicAdapter } from "./adapters/AnthropicAdapter";
import { OpenAIAdapter } from "./adapters/OpenAIAdapter";
import { GeminiAdapter } from "./adapters/GeminiAdapter";
import { OpenRouterAdapter } from "./adapters/OpenRouterAdapter";
import { ModelSelector, AIProvider, TaskType, Language } from "./ModelSelector";
import { CostMeter } from "./CostMeter";
import { ResponseValidator } from "./ResponseValidator";
import { logger } from "../../lib/logger";
import { prisma } from "../../config/database";
import { ZodSchema } from "zod";

const adapters: Record<AIProvider, BaseAdapter> = {
  anthropic: new AnthropicAdapter(),
  openai: new OpenAIAdapter(),
  google: new GeminiAdapter(),
  openrouter: new OpenRouterAdapter(),
};

interface RouteOptions {
  task: TaskType;
  language?: Language;
  messages: AIRequestOptions["messages"];
  maxTokens?: number;
  temperature?: number;
  responseSchema?: ZodSchema;
  userId: string;
  referenceId?: string;
  referenceType?: string;
}

export class AIRouter {
  private selector = new ModelSelector();
  private costMeter = new CostMeter();

  async complete(options: RouteOptions): Promise<{ content: string; response: AIResponse }> {
    const { task, language = "en", userId, referenceId, referenceType } = options;
    const selection = this.selector.select(task, language);
    const chain = [{ provider: selection.provider, model: selection.model }, ...selection.fallbackChain];

    let lastError: Error | null = null;

    for (const { provider, model } of chain) {
      const adapter = adapters[provider];
      const start = Date.now();

      try {
        logger.info(`AI request: ${task} via ${provider}/${model}`);

        const response = await adapter.complete({
          messages: options.messages,
          model,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        });

        // Validate response if schema provided
        if (options.responseSchema) {
          const parsed = ResponseValidator.validate(response.content, options.responseSchema);
          response.content = JSON.stringify(parsed);
        }

        // Log to DB
        await this.logUsage(userId, task, response, Date.now() - start, true, referenceId, referenceType);

        return { content: response.content, response };
      } catch (err) {
        lastError = err as Error;
        logger.warn(`AI failure on ${provider}/${model}: ${lastError.message}. Trying fallback...`);
        await this.logUsage(userId, task, null, Date.now() - start, false, referenceId, referenceType, lastError.message, provider, model);
      }
    }

    throw new Error(`All AI providers failed for task '${task}'. Last error: ${lastError?.message}`);
  }

  private async logUsage(
    userId: string,
    operationType: string,
    response: AIResponse | null,
    latencyMs: number,
    success: boolean,
    referenceId?: string,
    referenceType?: string,
    errorMessage?: string,
    fallbackProvider?: string,
    fallbackModel?: string
  ) {
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId,
          operationType,
          provider: response?.provider ?? fallbackProvider ?? "unknown",
          model: response?.model ?? fallbackModel ?? "unknown",
          promptTokens: response?.promptTokens ?? 0,
          completionTokens: response?.completionTokens ?? 0,
          totalTokens: response?.totalTokens ?? 0,
          costUsd: response?.costUSD ?? 0,
          latencyMs,
          success,
          errorMessage,
          referenceId,
          referenceType,
        },
      });
    } catch (err) {
      logger.error("Failed to log AI usage", err);
    }
  }
}

export const aiRouter = new AIRouter();
