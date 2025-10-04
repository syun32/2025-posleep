'use client';

type Props = {
    checked: boolean;
    onChange: () => void;
    label?: string;        // 접근성용 (시각 숨김)
    className?: string;
    size?: 'xs' | 'sm' | 'md'; // 기본: xs(체크박스), sm/md(슬라이더)
};

const SIZE_MAP = {
    sm: {
        track: 'h-5 w-9',
        knob: 'after:h-3.5 after:w-3.5 after:left-1 peer-checked:after:translate-x-3.5',
    },
    md: {
        track: 'h-6 w-11',
        knob: 'after:h-4.5 after:w-4.5 after:left-1 peer-checked:after:translate-x-4.5',
    },
} as const;

export default function SwitchSmall({
    checked,
    onChange,
    label,
    className,
    size = 'xs',
}: Props) {
    const isCheckbox = size === 'xs';

    return (
        <label
            className={[
                'inline-flex items-center shrink-0 cursor-pointer select-none',
                isCheckbox ? 'p-1' : '',
                className ?? '',
            ].join(' ')}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                aria-label={label}
                role="switch"
                aria-checked={checked}
                className="peer sr-only"
            />

            {isCheckbox ? (
                // ===== XS: 체크박스 스타일 =====
                <span
                    className={[
                        'relative inline-flex h-4 w-4 items-center justify-center',
                        'rounded-[5px] border bg-white',
                        'border-gray-300 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]',
                        'transition-colors duration-200',
                        'peer-checked:bg-gray-800 peer-checked:border-gray-800',
                        'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
                        'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900/40',
                    ].join(' ')}
                >
                    <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="pointer-events-none absolute h-3.5 w-3.5 opacity-0 scale-75 transition-all duration-200 ease-out peer-checked:opacity-100 peer-checked:scale-100"
                    >
                        <path
                            d="M5 10l3 3 7-7"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            ) : (
                // ===== SM/MD: 슬라이더 토글 =====
                <span
                    className={[
                        'relative inline-block rounded-full bg-gray-300 transition-colors duration-200',
                        'peer-checked:bg-gray-900',
                        'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
                        'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900/40',
                        "after:absolute after:top-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 after:content-['']",
                        size === 'md' ? SIZE_MAP.md.track : SIZE_MAP.sm.track,
                        size === 'md' ? SIZE_MAP.md.knob : SIZE_MAP.sm.knob,
                    ].join(' ')}
                />
            )}
        </label>
    );
}
