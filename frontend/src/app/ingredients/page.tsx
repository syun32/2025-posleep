'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SwitchSmall from '@/components/ui/SwitchSmall';
import { ingredientIcon } from '@/utils/IngrredientIcon';
import { ApiResponse } from "@/types/api"

type Ingredient = {
    id: number;
    name: string;
    isRegistered: boolean;
    quantity: number;
    targetQuantity: number;
};

type IngredientFormReq = { rows: Ingredient[] };

type StatusFilter = 'all' | 'registered' | 'unregistered';
type SortKey = 'id' | 'name' | 'quantity' | 'registered';
type SortDir = 'asc' | 'desc';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? '/api';

export default function IngredientsPage() {
    const [items, setItems] = useState<Ingredient[]>([]);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 필터/정렬 상태
    const [status, setStatus] = useState<StatusFilter>('registered');
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // 목록 조회
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${BASE}/ingredients`, { cache: 'no-store' });
                if (!res.ok) throw new Error();
                const json: ApiResponse<Ingredient[]> = await res.json();
                const data: Ingredient[] = json.data;
                setItems(data);
            } catch {
                setMsg({ type: 'error', text: '목록을 불러오지 못했어요.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 요약
    const totalCount = items.length;
    const registeredCount = items.filter(i => i.isRegistered).length;

    // 유틸: 문자열 비교(한글/영문 섞여도 안전)
    const strCmp = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });

    // 필터 + 정렬 결과
    const viewRows = useMemo(() => {
        let arr = items.filter(it => {
            const matchStatus =
                status === 'all' ||
                (status === 'registered' && it.isRegistered) ||
                (status === 'unregistered' && !it.isRegistered);
            return matchStatus;
        });

        arr = [...arr].sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'id':
                    cmp = a.id - b.id;
                    break;
                case 'name':
                    cmp = strCmp(a.name, b.name);
                    break;
                case 'quantity':
                    cmp = (a.quantity ?? 0) - (b.quantity ?? 0);
                    break;
                case 'registered':
                    cmp = Number(a.isRegistered) - Number(b.isRegistered);
                    break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return arr;
    }, [items, status, sortKey, sortDir]);

    // 상태 변경
    const toggleRegistered = (indexInView: number) => {
        const targetId = viewRows[indexInView].id;
        setItems(prev =>
            prev.map(it =>
                it.id === targetId
                    ? { ...it, isRegistered: !it.isRegistered }
                    : it
            )
        );
    };

    const changeQtyById = (id: number, nextQty: number) => {
        setItems(prev => prev.map(it => (it.id === id ? { ...it, quantity: Math.max(0, nextQty) } : it)));
    };
    const incQty = (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        changeQtyById(id, (item.quantity ?? 0) + 1);
    };
    const decQty = (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        changeQtyById(id, (item.quantity ?? 0) - 1);
    };

    // JSON 본문 생성
    const buildJsonBody = (): IngredientFormReq => ({
        rows: items.map(it => ({
            id: it.id,
            name: it.name,
            isRegistered: it.isRegistered,
            quantity: it.quantity ?? 0,
            targetQuantity: it.targetQuantity ?? 0,
        })),
    });

    // 저장
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setSaving(true);
        try {
            const body = buildJsonBody();
            const res = await fetch(`${BASE}/ingredients/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            setMsg({ type: 'success', text: '저장되었습니다.' });
        } catch {
            setMsg({ type: 'error', text: '저장에 실패했습니다.' });
        } finally {
            setSaving(false);
        }
    };

    const resetControls = () => {
        setStatus('registered');
        setSortKey('id');
        setSortDir('asc');
    };

    return (
        <main className="mx-auto max-w-xl p-6">
            {/* 상단 요약 + 저장 버튼 */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">식재료</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        총 {totalCount}개 · 등록 {registeredCount}개 · 표시 {viewRows.length}개
                    </p>
                </div>
                <button
                    form="ingredients-form"
                    type="submit"
                    disabled={saving || loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v14l7-3l7 3V5a2 2 0 0 0-2-2" />
                        </svg>
                    )}
                    저장
                </button>
            </div>

            {/* 메시지 배너 */}
            {msg && (
                <div
                    className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                >
                    {msg.text}
                </div>
            )}

            {/* 카드 */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* 검색/필터/정렬 바 */}
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        {/* 필터 */}
                        <div className="sm:w-40">
                            <label className="mb-1 block text-xs font-medium text-gray-600">상태</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="all">전체</option>
                                <option value="registered">등록</option>
                                <option value="unregistered">미등록</option>
                            </select>
                        </div>
                        {/* 정렬 */}
                        <div className="sm:w-56">
                            <label className="mb-1 block text-xs font-medium text-gray-600">정렬</label>
                            <div className="flex gap-2">
                                <select
                                    value={sortKey}
                                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="id">번호</option>
                                    <option value="name">이름</option>
                                    <option value="quantity">수량</option>
                                    <option value="registered">등록여부</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                                    title={sortDir === 'asc' ? '오름차순' : '내림차순'}
                                    aria-label="정렬 방향"
                                >
                                    {sortDir === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 초기화 */}
                    <div className="shrink-0">
                        <button
                            type="button"
                            onClick={resetControls}
                            className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                        >
                            초기화
                        </button>
                    </div>
                </div>

                {/* 리스트/테이블 */}
                {loading ? (
                    <div className="flex items-center justify-center p-12 text-gray-500">
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                        불러오는 중…
                    </div>
                ) : viewRows.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">조건에 맞는 항목이 없어요.</div>
                ) : (
                    <form id="ingredients-form" onSubmit={onSubmit}>
                        <div className="overflow-hidden">
                            <table className="w-full table-fixed border-separate border-spacing-0">
                                <thead className="sticky top-0 z-10 bg-gray-50">
                                    <tr className="text-left text-sm text-gray-500">
                                        <th className="w-10 border-b border-gray-200 px-4 py-2">No.</th>
                                        <th className="w-30 border-b border-gray-200 px-4 py-2 text-center">등록여부</th>
                                        <th className="border-b border-gray-200 px-4 py-2">식재료명</th>
                                        <th className="w-44 border-b border-gray-200 px-4 py-2 text-center">보유수량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewRows.map((it, viewIdx) => (
                                        <tr key={it.id} className="group hover:bg-gray-50/70 [&>td]:border-b [&>td]:border-gray-100">
                                            <td className="px-4 py-1 text-sm text-gray-700">
                                                <span>{it.id}</span>
                                            </td>

                                            {/* 등록여부 토글 */}
                                            <td className="px-4 py-1 text-center">
                                                <SwitchSmall
                                                    checked={it.isRegistered}
                                                    onChange={() => toggleRegistered(viewIdx)}
                                                    label="캠프 여부"
                                                />
                                            </td>
                                            <td className="px-4 py-1 text-sm font-medium text-gray-800">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={`/icons/${ingredientIcon(it.name)}`}
                                                            alt={it.name}
                                                            width={20}
                                                            height={20}
                                                        />
                                                        <span>{it.name}</span>
                                                    </div>
                                                    {it.targetQuantity && (
                                                        <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                                                            <span className={it.quantity >= it.targetQuantity ? "text-blue-300" : "text-red-300"}>
                                                                {it.quantity - it.targetQuantity}
                                                            </span>
                                                            <span className="text-gray-500">/ {it.targetQuantity}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>


                                            {/* 수량 스텝퍼 */}
                                            <td className="px-4 py-1">
                                                <div className="mx-auto flex w-[140px] items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => decQty(it.id)}
                                                        disabled={!it.isRegistered || (it.quantity ?? 0) <= 0}
                                                        className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="수량 감소"
                                                        title="수량 -1"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={it.quantity ?? 0}
                                                        onChange={(e) => changeQtyById(it.id, Number(e.target.value))}
                                                        readOnly={!it.isRegistered}
                                                        className={`h-9 w-16 rounded-lg border text-center text-sm outline-none focus:ring-2 ${it.isRegistered
                                                            ? 'border-gray-300 focus:border-gray-900 text-black focus:ring-gray-200'
                                                            : 'border-gray-200 bg-gray-100 text-gray-500'
                                                            }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => incQty(it.id)}
                                                        disabled={!it.isRegistered}
                                                        className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="수량 증가"
                                                        title="수량 +1"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 하단 바 */}
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4">
                            <p className="text-sm text-gray-500">등록된 항목만 수량을 수정할 수 있어요.</p>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                                        <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v14l7-3l7 3V5a2 2 0 0 0-2-2" />
                                    </svg>
                                )}
                                저장
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* 플로팅 버튼 (Recipes 페이지로 이동) */}
            <Link
                href="/recipes"
                className="fixed bottom-10 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition hover:bg-gray-700"
                title="레시피 페이지로 이동"
            >
                <Image src="/icons/recipe.png" alt="레시피" width={40} height={40} />
            </Link>
        </main>
    );
}
