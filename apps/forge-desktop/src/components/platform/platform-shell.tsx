import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { Client } from '../../lib/backend';
import type {
  ActionFeedbackVM,
  ClientCardVM,
  PlatformHeroVM,
  RequirementVM,
} from '../../platform-vm';
import { feedbackTone, statusLabel, statusTone } from '../../platform-vm';
import { PlatformClientIcon, WorkbenchStat } from './cards';

export function PlatformClientSwitcherSection(props: {
  cards: ClientCardVM[];
  activeClient: Client;
  clientIcons: Record<Client, string | null>;
  onSelectClient: (client: Client) => void;
}) {
  const activeCard = props.cards.find((card) => card.id === props.activeClient) ?? props.cards[0];

  return (
    <section className="rounded-[24px] border border-black/5 bg-white p-3 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">客户端</div>
          <div className="mt-1 text-[15px] font-semibold tracking-[-0.03em]">切换目标客户端</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusTone(activeCard)}`}>
            {activeCard.label} · {statusLabel(activeCard)}
          </span>
          <WorkbenchStat label={`${activeCard.installedSkillCount} 个能力`} />
          <WorkbenchStat label={`${activeCard.installedMcpCount} 个连接`} />
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-[16px] border border-slate-200 bg-slate-50 p-1.5">
        {props.cards.map((card) => {
          const icon = props.clientIcons[card.id];
          const active = props.activeClient === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => props.onSelectClient(card.id)}
              className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-left transition ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]'
                  : 'border-transparent bg-white text-slate-700 hover:border-slate-200'
              }`}
            >
              <PlatformClientIcon
                src={icon}
                label={card.label}
                fallback={card.id === 'opencode' ? 'OC' : card.label.slice(0, 1)}
                active={active}
              />
              <div>
                <div className="text-[12px] font-semibold">{card.label}</div>
                <div className={`mt-0.5 text-[10px] ${active ? 'text-white/70' : 'text-slate-500'}`}>{statusLabel(card)}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{activeCard.eyebrow}</span>
        <span>{activeCard.supportNote}</span>
        <span className="text-slate-400">·</span>
        <span>{activeCard.tagline}</span>
      </div>
    </section>
  );
}

export function PlatformHeroSection(props: {
  hero: PlatformHeroVM;
  secondaryLabel: string;
  heroToneClass: string;
  activeCardLabel: string;
  activeCardTone: string;
  personaTitle: string;
  requirementCount: number;
  runningAction: string | null;
  activeClient: Client;
  onRunPrimaryAction: () => void;
  onRunSecondaryAction: () => void;
  onOpenActionsDrawer: () => void;
}) {
  const primaryDisabled =
    Boolean(props.runningAction) ||
    props.hero.primaryAction === 'limited' ||
    (props.hero.primaryAction === 'bootstrap' && props.activeClient === 'opencode');

  return (
    <section className={`rounded-[24px] border p-3 shadow-[0_18px_44px_rgba(15,23,42,0.05)] ${props.heroToneClass}`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">当前状态</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-semibold tracking-[-0.04em]">{props.hero.title}</h1>
              <span className={`rounded-[14px] px-2.5 py-1 text-[11px] font-semibold ${props.activeCardTone}`}>
                {props.activeCardLabel}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-600">{props.hero.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkbenchStat label={props.requirementCount > 0 ? `${props.requirementCount} 项待处理` : '前提已就绪'} />
            <WorkbenchStat label={props.personaTitle} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={props.onRunPrimaryAction}
            disabled={primaryDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-[13px] bg-slate-900 px-4 py-2 text-[12px] font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {props.runningAction && props.hero.primaryAction !== 'limited' ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {props.hero.primaryLabel}
          </button>
          <button
            type="button"
            onClick={props.onRunSecondaryAction}
            disabled={Boolean(props.runningAction)}
            className="inline-flex items-center justify-center gap-2 rounded-[13px] border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {props.secondaryLabel}
          </button>
          <button
            type="button"
            onClick={props.onOpenActionsDrawer}
            className="inline-flex items-center justify-center gap-2 rounded-[13px] border border-slate-200 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 shadow-sm"
          >
            更多操作
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function PlatformAttentionStrip(props: {
  requirements: RequirementVM[];
  requirementActionLabel?: string;
  feedback: ActionFeedbackVM | null;
  onOpenRequirements: () => void;
  onOpenToolbox: () => void;
}) {
  if (props.requirements.length === 0 && !props.feedback) {
    return null;
  }

  return (
    <section className="flex flex-wrap gap-2">
      {props.requirements.length > 0 ? (
        <button
          type="button"
          onClick={props.onOpenRequirements}
          className="min-w-[200px] flex-1 rounded-[16px] border border-amber-200 bg-[linear-gradient(135deg,#fffaf1_0%,#f8f3e7_100%)] px-3 py-2 text-left shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">需要先处理</div>
              <div className="mt-1 text-[11px] text-slate-700">
                {props.requirements.length} 项前提待处理
                {props.requirementActionLabel ? ` · 优先处理：${props.requirementActionLabel}` : ''}
              </div>
            </div>
            <AlertTriangle className="mt-1 h-5 w-5 text-amber-700" />
          </div>
        </button>
      ) : null}
      {props.feedback ? (
        <button
          type="button"
          onClick={props.onOpenToolbox}
          className={`min-w-[200px] flex-1 rounded-[16px] border px-3 py-2 text-left shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${feedbackTone(
            props.feedback.tone
          )}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-current/70">最近结果</div>
              <div className="mt-1 text-[11px] text-current/90">
                {props.feedback.title} · {props.feedback.impact}
              </div>
            </div>
            <ArrowRight className="mt-1 h-5 w-5" />
          </div>
        </button>
      ) : null}
    </section>
  );
}
