import Link from "next/link";

// Shown for URLs outside /ar and /en that the proxy could not localise
export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="grid min-h-dvh place-items-center bg-bg p-6 text-center text-ink">
        <div>
          <h1 className="text-3xl font-bold">404</h1>
          <p className="mt-2">الصفحة غير موجودة · Page not found</p>
          <Link href="/ar" className="mt-6 inline-block rounded-full bg-gold px-6 py-3 font-bold">
            مقهى العطور
          </Link>
        </div>
      </body>
    </html>
  );
}
