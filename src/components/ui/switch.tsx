"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible switch (Base UI). Works inside plain <form>s: a hidden input named `name`
 * carries "true"/"false" so Server Actions can read it with formData.get(name).
 */
export function Switch({
  name,
  defaultChecked = false,
  label,
  id,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
  id?: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const switchId = id ?? `sw-${name}`;
  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <BaseSwitch.Root
        id={switchId}
        checked={checked}
        onCheckedChange={(value: boolean) => setChecked(value)}
        aria-label={label}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-[1.5px] border-line bg-ink/10 p-0.5 transition-colors",
          "data-[checked]:border-gold data-[checked]:bg-gold focus-visible:outline-2 focus-visible:outline-gold",
        )}
      >
        <BaseSwitch.Thumb className="block size-5 rounded-full bg-card shadow transition-transform data-[checked]:translate-x-5 rtl:data-[checked]:-translate-x-5" />
      </BaseSwitch.Root>
      <label htmlFor={switchId} className="text-sm font-semibold">
        {label}
      </label>
    </div>
  );
}
