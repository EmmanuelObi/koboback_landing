/** Shared class tokens aligned with landing + waitlist. */

export const inputClass =
  "w-full h-11 px-4 rounded-md border border-slate-200 text-[14px] text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition";

export const selectClass =
  "w-full h-11 px-3 rounded-md border border-slate-200 text-[14px] text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition appearance-none";

export const labelClass = "block mb-1.5 text-[13px] font-medium text-slate-700";

export const cardClass =
  "bg-white border border-slate-200 rounded-lg";

export const pageTitleClass =
  "text-[26px] md:text-[30px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em]";

export const pageDescClass = "text-[14px] text-slate-500 leading-relaxed";

export const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400";

export function cn(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}
