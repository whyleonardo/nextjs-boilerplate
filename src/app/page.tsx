import Link from "next/link";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <h1 className="font-bold text-2xl">
                <Link href="/sign-in">App</Link>
            </h1>
        </div>
    );
}
