'use client';

type Props = {
    checked: boolean;
    onChange: () => void;
    label?: string;       // 접근성용 label (화면에는 안 보임)
    className?: string;   // 외부에서 추가 스타일
};

export default function SwitchSmall({ checked, onChange, label, className }: Props) {
    return (
        <label className={`inline-flex cursor-pointer items-center ${className ?? ''}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                aria-label={label}
                className="peer sr-only"
            />
            <span
                className="
                relative inline-block h-5 w-9 rounded-full bg-gray-300
                transition-colors duration-200 peer-checked:bg-gray-900
                after:absolute after:left-1 after:top-1/2 after:h-3.5 after:w-3.5
                after:-translate-y-1/2 after:rounded-full after:bg-white
                after:shadow after:transition-transform after:duration-200
                after:content-[''] peer-checked:after:translate-x-3.5
                "
            />
        </label>
    );
}