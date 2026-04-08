import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Drawer({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-[520px] overflow-y-auto rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <div className="text-[22px] font-semibold tracking-[-0.03em]">{title}</div>
        <div className="mt-1 text-[13px] leading-6 text-slate-500">{description}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭面板"
        className="rounded-[12px] border border-slate-200 bg-white p-2 text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
