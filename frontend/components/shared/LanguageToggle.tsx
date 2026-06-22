"use client";

import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हि" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function LanguageToggle() {
  const [lang, setLang] = useState<LanguageCode>("en");

  return (
    <div className="flex rounded-full border text-xs overflow-hidden">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-3 py-1 font-medium transition-colors ${
            lang === code
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
