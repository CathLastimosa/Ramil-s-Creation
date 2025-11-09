"use client";

import { useState, useId, KeyboardEvent, ChangeEvent } from "react";

export interface Tag {
  id: string;
  text: string;
}

interface TagInputProps {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  placeholder?: string;
  ariaInvalid?: boolean;
}

export default function TagInput({ tags, setTags, placeholder, ariaInvalid }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const id = useId();

  const addTag = (text: string) => {
    if (!text.trim()) return;
    const newTag: Tag = { id: `${text}-${Date.now()}`, text };
    setTags([...tags, newTag]);
    setInputValue("");
  };

  const removeTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag
      removeTag(tags[tags.length - 1].id);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="border rounded-md p-1 flex flex-wrap gap-1 items-center w-full" aria-invalid={ariaInvalid}>
      {tags.map((tag) => (
        <div key={tag.id} className="bg-secondary text-red-900 px-2 py-1 rounded flex items-center gap-1 text-sm">
          {tag.text}
          <button
            type="button"
            className="text-red-900 hover:text-gray-900 font-bold"
            onClick={() => removeTag(tag.id)}
          >
            ×
          </button>
        </div>
      ))}
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-[80px] outline-none px-2 py-1 text-sm"
      />
    </div>
  );
}
