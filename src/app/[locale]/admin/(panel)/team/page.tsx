import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { ConfirmForm } from "@/components/admin/form-bits";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { TeamForm } from "@/components/admin/team-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/server/actions/admin";

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect(`/${locale}/admin`);

  const [t, ta, users] = await Promise.all([
    getTranslations("admin.team"),
    getTranslations("admin"),
    prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true } }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel>
          <ul className="divide-y divide-line">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-bold">
                    {u.name} {u.id === session.user.id && <span className="text-sm text-ink-soft">({t("you")})</span>}
                  </div>
                  <div className="text-sm text-ink-soft" dir="ltr">
                    {u.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={u.role === "ADMIN" ? "dark" : "neutral"}>{t(u.role)}</Badge>
                  {u.id !== session.user.id && (
                    <ConfirmForm action={deleteUser} id={u.id} message={ta("confirmDelete")}>
                      <button type="submit" className={buttonVariants({ variant: "danger", size: "xs" })}>
                        {ta("delete")}
                      </button>
                    </ConfirmForm>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={t("new")}>
          <TeamForm />
        </Panel>
      </div>
    </>
  );
}
