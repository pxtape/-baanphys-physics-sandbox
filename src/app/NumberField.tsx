import { useEffect, useRef, useState } from "react";
export function NumberField({
  label,
  value,
  unit,
  onCommit,
  disabled = false,
  step = 0.1,
}: {
  label: string;
  value: number;
  unit: string;
  onCommit: (n: number) => boolean;
  disabled?: boolean;
  step?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  const cancelBlur = useRef(false);
  useEffect(() => setDraft(String(Number(value.toFixed(5)))), [value]);
  return (
    <label className="number-field">
      <span>
        {label} <small>{unit}</small>
      </span>
      <input
        type="number"
        aria-label={label}
        step={step}
        disabled={disabled}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            e.preventDefault();
            cancelBlur.current = true;
            setDraft(String(value));
            e.currentTarget.blur();
          }
        }}
        onBlur={() => {
          if (cancelBlur.current) {
            cancelBlur.current = false;
            setDraft(String(value));
            return;
          }
          const n = draft.trim() ? Number(draft) : NaN;
          if (!Number.isFinite(n) || !onCommit(n)) setDraft(String(value));
        }}
      />
    </label>
  );
}
