import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';

export function PlatformClientIcon(props: {
  src?: string | null;
  label: string;
  fallback: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px] border border-black/5 bg-white/95 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ${
        props.active ? 'ring-2 ring-white/20' : 'ring-1 ring-slate-200'
      }`}
    >
      {props.src ? (
        <img
          src={props.src}
          alt={props.label}
          className="h-7 w-7 object-contain"
        />
      ) : (
        <span className="text-[12px] font-semibold text-slate-700">{props.fallback}</span>
      )}
    </div>
  );
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function WorkbenchTabButton(props: {
  active: boolean;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-[10px] px-4 py-2 text-left transition ${
        props.active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
      }`}
    >
      <div className="text-[12px] font-medium">{props.label}</div>
      <div className={`mt-0.5 text-[10px] ${props.active ? 'text-white/70' : 'text-slate-400'}`}>{props.meta}</div>
    </button>
  );
}

export function WorkbenchStat({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
      {label}
    </span>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function ActionMenuItem(props: {
  title: string;
  detail: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className="flex w-full items-start justify-between gap-3 rounded-[14px] border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-slate-900">{props.title}</div>
        <div className="mt-1 text-[12px] leading-6 text-slate-500">{props.detail}</div>
      </div>
      <span className="rounded-[10px] bg-slate-50 p-2 text-slate-600 ring-1 ring-slate-200">{props.icon}</span>
    </button>
  );
}

export function LayerCard(props: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
  items: string[];
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[15px] font-semibold">{props.title}</div>
        <button
          type="button"
          onClick={props.onToggle}
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            props.enabled ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
          }`}
        >
          {props.enabled ? '已启用' : '已关闭'}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {props.items.map((item) => (
          <span
            key={`${props.title}-${item}`}
            className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AdvancedCard(props: {
  title: string;
  value: string;
  actionLabel: string;
  onAction: () => void;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-900">{props.title}</div>
          <div className="mt-2 break-all font-mono text-[12px] leading-6 text-slate-500">{props.value}</div>
        </div>
        <span className="rounded-[12px] bg-white p-2 ring-1 ring-slate-200">{props.icon}</span>
      </div>
      <button
        type="button"
        onClick={props.onAction}
        disabled={props.disabled}
        className="mt-4 inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {props.actionLabel}
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
}

export function InfoCard({
  title,
  detail,
  mono = false,
}: {
  title: string;
  detail: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-[13px] font-semibold text-slate-900">{title}</div>
      <div className={`mt-2 text-[12px] leading-6 text-slate-600 ${mono ? 'break-all font-mono' : ''}`}>
        {detail}
      </div>
    </div>
  );
}
