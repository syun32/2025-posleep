// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();

    // 토큰 없으면 로그인 페이지로
    if (!token) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/icon.ico"
          alt="Posleep Logo"
          width={48}
          height={48}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">Posleep</h1>
        <p className="text-gray-600 text-sm">
          잠만보에게 무슨 요리를 해줄 수 있을까?
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-10">
        <Link
          href="/ingredients"
          className="w-full py-3 text-center rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 transition"
        >
          식재료
        </Link>

        <Link
          href="/recipes"
          className="w-full py-3 text-center rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 transition"
        >
          레시피
        </Link>
      </div>

      <LogoutButton />
    </main>
  );
}
