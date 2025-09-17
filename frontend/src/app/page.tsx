import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome to Posleep</h1>

      <div className="flex gap-4">
        <Link
          href="/recipes"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Recipes
        </Link>
        <Link
          href="/ingredients"
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Ingredients
        </Link>
      </div>
    </main>
  );
}
