'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SwitchSmall from '@/components/ui/SwitchSmall';
import { ingredientIcon } from '@/utils/IngrredientIcon';
import { ApiResponse } from '@/types/api';

type Recipe = {
    id: number;
    category?: string | null;
    name: string;
    isTarget: boolean;
    isRegistered: boolean;

    ingredient1?: string | null; need1?: number | null; req1?: number | null;
    ingredient2?: string | null; need2?: number | null; req2?: number | null;
    ingredient3?: string | null; need3?: number | null; req3?: number | null;
    ingredient4?: string | null; need4?: number | null; req4?: number | null;

    totalQuantity: number;
};

type PotSetting = {
    id?: number | null;
    capacity: number;
    isCamping: boolean;
    category?: string | null;
};

type ViewRecipe = Recipe & { reqTotal?: number | null };

type SaveFlagsReq = { rows: Array<Pick<Recipe, 'id' | 'isTarget' | 'isRegistered'>> };

type SortKey = 'id' | 'name' | 'total' | 'registered' | 'target' | 'reqTotal';
type SortDir = 'asc' | 'desc';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? '/api';

export default function RecipesPage() {
    const [rows, setRows] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [pot, setPot] = useState<PotSetting>({ capacity: 0, isCamping: false, category: '전체' });
    const [potSaving, setPotSaving] = useState(false);
    const [cookingId, setCookingId] = useState<number | null>(null);

    // 검색/정렬/필터
    const [q, setQ] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('target');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [cat, setCat] = useState<string>('all');
    const POT_CATEGORIES = ['전체', '카레/스튜', '샐러드', '드링크/디저트'] as const;
    const mapPotToFilter = (c?: string | null) => (!c || c === '전체') ? 'all' : c;

    // 목록 로드
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [resRecipe, resPot] = await Promise.all([
                    fetch(`${BASE}/recipes`, { cache: 'no-store' }),
                    fetch(`${BASE}/recipes/pots`, { cache: 'no-store' }),
                ]);
                if (!resRecipe.ok || !resPot.ok) throw new Error();
                const dataRecipe: ApiResponse<Recipe[]> = await resRecipe.json();
                const dataPot: ApiResponse<PotSetting> = await resPot.json();
                const rows: Recipe[] = dataRecipe.data;
                const p: PotSetting = dataPot.data;
                setRows(rows);
                const nextPot = p ?? { capacity: 0, isCamping: false, category: '전체' };
                if (!nextPot.category) nextPot.category = '전체';
                setPot(nextPot);
                setCat(mapPotToFilter(nextPot.category));
            } catch {
                setMsg({ type: 'error', text: '데이터를 불러오지 못했어요.' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const total = rows.length;
    const registered = rows.filter(r => r.isRegistered).length;
    const targetCnt = rows.filter(r => r.isTarget).length;

    // 분류 옵션(전체 + 고유값)
    const categoryOptions = useMemo(() => {
        const set = new Set<string>();
        rows.forEach(r => r.category && set.add(r.category));
        return ['all', ...Array.from(set)];
    }, [rows]);

    // 총 필요 수량 구하기
    const getReqTotal = (req1?: number | null, req2?: number | null, req3?: number | null, req4?: number | null) => {
        return (req1 ?? 0) + (req2 ?? 0) + (req3 ?? 0) + (req4 ?? 0);
    }

    const rowsWithReq: ViewRecipe[] = useMemo(() =>
        rows.map(r => ({ ...r, reqTotal: getReqTotal(r.req1, r.req2, r.req3, r.req4) }))
        , [rows]
    );

    // 문자열 비교 유틸
    const sCmp = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });

    // 검색 + 정렬 + 필터 적용
    const view: ViewRecipe[] = useMemo(() => {
        const kw = q.trim().toLowerCase();
        let arr = rowsWithReq.filter(r => {
            const matchQ =
                kw === '' ||
                r.name.toLowerCase().includes(kw) ||
                (r.category ?? '').toLowerCase().includes(kw);
            const matchCat = cat === 'all' || (r.category ?? '') === cat;
            return matchQ && matchCat;
        });

        arr = [...arr].sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'id': cmp = a.id - b.id; break;
                case 'name': cmp = sCmp(a.name, b.name); break;
                case 'total': cmp = (a.totalQuantity ?? 0) - (b.totalQuantity ?? 0); break;
                case 'registered': cmp = Number(a.isRegistered) - Number(b.isRegistered); break;
                case 'target': cmp = Number(a.isTarget) - Number(b.isTarget); break;
                case 'reqTotal': cmp = (a.reqTotal ?? 0) - (b.reqTotal ?? 0); break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return arr;
    }, [rowsWithReq, q, cat, sortKey, sortDir]);

    // 셀 클래스: req 색상
    const reqClass = (need?: number | null, req?: number | null) => {
        const n = need ?? 0;
        const r = req ?? 0;
        if (n === 0) return 'bg-gray-100 text-gray-500';
        if (r === 0) return 'bg-sky-500 text-white';
        if (r < 4) return 'bg-green-600 text-white';
        if (r < 7) return 'bg-yellow-400 text-white';
        if (r < 10) return 'bg-orange-400 text-white';
        return 'bg-red-400 text-white';
    };

    // 용량 클래스
    const capClass = (total?: number | null, cap?: number | null, isCamping?: boolean | false) => {
        const t = total ?? 0;
        let c = cap ?? 0;
        const flag = isCamping ?? false;
        if (flag) {
            c += Math.ceil(c / 2);
        }
        if (t > c * 2) return 'bg-purple-300 text-black';
        if (t > c) return 'bg-yellow-300 text-black';
        return 'bg-teal-400 text-black';
    }

    // 상태 변경
    const toggle = (id: number, field: 'isTarget' | 'isRegistered') => {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: !r[field] } : r)));
    };

    // 요리 실행
    const runCooking = async (r: Recipe) => {
        if (getReqTotal(r.req1, r.req2, r.req3, r.req4) != 0) {
            alert('재료가 부족합니다!');
            return;
        }
        if (!window.confirm('요리를 실행하시겠습니까?')) return;

        try {
            setCookingId(r.id);
            const res = await fetch(`${BASE}/recipes/cook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(r.id),
            });
            if (!res.ok) throw new Error();

            // 성공 시 새로고침
            window.location.reload();
        } catch (e) {
            alert('요리 실행에 실패했어요. 잠시 후 다시 시도해주세요.' + e);
            setCookingId(null);
        }
    };

    // 저장
    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setSaving(true);
        try {
            const body: SaveFlagsReq = {
                rows: rows.map(r => ({ id: r.id, isTarget: r.isTarget, isRegistered: r.isRegistered })),
            };
            const res = await fetch(`${BASE}/recipes/flags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();

            const data = await res.json();
            setMsg({ type: 'success', text: `${data.changed}건 저장되었습니다.` });
        } catch {
            setMsg({ type: 'error', text: '저장에 실패했어요.' });
        } finally {
            setSaving(false);
        }
    };

    const onSavePot = async () => {
        try {
            setMsg(null);
            setPotSaving(true);
            const res = await fetch(`${BASE}/recipes/pots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pot),
            });
            if (!res.ok) throw new Error();
            setMsg({ type: 'success', text: '냄비 설정이 저장되었습니다.' });
        } catch {
            setMsg({ type: 'error', text: '냄비 설정 저장에 실패했어요.' });
        } finally {
            setPotSaving(false);
        }
    };

    const resetControls = () => {
        setQ('');
        setCat(pot.category ?? 'all');
        setSortKey('target');
        setSortDir('desc');
    };

    return (
        <main className="mx-auto max-w-6xl p-5 relative">
            <section className="cq mx-auto w-full max-w-[1100px] mb-3">
                {/* ===== 모바일 : 토글 목록 ===== */}
                <div className="cq-mobile space-y-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight">레시피</h1>

                        {/* 냄비 설정 (용량/캠프/카테고리) */}
                        <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">냄비 설정</span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                                        용량 {pot.capacity ?? 0}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${pot.isCamping ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                                        캠프 {pot.isCamping ? 'ON' : 'OFF'}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                                        {pot.category ?? '전체'}
                                    </span>
                                </div>
                                <svg className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.24 4.38a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
                                </svg>
                            </summary>

                            <div className="px-3 pb-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500">냄비 용량</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={pot.capacity ?? 0}
                                            onChange={(e) => setPot(p => ({ ...p, capacity: Math.max(0, Number(e.target.value)) }))}
                                            className="h-9 rounded-xl border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2.5">
                                        <span className="text-xs text-gray-500">캠프 여부</span>
                                        <SwitchSmall size="sm" checked={pot.isCamping} onChange={() => setPot(p => ({ ...p, isCamping: !p.isCamping }))} label="캠프 여부" />
                                    </label>

                                    <label className="flex flex-col gap-1 col-span-2">
                                        <span className="text-xs text-gray-500">카테고리</span>
                                        <select
                                            value={pot.category ?? '전체'}
                                            onChange={(e) => setPot(p => ({ ...p, category: e.target.value }))}
                                            className="h-9 rounded-xl border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                                        >
                                            {POT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </label>

                                    <div className="col-span-2">
                                        <button
                                            type="button"
                                            onClick={onSavePot}
                                            disabled={potSaving}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {potSaving ? (
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-90"><path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v14l7-3l7 3V5a2 2 0 0 0-2-2" /></svg>
                                            )}
                                            저장
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* 정렬 · 필터 */}
                    <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3">
                            <span className="text-sm font-medium text-gray-900">정렬 · 필터</span>
                            <svg className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.24 4.38a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
                            </svg>
                        </summary>

                        <div className="px-3 pb-3">
                            <div className="space-y-3">
                                {/* 검색 */}
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-500">검색(요리명/분류)</span>
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="예: 카레, 샐러드…"
                                        className="h-9 rounded-xl border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                                    />
                                </label>

                                {/* 분류 / 정렬 */}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500">분류</span>
                                        <select
                                            value={cat}
                                            onChange={(e) => setCat(e.target.value)}
                                            className="h-9 rounded-xl border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                                        >
                                            {categoryOptions.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '전체' : opt}</option>)}
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500">정렬</span>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={sortKey}
                                                onChange={(e) => setSortKey(e.target.value as SortKey)}
                                                className="h-9 w-full rounded-xl border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                                            >
                                                <option value="id">번호</option>
                                                <option value="name">이름</option>
                                                <option value="total">총수량</option>
                                                <option value="registered">등록여부</option>
                                                <option value="target">목표</option>
                                                <option value="reqTotal">총필요량</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                                                className="h-9 w-9 shrink-0 rounded-xl border border-gray-300 text-gray-700"
                                                title="정렬 방향 전환"
                                            >
                                                {sortDir === 'asc' ? '↑' : '↓'}
                                            </button>
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-1">
                                    <button
                                        type="button"
                                        onClick={resetControls}
                                        className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        초기화
                                    </button>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>

                {/* ===== 데스크톱 ===== */}
                <div className="cq-desktop">
                    <div className="mb-3 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight">레시피</h1>
                        <div className="mb-3 flex items-center justify-between">

                            {/* Pot 설정 */}
                            <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">냄비 용량</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={pot.capacity ?? 0}
                                        onChange={(e) => setPot(p => ({ ...p, capacity: Math.max(0, Number(e.target.value)) }))}
                                        className="w-20 rounded-xl border border-gray-300 px-2 py-1 text-sm text-black outline-none focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 mr-2 block text-xs font-medium text-gray-600">캠프 여부</label>
                                    <SwitchSmall
                                        checked={pot.isCamping}
                                        onChange={() => setPot(p => ({ ...p, isCamping: !p.isCamping }))}
                                        label="캠프 여부"
                                        size="sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">카테고리</label>
                                    <select
                                        value={pot.category ?? '전체'}
                                        onChange={(e) => setPot(p => ({ ...p, category: e.target.value }))}
                                        className="w-30 rounded-xl border border-gray-300 px-2 py-1 text-sm text-black outline-none focus:ring-2 focus:ring-gray-200"
                                    >
                                        {POT_CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={onSavePot}
                                    disabled={potSaving}
                                    className="ml-2 inline-flex items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {potSaving ? (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-90"><path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v14l7-3l7 3V5a2 2 0 0 0-2-2" /></svg>
                                    )}
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 검색 / 정렬 / 분류 카드 */}
                    <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                            <div className="sm:w-48">
                                <label className="mb-1 block text-[11px] font-medium text-gray-600">검색(요리명/분류)</label>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="예: 카레, 샐러드…"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            <div className="sm:w-36">
                                <label className="mb-1 block text-[11px] font-medium text-gray-600">분류</label>
                                <select
                                    value={cat}
                                    onChange={(e) => setCat(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    {categoryOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt === 'all' ? '전체' : opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:w-40">
                                <label className="mb-1 block text-[11px] font-medium text-gray-600">정렬</label>
                                <div className="flex gap-2">
                                    <select
                                        value={sortKey}
                                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-gray-200"
                                    >
                                        <option value="id">번호</option>
                                        <option value="name">이름</option>
                                        <option value="total">총수량</option>
                                        <option value="registered">등록여부</option>
                                        <option value="target">목표</option>
                                        <option value="reqTotal">총필요량</option>
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
                </div>
            </section>

            {/* 저장 결과 배너 */}
            {msg && (
                <div className={`mb-3 rounded-xl border px-4 py-2 text-sm ${msg.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
                    }`}>
                    {msg.text}
                </div>
            )}

            {/* 테이블 */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center p-10 text-gray-500">
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                        불러오는 중…
                    </div>
                ) : view.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">조건에 맞는 레시피가 없어요.</div>
                ) : (
                    <form id="recipe-form" onSubmit={onSave}>
                        <div className="flex items-center justify-between px-3 py-2">
                            <p className="text-xs text-gray-500">
                                총 {total}개 · 등록 {registered}개 · 목표 {targetCnt}개 · 표시 {view.length}개
                            </p>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-600 bg-gray-600 px-3 py-1.5 text-sm text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-90">
                                        <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v14l7-3l7 3V5a2 2 0 0 0-2-2" />
                                    </svg>
                                )}
                                저장
                            </button>
                        </div>

                        <section className="cq">

                            {/* ===== 모바일: 카드 리스트 ===== */}
                            <ul className="cq-mobile space-y-2">
                                {view.map((r) => {
                                    const ings = [
                                        { name: r.ingredient1, req: r.req1, need: r.need1 },
                                        { name: r.ingredient2, req: r.req2, need: r.need2 },
                                        { name: r.ingredient3, req: r.req3, need: r.need3 },
                                        { name: r.ingredient4, req: r.req4, need: r.need4 },
                                    ].filter((x) => !!x.name);

                                    return (
                                        <li key={r.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                                            {/* (목표/등록 + 이름/카테고리)  |  (필요/총 배지) */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <SwitchSmall size="xs" checked={r.isTarget} onChange={() => toggle(r.id, 'isTarget')} label="목표" />
                                                        <span className="text-[12px] text-gray-600">목표</span>
                                                        <p className="pl-3 truncate [word-break:keep-all] text-sm font-semibold text-gray-900">{r.name}</p>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2 min-w-0">
                                                        <SwitchSmall size="xs" checked={r.isRegistered} onChange={() => toggle(r.id, 'isRegistered')} label="등록" />
                                                        <span className="text-[12px] text-gray-600">등록</span>
                                                        <p className="pl-3 truncate [word-break:keep-all] text-xs text-gray-500">{r.category ?? '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 flex-col items-end gap-1 mt-0.5">
                                                    <span className={`whitespace-nowrap w-14 text-center rounded px-2 py-0.5 text-[11px] text-gray-600 ${r.reqTotal == 0 ? "bg-teal-400" : "bg-gray-300"}`}>
                                                        필요 {r.reqTotal}
                                                    </span>
                                                    <span className={`whitespace-nowrap w-14 text-center rounded px-2 py-0.5 text-[11px] text-gray-900 ${capClass(r.totalQuantity, pot.capacity, pot.isCamping)}`}>
                                                        총 {r.totalQuantity ?? 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 재료 및 요리실행 카드 그리드 */}
                                            <div className="mt-2 grid grid-cols-5 gap-2">
                                                {ings.map((ing, i) => {
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex h-17 flex-col items-center justify-between rounded-lg p-1 ${reqClass(ing.need, ing.req)}`}
                                                        >
                                                            <Image
                                                                src={`/icons/${ingredientIcon(ing.name!)}`}
                                                                alt={ing.name!}
                                                                width={20}
                                                                height={20}
                                                                className="mt-1 bg-gray-100 rounded-full border-2 border-gray-100"
                                                            />
                                                            <span className="text-black text-[9px]">
                                                                {ing.name}
                                                            </span>
                                                            <span className="text-black text-[12px]">
                                                                {ing.req ?? 0}
                                                                <span className="text-gray-500 text-[11px]"> / {ing.need}</span>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                {/* 재료가 4개 미만이면 자리를 맞추기 위한 빈 카드 */}
                                                {Array.from({ length: Math.max(0, 4 - ings.length) }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="h-17 rounded-lg bg-gray-100" />
                                                ))}

                                                {/* 요리 실행 */}
                                                <div className="flex items-center justify-end">
                                                    {r.reqTotal === 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => runCooking(r)}
                                                            disabled={cookingId === r.id}
                                                            className="rounded-lg border border-gray-900 bg-gray-900 px-1.5 py-1.5 text-[10px] font-medium text-white disabled:opacity-60"
                                                            title="요리 실행"
                                                        >
                                                            {cookingId === r.id ? '요리중' : '요리 실행'}
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-500 px-1.5">재료 필요</span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>


                            {/* ===== 데스크톱 ===== */}
                            <div className="cq-desktop overflow-x-auto">
                                <table className="w-full table-auto border-separate border-spacing-0 text-sm">
                                    <thead className="sticky top-0 z-10 bg-gray-50">
                                        <tr className="text-left text-[12px] text-gray-500">
                                            <th className="w-12 border-b border-gray-200 px-2 py-2">No.</th>
                                            <th className="w-16 border-b border-gray-200 px-2 py-2 text-center">목표</th>
                                            <th className="w-16 border-b border-gray-200 px-2 py-2 text-center">등록</th>
                                            <th className="w-24 border-b border-gray-200 px-2 py-2">분류</th>
                                            <th className="min-w-[160px] border-b border-gray-200 px-2 py-2">요리</th>

                                            <th className="w-45 border-b border-gray-200 px-2 py-2">재료1</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">요구</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">필요</th>

                                            <th className="w-45 border-b border-gray-200 px-2 py-2">재료2</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">요구</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">필요</th>

                                            <th className="w-45 border-b border-gray-200 px-2 py-2">재료3</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">요구</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">필요</th>

                                            <th className="w-45 border-b border-gray-200 px-2 py-2">재료4</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">요구</th>
                                            <th className="w-12 border-b border-gray-200 px-1 py-2 text-center">필요</th>

                                            <th className="w-14 border-b border-gray-200 px-2 py-2 text-center">총</th>
                                            <th className="w-14 border-b border-gray-200 px-2 py-2 text-center">필요</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {view.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50/70 [&>td]:border-b [&>td]:border-gray-100">
                                                <td className="px-2 py-1 text-[13px] text-gray-700">{r.id}</td>

                                                <td className="px-2 py-1 text-center">
                                                    <SwitchSmall checked={r.isTarget} onChange={() => toggle(r.id, 'isTarget')} label="목표 여부" />
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <SwitchSmall checked={r.isRegistered} onChange={() => toggle(r.id, 'isRegistered')} label="등록 여부" />
                                                </td>

                                                <td className="px-2 py-1 text-[13px] text-gray-700">{r.category ?? '-'}</td>
                                                <td className="px-2 py-1 text-[13px] font-medium text-gray-900 whitespace-normal break-words">{r.name}</td>

                                                <td className="px-2 py-1 text-xs text-gray-700">
                                                    {r.ingredient1 ? (
                                                        <div className="flex items-center gap-0.5">
                                                            <Image src={`/icons/${ingredientIcon(r.ingredient1)}`} alt={r.ingredient1} width={18} height={18} />
                                                            <span>{r.ingredient1}</span>
                                                        </div>
                                                    ) : ('-')}
                                                </td>
                                                <td className="px-1 py-1 text-center text-xs text-gray-400">{r.need1 ?? 0}</td>
                                                <td className={`px-1 py-1 text-center text-xs rounded ${reqClass(r.need1, r.req1)}`}>{r.req1 ?? 0}</td>

                                                <td className="px-2 py-1 text-xs text-gray-700">
                                                    {r.ingredient2 ? (
                                                        <div className="flex items-center gap-0.5">
                                                            <Image src={`/icons/${ingredientIcon(r.ingredient2)}`} alt={r.ingredient2} width={18} height={18} />
                                                            <span>{r.ingredient2}</span>
                                                        </div>
                                                    ) : ('-')}
                                                </td>
                                                <td className="px-1 py-1 text-center text-xs text-gray-400">{r.need2 ?? 0}</td>
                                                <td className={`px-1 py-1 text-center text-xs rounded ${reqClass(r.need2, r.req2)}`}>{r.req2 ?? 0}</td>

                                                <td className="px-2 py-1 text-xs text-gray-700">
                                                    {r.ingredient3 ? (
                                                        <div className="flex items-center gap-0.5">
                                                            <Image src={`/icons/${ingredientIcon(r.ingredient3)}`} alt={r.ingredient3} width={18} height={18} />
                                                            <span>{r.ingredient3}</span>
                                                        </div>
                                                    ) : ('-')}
                                                </td>
                                                <td className="px-1 py-1 text-center text-xs text-gray-400">{r.need3 ?? 0}</td>
                                                <td className={`px-1 py-1 text-center text-xs rounded ${reqClass(r.need3, r.req3)}`}>{r.req3 ?? 0}</td>

                                                <td className="px-2 py-1 text-xs text-gray-700">
                                                    {r.ingredient4 ? (
                                                        <div className="flex items-center gap-0.5">
                                                            <Image src={`/icons/${ingredientIcon(r.ingredient4)}`} alt={r.ingredient4} width={18} height={18} />
                                                            <span>{r.ingredient4}</span>
                                                        </div>
                                                    ) : ('-')}
                                                </td>
                                                <td className="px-1 py-1 text-center text-xs text-gray-400">{r.need4 ?? 0}</td>
                                                <td className={`px-1 py-1 text-center text-xs rounded ${reqClass(r.need4, r.req4)}`}>{r.req4 ?? 0}</td>

                                                <td className={`px-2 py-1 text-center text-[13px] rounded text-gray-800 ${capClass(r.totalQuantity, pot.capacity, pot.isCamping)}`}>{r.totalQuantity ?? 0}</td>
                                                <td className={`px-2 py-1 text-center text-[13px] rounded text-gray-800 ${r.reqTotal == 0 ? "bg-teal-400" : "bg-gray-300"}`}>
                                                    {r.reqTotal == 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => runCooking(r)}
                                                            disabled={cookingId === r.id}
                                                            className="w-full text-center font-medium text-gray-900 hover:underline disabled:opacity-60"
                                                            title="요리 실행"
                                                        >
                                                            {cookingId === r.id ? '요리중' : r.reqTotal}
                                                        </button>
                                                    ) : (
                                                        r.reqTotal
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </form>
                )}
            </div>

            {/* 플로팅 버튼 (Ingredients 페이지로 이동) */}
            <Link
                href="/ingredients"
                className="fixed bottom-10 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition hover:bg-gray-700"
                title="레시피 페이지로 이동"
            >
                <Image src="/icons/apple.png" alt="식재료" width={35} height={35} />
            </Link>
        </main>
    );
}
