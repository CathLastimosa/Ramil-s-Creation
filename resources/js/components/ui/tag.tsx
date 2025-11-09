"use client"

import { useId, useState } from "react"
// import { Tag, TagInput } from "emblor"
import { Label } from "@/components/ui/label"
import TagInput, { Tag } from "@/components/ui/tag-input"; // path to the above component
export type { Tag } from "./tag-input";

interface TagsProps {
  value: Tag[];
  onChange: (newTags: Tag[]) => void;
  ariaInvalid?: boolean;
}

export default function Tags({ value, onChange, ariaInvalid }: TagsProps) {
  return (
    <div className="space-y-2">
      <TagInput
        tags={value}
        setTags={onChange}
        placeholder="Type and press enter"
        ariaInvalid={ariaInvalid}
      />
      <p className="text-gray-500 text-xs mt-1">
        You can select provided purpose below.
      </p>
    </div>
  );
}
