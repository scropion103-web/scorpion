import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-transparent font-bold leading-tight whitespace-nowrap transition-[background,color,border-color,transform,box-shadow] duration-200 active:scale-[.97] disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold",
  {
    variants: {
      variant: {
        gold: "bg-gold text-ink hover:bg-gold-hover hover:shadow-[0_10px_24px_-12px_var(--color-gold)]",
        dark: "bg-ink text-bg hover:bg-black",
        outline: "border-ink text-ink hover:bg-ink hover:text-bg",
        outlineLight: "border-bg/50 text-bg hover:bg-bg hover:text-ink",
        ghost: "text-ink hover:bg-ink/5",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        md: "min-h-12 px-6 py-3 text-[.98rem]",
        sm: "min-h-[42px] px-4 py-2 text-sm",
        xs: "min-h-8 px-3 py-1 text-xs",
        icon: "size-[46px] rounded-full p-0",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
