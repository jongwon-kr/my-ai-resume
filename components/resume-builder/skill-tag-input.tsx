"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { POPULAR_SKILLS, PROFICIENCY_OPTIONS } from "@/lib/resume/schema";
import type { SkillFormItem } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

interface SkillTagInputProps {
  skills: SkillFormItem[];
  onChange: (skills: SkillFormItem[]) => void;
  onBlur?: () => void;
}

export function SkillTagInput({
  skills,
  onChange,
  onBlur,
}: SkillTagInputProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return POPULAR_SKILLS.filter(
      (skill) =>
        skill.toLowerCase().includes(normalized) &&
        !skills.some((item) => item.name.toLowerCase() === skill.toLowerCase()),
    ).slice(0, 8);
  }, [query, skills]);

  function addSkill(name: string, proficiency = "") {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    if (
      skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setQuery("");
      return;
    }

    onChange([...skills, { name: trimmed, proficiency }]);
    setQuery("");
    setShowSuggestions(false);
  }

  function removeSkill(index: number) {
    onChange(skills.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateProficiency(index: number, proficiency: string) {
    onChange(
      skills.map((skill, itemIndex) =>
        itemIndex === index ? { ...skill, proficiency } : skill,
      ),
    );
  }

  return (
    <div className="space-y-4" onBlur={onBlur}>
      <div className="relative">
        <Input
          value={query}
          placeholder="기술 검색 또는 입력 후 Enter"
          onFocus={() => setShowSuggestions(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill(query);
            }
          }}
        />
        {showSuggestions && suggestions.length > 0 ? (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-background shadow-sm">
            {suggestions.map((skill) => (
              <li key={skill}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {POPULAR_SKILLS.slice(0, 10).map((skill) => (
          <button
            key={skill}
            type="button"
            className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
            onClick={() => addSkill(skill)}
          >
            + {skill}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div
            key={`${skill.name}-${index}`}
            className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
          >
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm",
                !skill.name && "text-muted-foreground",
              )}
            >
              {skill.name || "기술명"}
              <button
                type="button"
                aria-label={`${skill.name} 삭제`}
                onClick={() => removeSkill(index)}
              >
                <X className="size-3.5" />
              </button>
            </span>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
              value={skill.proficiency ?? ""}
              onChange={(event) => updateProficiency(index, event.target.value)}
            >
              <option value="">숙련도 (선택)</option>
              {PROFICIENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
