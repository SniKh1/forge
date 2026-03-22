import { ListChecks } from 'lucide-react';

export function PanelCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="wb-panel rounded-[28px] px-5 py-5">
      <div className="wb-kicker">Section</div>
      <div className="mt-2 text-xl font-semibold">{title}</div>
      <div className="mt-3 text-sm leading-6 text-[#5f5953]">{note}</div>
      <div className="mt-4 flex items-center gap-2 text-sm text-[#8a8177]">
        <ListChecks className="h-4 w-4" />
        这部分已经从旧结构中拆开，后续独立实现。
      </div>
    </div>
  );
}
