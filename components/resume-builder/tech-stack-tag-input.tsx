"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { POPULAR_SKILLS } from "@/lib/resume/schema";

interface TechStackTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  onBlur?: () => void;
}

export function TechStackTagInput({
  tags,
  onChange,
  onBlur,
}: TechStackTagInputProps) {
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
        !tags.some((tag) => tag.toLowerCase() === skill.toLowerCase()),
    ).slice(0, 8);
  }, [query, tags]);

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    if (tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setQuery("");
      return;
    }

    onChange([...tags, trimmed]);
    setQuery("");
    setShowSuggestions(false);
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-2" onBlur={onBlur}>
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
              addTag(query);
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
                  onClick={() => addTag(skill)}
                >
                  {skill}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                aria-label={`${tag} 삭제`}
                onClick={() => removeTag(index)}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
