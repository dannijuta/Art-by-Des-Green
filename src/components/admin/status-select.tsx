'use client';

import { useRef } from 'react';

export function StatusSelect({
  id,
  status,
  action,
  options,
}: {
  id: string;
  status: string;
  action: (formData: FormData) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="border border-border bg-ivory px-2 py-1 text-xs"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}
