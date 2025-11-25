"use client";

import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const logout = () => {
        clearToken();
        alert("로그아웃되었습니다.");
        router.replace("/login");
    };

    return (
        <button
            className="text-xs text-gray-500 hover:text-red-500 transition"
            onClick={logout}
        >
            로그아웃
        </button>
    );
}
