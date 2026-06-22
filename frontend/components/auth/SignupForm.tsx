"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupValues) {
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/register", data);
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        email: data.email,
        password: data.password,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      {(["fullName", "email", "password"] as const).map((field) => (
        <div key={field} className="space-y-1">
          <label className="text-sm font-medium capitalize">
            {field === "fullName" ? "Full Name" : field}
          </label>
          <input
            {...form.register(field)}
            type={field === "password" ? "password" : field === "email" ? "email" : "text"}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {form.formState.errors[field] && (
            <p className="text-xs text-destructive">{form.formState.errors[field]?.message}</p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
      >
        {loading ? "Creating account..." : "Create Free Account"}
      </button>
    </form>
  );
}
