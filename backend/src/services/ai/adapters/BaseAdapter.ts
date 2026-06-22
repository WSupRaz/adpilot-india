export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

export interface AIResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: string;
  costUSD: number;
}

export abstract class BaseAdapter {
  abstract readonly provider: string;
  abstract readonly defaultModel: string;

  abstract complete(options: AIRequestOptions): Promise<AIResponse>;

  protected calculateCost(_model: string, _promptTokens: number, _completionTokens: number): number {
    return 0;
  }
}
