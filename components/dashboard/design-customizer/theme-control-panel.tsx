"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { PRESET_TOKENS } from "@/lib/theme/css-vars";
import {
  AVATAR_SHAPES,
  CARD_STYLES,
  HEADER_STYLES,
  THEME_FONTS,
  THEME_PRESETS,
  type ThemeConfig,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

interface ThemeControlPanelProps {
  value: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
}

const PRESET_LABELS: Record<(typeof THEME_PRESETS)[number], string> = {
  "modern-slate": "모던 슬레이트",
  "dark-developer": "다크 디벨로퍼",
  "warm-minimal": "웜 미니멀",
  "creative-bold": "크리에이티브 볼드",
  "executive-classic": "이그제큐티브 클래식",
};

const FONT_LABELS: Record<(typeof THEME_FONTS)[number], string> = {
  pretendard: "Pretendard",
  "plex-sans": "IBM Plex Sans KR",
  myeongjo: "나눔명조",
};

const AVATAR_LABELS: Record<(typeof AVATAR_SHAPES)[number], string> = {
  circle: "원형",
  rounded: "둥근 사각",
  square: "각진 사각",
};

const CARD_LABELS: Record<(typeof CARD_STYLES)[number], string> = {
  bordered: "테두리",
  elevated: "그림자",
  flat: "플랫",
};

const HEADER_LABELS: Record<(typeof HEADER_STYLES)[number], string> = {
  compact: "좁게",
  spacious: "넓게",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

/** Segmented choice — one row of pills, no new UI primitive needed. */
function OptionRow<T extends string>({
  options,
  labels,
  value,
  onSelect,
  name,
}: {
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onSelect: (next: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          onClick={() => onSelect(option)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            option === value
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "hover:bg-muted",
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Swatch + hex field.
 *
 * The text input keeps its own draft because a half-typed `#2` is not a colour:
 * committing only complete values keeps the preview stable, and holding the
 * draft locally is what lets the user type at all — echoing the theme value
 * back would snap every keystroke away.
 */
function AccentColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // Adjusting during render rather than in an effect: React re-runs this
  // component before touching the DOM, so the draft follows a theme change made
  // elsewhere (preset swatch, 되돌리기, save) without an extra commit.
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="포인트 색상 선택"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="size-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
      />
      <Input
        value={draft}
        aria-label="포인트 색상 hex 코드"
        spellCheck={false}
        autoComplete="off"
        placeholder="#2563EB"
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (HEX_COLOR.test(next.trim())) {
            onChange(next.trim());
          }
        }}
        onBlur={() => setDraft(value)}
      />
    </div>
  );
}

export function ThemeControlPanel({ value, onChange }: ThemeControlPanelProps) {
  const set = <K extends keyof ThemeConfig>(key: K, next: ThemeConfig[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-6">
      <Field label="테마 프리셋">
        <div className="grid grid-cols-2 gap-3">
          {THEME_PRESETS.map((preset) => {
            const tokens = PRESET_TOKENS[preset];
            const selected = preset === value.preset;

            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                onClick={() => set("preset", preset)}
                className={cn(
                  "group rounded-lg border p-2 text-left transition-colors",
                  selected
                    ? "border-primary ring-2 ring-primary/30"
                    : "hover:bg-muted",
                )}
              >
                {/* Swatch painted from the preset's own tokens, so the card
                    cannot drift from what the preset actually renders. */}
                <span
                  aria-hidden
                  className="flex h-14 items-end gap-1 rounded-md border p-2"
                  style={{
                    backgroundColor: tokens["--background"],
                    borderColor: tokens["--border"],
                  }}
                >
                  <span
                    className="h-2 w-8 rounded-full"
                    style={{ backgroundColor: value.accentColor }}
                  />
                  <span
                    className="h-2 w-5 rounded-full"
                    style={{ backgroundColor: tokens["--muted-foreground"] }}
                  />
                </span>
                <span className="mt-2 flex items-center gap-1 text-xs">
                  {selected ? (
                    <Check aria-hidden className="size-3 text-primary" />
                  ) : null}
                  {PRESET_LABELS[preset]}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="포인트 색상">
        <AccentColorField
          value={value.accentColor}
          onChange={(next) => set("accentColor", next)}
        />
      </Field>

      <Field label="글꼴">
        <OptionRow
          name="글꼴"
          options={THEME_FONTS}
          labels={FONT_LABELS}
          value={value.fontFamily}
          onSelect={(next) => set("fontFamily", next)}
        />
      </Field>

      <Field label="프로필 사진 모양">
        <OptionRow
          name="프로필 사진 모양"
          options={AVATAR_SHAPES}
          labels={AVATAR_LABELS}
          value={value.avatarShape}
          onSelect={(next) => set("avatarShape", next)}
        />
      </Field>

      <Field label="카드 스타일">
        <OptionRow
          name="카드 스타일"
          options={CARD_STYLES}
          labels={CARD_LABELS}
          value={value.cardStyle}
          onSelect={(next) => set("cardStyle", next)}
        />
      </Field>

      <Field label="헤더 여백">
        <OptionRow
          name="헤더 여백"
          options={HEADER_STYLES}
          labels={HEADER_LABELS}
          value={value.headerStyle}
          onSelect={(next) => set("headerStyle", next)}
        />
      </Field>
    </div>
  );
}
