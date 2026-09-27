"use client";

import { Popover } from "@base-ui/react/popover";
import { format, parseISO, subDays } from "date-fns";
import { arEG, enUS } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ISO = "yyyy-MM-dd";
const now = () => new Date();

export function DateRangePicker({ from, to }: { from: string; to: string }) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({ from: parseISO(from), to: parseISO(to) });
  const dfLocale = locale === "ar" ? arEG : enUS;

  const go = (f: Date, tt: Date) => {
    router.push({ pathname, query: { from: format(f, ISO), to: format(tt, ISO) } });
  };

  const presets = [
    { key: "last7", days: 7 },
    { key: "last30", days: 30 },
    { key: "last90", days: 90 },
  ] as const;

  const today = now();
  const label = `${format(parseISO(from), "d MMM yyyy", { locale: dfLocale })} – ${format(parseISO(to), "d MMM yyyy", {
    locale: dfLocale,
  })}`;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("range")}>
      {presets.map((p) => {
        const f = format(subDays(today, p.days - 1), ISO);
        const active = from === f && to === format(today, ISO);
        return (
          <button
            key={p.key}
            type="button"
            aria-pressed={active}
            onClick={() => go(subDays(today, p.days - 1), today)}
            className={cn(
              "min-h-10 rounded-full border-[1.5px] border-line px-4 text-sm font-bold transition-colors hover:border-gold",
              active && "border-ink bg-ink text-bg hover:border-ink",
            )}
          >
            {t(p.key)}
          </button>
        );
      })}

      <Popover.Root open={open} onOpenChange={(o: boolean) => setOpen(o)}>
        <Popover.Trigger className="inline-flex min-h-10 items-center gap-2 rounded-full border-[1.5px] border-line bg-card px-4 text-sm font-semibold hover:border-gold">
          <CalendarDays className="size-4" aria-hidden />
          <span dir="auto">{label}</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8} align="end">
            <Popover.Popup className="z-50 rounded-2xl border border-line bg-card p-3 shadow-card">
              <Popover.Title className="px-1 pb-1 text-sm font-bold">{t("pickRange")}</Popover.Title>
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                locale={dfLocale}
                dir={locale === "ar" ? "rtl" : "ltr"}
                disabled={{ after: today }}
                numberOfMonths={1}
                defaultMonth={range?.from}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={!range?.from}
                  onClick={() => {
                    if (!range?.from) return;
                    go(range.from, range.to ?? range.from);
                    setOpen(false);
                  }}
                  className="min-h-9 rounded-full bg-gold px-5 text-sm font-bold text-ink disabled:opacity-50"
                >
                  OK
                </button>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
