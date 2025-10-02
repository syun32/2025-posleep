// frontend/src/app/ingredients/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '식재료',
    description: '보유 식재료 등록/수정 페이지',
};

export default function IngredientsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
