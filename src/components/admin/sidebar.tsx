"use client";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareHeart,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/admin";

const ITEMS = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", key: "orders", icon: ShoppingCart },
  { href: "/admin/products", key: "products", icon: Package },
  { href: "/admin/coupons", key: "coupons", icon: Tag },
  { href: "/admin/suggestions", key: "suggestions", icon: MessageSquareHeart },
  { href: "/admin/settings", key: "settings", icon: Settings, adminOnly: true },
  { href: "/admin/team", key: "team", icon: Users, adminOnly: true },
] as const;

export function AdminSidebar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const items = ITEMS.filter((i) => !("adminOnly" in i && i.adminOnly) || user.role === "ADMIN");

  const nav = (
    <nav aria-label={t("brand")} className="grid gap-1">
      {items.map(({ href, key, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-semibold text-on-dark transition-colors hover:bg-bg/8 hover:text-bg",
            isActive(href) && "bg-gold text-ink hover:bg-gold hover:text-ink",
          )}
        >
          <Icon className="size-5" aria-hidden />
          {t(`nav.${key}`)}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-auto grid gap-3 border-t border-line-dark pt-4">
      <div className="text-sm">
        <div className="font-bold text-bg">{user.name}</div>
        <div className="truncate text-on-dark" dir="ltr">
          {user.email}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {(["ar", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={locale === l}
            onClick={() => router.replace(pathname, { locale: l })}
            className={cn(
              "min-h-8 rounded-full border border-line-dark px-3 text-xs font-extrabold text-on-dark",
              locale === l && "border-gold bg-gold text-ink",
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}
        <Link href="/" className="ms-auto inline-flex items-center gap-1.5 text-xs text-on-dark hover:text-gold">
          <Store className="size-4" aria-hidden />
          {t("viewSite")}
        </Link>
      </div>
      <form action={logoutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-dark hover:bg-bg/8 hover:text-bg"
        >
          <LogOut className="size-4" aria-hidden />
          {t("logout")}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 text-bg lg:hidden">
        <span className="font-display text-lg font-semibold">{t("brand")}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          aria-label={t("brand")}
          className="grid size-10 place-items-center rounded-full border border-line-dark"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      <aside
        id="admin-drawer"
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-[270px] flex-col gap-6 bg-ink p-5 text-bg transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh",
          !open && "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        <div>
          <div className="text-xl font-bold">مقهى العطور</div>
          <div className="text-[.7rem] font-semibold tracking-[.4em] text-gold">PERFUME CAFÉ</div>
        </div>
        {nav}
        {footer}
      </aside>
      {open && (
        <button
          type="button"
          aria-label="close"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
        />
      )}
    </>
  );
}
