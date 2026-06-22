import { CREDIT_COSTS } from "../../../../shared/src/constants/credits";

export type CreditOperation = keyof typeof CREDIT_COSTS;

export class CostMeter {
  getCreditCost(operation: CreditOperation): number {
    return CREDIT_COSTS[operation] ?? 0;
  }

  estimateUSDCost(provider: string, model: string, estimatedTokens: number): number {
    // Rough estimate for budget checks before actual call
    const outputRatio = 0.3; // assume 30% of tokens are output
    const inputTokens = Math.round(estimatedTokens * 0.7);
    const outputTokens = Math.round(estimatedTokens * outputRatio);

    const rates: Record<string, { input: number; output: number }> = {
      "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
      "gpt-4o": { input: 2.5, output: 10.0 },
      "gemini-2.0-flash": { input: 0.075, output: 0.3 },
    };

    const rate = rates[model];
    if (!rate) return 0;

    return (
      (inputTokens / 1_000_000) * rate.input +
      (outputTokens / 1_000_000) * rate.output
    );
  }
}
