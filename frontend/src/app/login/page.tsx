"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveToken } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? '/api';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 클라이언트 입력 검증
    if (name.trim().length < 3) {
      setError("아이디는 3자 이상 입력해주세요.");
      return;
    }
    if (password.trim().length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요");
      return;
    }

    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (!res.ok) {
        setError("아이디 또는 비밀번호를 확인하세요.");
        return;
      }

      const data = await res.json();

      saveToken(data.token);

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex flex-col items-center">
        <Image
          src="/icon.ico"
          alt="Posleep Logo"
          width={40}
          height={40}
          className="mb-5"
        />
        <h1 className="text-3xl font-bold mb-10">Login</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        {/* 이메일 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="id"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            placeholder="아이디을 입력하세요"
          />
        </div>

        {/* 비밀번호 */}
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="mb-4 text-red-600 text-center text-sm">{error}</p>
        )}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
        >
          로그인
        </button>

        {/* 회원가입 링크 */}
        <p className="mt-4 text-center text-sm text-gray-600">
          아직 계정이 없으신가요?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-blue-500 hover:underline"
          >
            회원가입 하기
          </button>
        </p>
      </form>
    </main>
  );
}
