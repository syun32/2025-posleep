// lib/api.ts
import { getToken, clearToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? '/api';

export async function apiFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getToken();

    const headers = new Headers(options.headers || {});

    const isFormData = options.body instanceof FormData;

    if (!isFormData) {
        headers.set("Content-Type", headers.get("Content-Type") || "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401 || res.status === 403) {
        clearToken();
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        window.location.href = "/login";
        return res;
    }

    return res;
}
