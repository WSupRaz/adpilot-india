import { ZodSchema, ZodError } from "zod";
import { AppError } from "../../lib/errors";

export class ResponseValidator {
  static validate<T>(content: string, schema: ZodSchema<T>): T {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch {
          throw new AppError(422, "AI_RESPONSE_PARSE_ERROR", "AI returned invalid JSON");
        }
      } else {
        throw new AppError(422, "AI_RESPONSE_PARSE_ERROR", "AI returned non-JSON response");
      }
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new AppError(
        422,
        "AI_RESPONSE_SCHEMA_ERROR",
        "AI response did not match expected schema",
        result.error.flatten()
      );
    }

    return result.data;
  }
}
