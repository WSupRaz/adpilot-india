export type AIProvider = "anthropic" | "openai" | "google" | "openrouter";

export type TaskType =
  | "campaign_generate"
  | "audit_analyze"
  | "creative_generate"
  | "competitor_analyze"
  | "growth_plan"
  | "policy_check"
  | "translate";

export type Language = "en" | "hi" | "hinglish";

interface ModelSelection {
  provider: AIProvider;
  model: string;
  fallbackChain: Array<{ provider: AIProvider; model: string }>;
}

// Model selection matrix: task + language → best model + fallback chain
const SELECTION_MATRIX: Record<TaskType, Record<Language, ModelSelection>> = {
  campaign_generate: {
    en: {
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      fallbackChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "google", model: "gemini-2.0-flash" },
      ],
    },
    hi: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "anthropic", model: "claude-sonnet-4-6" },
      ],
    },
    hinglish: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [
        { provider: "openai", model: "gpt-4o" },
        { provider: "anthropic", model: "claude-sonnet-4-6" },
      ],
    },
  },
  audit_analyze: {
    en: {
      provider: "openai",
      model: "gpt-4o",
      fallbackChain: [{ provider: "anthropic", model: "claude-sonnet-4-6" }],
    },
    hi: {
      provider: "openai",
      model: "gpt-4o",
      fallbackChain: [{ provider: "anthropic", model: "claude-sonnet-4-6" }],
    },
    hinglish: {
      provider: "openai",
      model: "gpt-4o",
      fallbackChain: [{ provider: "anthropic", model: "claude-sonnet-4-6" }],
    },
  },
  creative_generate: {
    en: {
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
    hi: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
    hinglish: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
  },
  competitor_analyze: {
    en: {
      provider: "openai",
      model: "gpt-4o",
      fallbackChain: [{ provider: "anthropic", model: "claude-sonnet-4-6" }],
    },
    hi: {
      provider: "openai",
      model: "gpt-4o",
      fallbackChain: [{ provider: "anthropic", model: "claude-sonnet-4-6" }],
    },
    hinglish: {
      provider: "openai",
      model: "gpt-4o",
      fallbackChain: [{ provider: "anthropic", model: "claude-sonnet-4-6" }],
    },
  },
  growth_plan: {
    en: {
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
    hi: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
    hinglish: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
  },
  policy_check: {
    en: {
      provider: "openai",
      model: "gpt-4o-mini",
      fallbackChain: [{ provider: "anthropic", model: "claude-haiku-4-5-20251001" }],
    },
    hi: {
      provider: "openai",
      model: "gpt-4o-mini",
      fallbackChain: [],
    },
    hinglish: {
      provider: "openai",
      model: "gpt-4o-mini",
      fallbackChain: [],
    },
  },
  translate: {
    en: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
    hi: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
    hinglish: {
      provider: "google",
      model: "gemini-2.0-flash",
      fallbackChain: [{ provider: "openai", model: "gpt-4o" }],
    },
  },
};

export class ModelSelector {
  select(task: TaskType, language: Language = "en"): ModelSelection {
    return SELECTION_MATRIX[task][language];
  }
}
