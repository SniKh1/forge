import { ListChecks } from 'lucide-react';

export function PanelCard({ title, note, kicker = 'Section' }: { title: string; note: string; kicker?: string }) {
  return (
    <div className="wb-panel rounded-[28px] px-5 py-5">
      <div className="wb-kicker">{kicker}</div>
      <div className="mt-2 text-xl font-semibold">{title}</div>
      <div className="mt-3 text-sm leading-6 text-[#5f5953]">{note}</div>
      <div className="mt-4 flex items-center gap-2 text-sm text-[#8a8177]">
        <ListChecks className="h-4 w-4" />
        这一部分已经从旧结构里拆开，后续将独立承接工作流。
      </div>
    </div>
  );
}
