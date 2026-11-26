import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-pink">404</p>
        <h1 className="mt-3 text-5xl font-semibold">Page not found</h1>
        <p className="mt-3 text-mist">This node doesn’t exist in the ecosystem.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-pink px-6 py-3 font-medium text-ink">Back home</Link>
      </div>
    </main>
  );
}
