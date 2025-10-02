// frontend/src/app/recipes/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '레시피',
    description: '레시피 정보 및 보유 식재료에 따른 필요 수량 페이지',
};

export default function RecipesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
