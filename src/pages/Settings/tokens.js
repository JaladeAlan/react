// ─── Shared design tokens ─────────────────────────────────────────
export const inputCls =
  "w-full bg-white border border-stone-200 text-stone-800 placeholder-stone-400 " +
  "rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-amber-500 " +
  "focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm";

export const selectCls = inputCls + " appearance-none cursor-pointer";

export const labelCls =
  "block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2";

export const btnPrimary =
  "w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 " +
  "active:bg-amber-600 text-white font-bold text-sm px-5 py-4 rounded-xl " +
  "transition-all active:scale-95 shadow-sm touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed";

export const btnDark =
  "w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 " +
  "active:bg-stone-900 text-white font-bold text-sm px-5 py-4 rounded-xl " +
  "transition-all active:scale-95 shadow-sm touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed";

export const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };