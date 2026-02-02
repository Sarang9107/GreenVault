import * as React from "react";

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
) {
  const { className = "", label, ...rest } = props;
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm font-medium text-zinc-800">{label}</div>
      ) : null}
      <input
        className={[
          "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200",
          className,
        ].join(" ")}
        {...rest}
      />
    </label>
  );
}


