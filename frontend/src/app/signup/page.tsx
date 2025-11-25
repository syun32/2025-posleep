"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
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
            setError("비밀번호는 4자 이상 입력해주세요.");
            return;
        }
        if (password !== passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const res = await fetch(`${BASE}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password }),
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg ? msg : "회원가입에 실패했습니다.");
                return;
            }

            router.push("/login");
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
                <h1 className="text-3xl font-bold mb-10">Sign Up</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
            >
                {/* 아이디 */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">ID</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                        placeholder="아이디를 입력하세요 (3자 이상)"
                    />
                </div>

                {/* 비밀번호 */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                        placeholder="비밀번호를 입력하세요 (4자 이상)"
                    />
                </div>

                {/* 비밀번호 확인 */}
                <div className="mb-8">
                    <label className="block text-gray-700 font-medium mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        required
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                        placeholder="비밀번호를 다시 입력하세요"
                    />
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <p className="mb-4 text-red-600 text-center text-sm">{error}</p>
                )}

                {/* 회원가입 버튼 */}
                <button
                    type="submit"
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    회원가입
                </button>

                {/* 이미 계정이 있을 때 로그인으로 이동 */}
                <p className="mt-4 text-center text-sm text-gray-600">
                    이미 계정이 있으신가요?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-blue-500 hover:underline"
                    >
                        로그인 하기
                    </button>
                </p>
            </form>
        </main>
    );
}
