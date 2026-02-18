import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">
        <Link href="/sign-in">App</Link>
      </h1>
    </div>
  );
}
