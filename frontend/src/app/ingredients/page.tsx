'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SwitchSmall from '@/components/ui/SwitchSmall';
import { ingredientIcon } from '@/utils/IngrredientIcon';
import { ApiResponse } from "@/types/api"
import { apiFetch } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';

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

export default function IngredientsPage() {
    const [items, setItems] = useState<Ingredient[]>([]);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 필터/정렬 상태
    const [status, setStatus] = useState<StatusFilter>('registered');
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // ocr
    const [ocrOpen, setOcrOpen] = useState(false);
    const [ocrUploading, setOcrUploading] = useState(false);
    const [ocrFile, setOcrFile] = useState<File | null>(null);
    const [ocrPreview, setOcrPreview] = useState<string | null>(null);


    // 목록 조회
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await apiFetch("/ingredients");
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
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

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

    // 수량 input에서 Tab/Shift+Tab 처리 → 다음/이전 수량 input으로 이동
    const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Tab' || e.ctrlKey || e.metaKey) return;

        e.preventDefault();
        const visibleQtyInputs = Array.from(
            document.querySelectorAll<HTMLInputElement>('.qty-input')
        ).filter(el => el.offsetParent !== null);

        const cur = e.currentTarget;
        const i = visibleQtyInputs.indexOf(cur);
        if (i === -1) return;

        const next = e.shiftKey
            ? visibleQtyInputs[i - 1] ?? visibleQtyInputs[visibleQtyInputs.length - 1]
            : visibleQtyInputs[i + 1] ?? visibleQtyInputs[0];

        next?.focus();
        next?.select();
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

    /* ---- [OCR] start ---- */
    const onPickOcrFile = (f?: File) => {
        if (!f) return;
        setOcrFile(f);
        setOcrPreview(URL.createObjectURL(f));
    }

    const callOcr = async () => {
        if (!ocrFile || ocrUploading) return;
        try {
            setOcrUploading(true);
            const form = new FormData();
            form.append("image", ocrFile);
            const res = await apiFetch("/ingredients/ocr", {
                method: "POST",
                body: form,
            });
            if (!res.ok) throw new Error("OCR Failed");
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("이미지 업로드에 실패했어요. 다시 시도해주세요.");
            setOcrUploading(false);
        }
    }
    /* ---- [OCR] end ---- */

    // 저장
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setSaving(true);
        try {
            const body = buildJsonBody();
            const res = await apiFetch("/ingredients/update", {
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
        <main className="mx-auto p-4 sm:p-6 w-full max-w-[650px]">
            {/* 상단 요약 + 업로드/저장 버튼 */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">식재료</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        총 {totalCount}가지 · 등록 {registeredCount}가지 · 총 보유수량 {totalQuantity}개
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* 업로드 버튼 */}
                    <button
                        type="button"
                        onClick={() => setOcrOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-700 px-4 py-2 text-white shadow-sm transition hover:bg-gray-50"
                        title="OCR 업로드"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                            <path fill="currentColor" d="M19 15v4H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4zM11 16h2V8l3.5 3.5l1.42-1.42L12 4.66L7.08 10.08L8.5 11.5L11 9z" />
                        </svg>
                        업로드
                    </button>
                    {/* 저장 버튼 */}
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
                        <section className="cq">

                            {/* ===== 모바일: 카드 리스트 (컨테이너 폭 기준) ===== */}
                            <ul className="cq-mobile divide-y">
                                {viewRows.map((it, viewIdx) => (
                                    <li key={it.id} className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="shrink-0">
                                                <SwitchSmall
                                                    checked={it.isRegistered}
                                                    onChange={() => toggleRegistered(viewIdx)}
                                                    label="등록여부"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Image
                                                        src={`/icons/${ingredientIcon(it.name)}`}
                                                        alt={it.name}
                                                        width={24}
                                                        height={24}
                                                        className="shrink-0"
                                                    />
                                                    <p className="min-w-0 truncate [word-break:keep-all] text-sm text-black font-medium">
                                                        {it.name}
                                                    </p>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-4 text-xs text-gray-400 whitespace-nowrap">
                                                    <span>No. {it.id}</span>
                                                    {it.targetQuantity != null && (
                                                        <span className="flex items-center gap-1">
                                                            (
                                                            <span className={it.quantity >= it.targetQuantity ? "text-blue-400" : "text-red-400"}>
                                                                {it.quantity - it.targetQuantity}
                                                            </span>
                                                            <span>/ {it.targetQuantity}</span>
                                                            )
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
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
                                                    onKeyDown={handleQtyKeyDown}
                                                    className={`qty-input h-9 w-16 rounded-lg border text-center text-sm outline-none focus:ring-2 ${it.isRegistered
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
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* ===== 데스크톱: 테이블 (컨테이너 폭 기준) ===== */}
                            <div className="cq-desktop overflow-x-auto">
                                <table className="w-full table-auto border-separate border-spacing-0">
                                    <thead className="sticky top-0 z-10 bg-gray-50">
                                        <tr className="text-left text-sm text-gray-500">
                                            <th className="w-14 border-b border-gray-200 px-4 py-2 whitespace-nowrap">No.</th>
                                            <th className="w-20 border-b border-gray-200 px-4 py-2 text-center whitespace-nowrap">등록여부</th>
                                            <th className="border-b border-gray-200 px-4 py-2 whitespace-nowrap">식재료명</th>
                                            <th className="w-48 border-b border-gray-200 px-4 py-2 text-center whitespace-nowrap">보유수량</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewRows.map((it, viewIdx) => (
                                            <tr key={it.id} className="group hover:bg-gray-50/70 [&>td]:border-b [&>td]:border-gray-100">
                                                <td className="px-4 py-1 text-sm text-gray-700">{it.id}</td>

                                                <td className="px-4 py-1 text-center">
                                                    <SwitchSmall
                                                        checked={it.isRegistered}
                                                        onChange={() => toggleRegistered(viewIdx)}
                                                        label="등록여부"
                                                        size="sm"
                                                    />
                                                </td>

                                                {/* 식재료명: 좌(아이콘+이름) / 우(차이/목표) */}
                                                <td className="px-4 py-1 text-sm font-medium text-gray-800">
                                                    <div className="flex items-center justify-between min-w-0">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Image
                                                                src={`/icons/${ingredientIcon(it.name)}`}
                                                                alt={it.name}
                                                                width={20}
                                                                height={20}
                                                                className="shrink-0"
                                                            />
                                                            <span className="truncate min-w-0 [word-break:keep-all]">{it.name}</span>
                                                        </div>
                                                        {it.targetQuantity != null && (
                                                            <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                                                                <span className={it.quantity >= it.targetQuantity ? "text-blue-300" : "text-red-300"}>
                                                                    {it.quantity - it.targetQuantity}
                                                                </span>
                                                                <span className="text-gray-500">/ {it.targetQuantity}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-1">
                                                    <div className="mx-auto flex w-[180px] items-center justify-center gap-2">
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
                                                            onKeyDown={handleQtyKeyDown}
                                                            className={`qty-input h-9 w-16 rounded-lg border text-center text-sm outline-none focus:ring-2 ${it.isRegistered
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

                        </section>


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
                        <div className="flex flex-col items-center p-4">
                            <LogoutButton />
                        </div>
                    </form>
                )}

                {/* 플로팅 버튼 */}
                <div className="fixed bottom-10 left-6">
                    <Link
                        href="/"
                        className="fixed bottom-28 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition hover:bg-gray-700"
                        title="홈 페이지로 이동"
                    >
                        <Image src="/icon.ico" alt="홈" width={30} height={30} />
                    </Link>

                    <Link
                        href="/recipes"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition hover:bg-gray-700"
                        title="레시피 페이지로 이동"
                    >
                        <Image src="/icons/recipe.png" alt="레시피" width={40} height={40} />
                    </Link>
                </div>
            </div>

            {/* OCR 업로드 모달 */}
            {ocrOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => !ocrUploading && setOcrOpen(false)} />
                    <div className="relative z-10 w-[min(92vw,560px)] rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-lg text-gray-700 font-semibold">이미지 업로드</h2>
                            <button
                                onClick={() => !ocrUploading && setOcrOpen(false)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                                aria-label="닫기"
                                disabled={ocrUploading}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block">
                                <div className="flex items-center gap-3">
                                    <input
                                        id="ocr-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onPickOcrFile(e.target.files?.[0] ?? undefined)}
                                        className="hidden"
                                        disabled={ocrUploading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("ocr-file-input")?.click()}
                                        disabled={ocrUploading}
                                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        파일 선택
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        {ocrFile ? ocrFile.name : "선택된 파일 없음"}
                                    </span>
                                </div>
                            </label>


                            {ocrPreview && (
                                <div className="rounded-xl border bg-gray-50 p-2">
                                    <img src={ocrPreview} alt="preview" className="mx-auto max-h-72 rounded-md" />
                                </div>
                            )}

                            <span className="block text-xs text-gray-400">이미지를 업로드하여 재료 수량을 업데이트합니다.</span>
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={callOcr}
                                    disabled={!ocrFile || ocrUploading}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {ocrUploading ? (
                                        <>
                                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            업로드/분석 중…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                                                <path fill="currentColor" d="M5 20h14v-2H5v2M19 8h-4V2H9v6H5l7 7l7-7z" />
                                            </svg>
                                            업로드/분석
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main >
    );
}
