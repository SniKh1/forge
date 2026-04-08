import { useMemo, useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import type { RoleId, StackId } from '../../platform-data';
import type {
  ActionFeedbackVM,
  ApplyScopeVM,
  ExtensionMetaVM,
  McpOptionVM,
  RequirementVM,
  RoleOptionVM,
  SkillCompositionVM,
  SkillOptionVM,
  StackOptionVM,
  WorkbenchTabVM,
  WorkbenchView,
} from '../../platform-vm';
import { InfoLine, WorkbenchStat, WorkbenchTabButton } from './cards';
import { feedbackTone } from '../../platform-vm';

type DrawerMode = 'details' | 'secrets' | 'skills' | 'connections';
type PersonaPanelView = 'role' | 'stacks' | 'skills';

function joinPreview(items: string[], max: number) {
  if (items.length <= max) {
    return items.join(' · ');
  }
  return `${items.slice(0, max).join(' · ')} +${items.length - max}`;
}

export function PlatformWorkbenchSection(props: {
  workbenchView: WorkbenchView;
  setWorkbenchView: (view: WorkbenchView) => void;
  workbenchTabs: WorkbenchTabVM[];
  roleOptions: RoleOptionVM[];
  onRoleSelect: (id: RoleId) => void;
  recommendedStacks: StackOptionVM[];
  optionalStacks: StackOptionVM[];
  onToggleStack: (id: StackId) => void;
  skillComposition: SkillCompositionVM;
  skillOptions: { recommended: SkillOptionVM[]; optional: SkillOptionVM[] };
  onToggleExtraSkill: (id: string) => void;
  onSelectAllOptionalSkills: () => void;
  activeCardLabel: string;
  activeCardTone: string;
  applyScope: ApplyScopeVM;
  latestFeedback: ActionFeedbackVM | null;
  onDismissFeedback: () => void;
  extensionView: 'mcp' | 'memory';
  setExtensionView: (view: 'mcp' | 'memory') => void;
  extensionMeta: Record<'mcp' | 'memory', ExtensionMetaVM>;
  currentExtension: ExtensionMetaVM;
  requiredSecretKeys: string[];
  toggleExtension: (view: 'mcp' | 'memory') => void;
  mcpOptions: McpOptionVM[];
  onToggleMcpServer: (id: string) => void;
  requirements: RequirementVM[];
  setDrawerMode: (mode: DrawerMode) => void;
}) {
  const selectedRoles = props.roleOptions.filter((role) => role.selected);
  const [personaPanelView, setPersonaPanelView] = useState<PersonaPanelView>('role');
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [showOptionalStacks, setShowOptionalStacks] = useState(false);
  const [showOptionalSkills, setShowOptionalSkills] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);

  useEffect(() => {
    if (props.latestFeedback && props.latestFeedback.tone === 'success') {
      const timer = setTimeout(() => {
        props.onDismissFeedback();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [props.latestFeedback, props.onDismissFeedback]);

  const selectedStacks = [...props.recommendedStacks, ...props.optionalStacks].filter((stack) => stack.selected);
  const selectedOptionalSkills = props.skillOptions.optional.filter((skill) => skill.selected);
  const visiblePrimarySkills = props.skillComposition.primarySkills.slice(0, 6);
  const secondarySkills = props.skillComposition.supportSkills.slice(0, 4);
  const selectedRoleSummary =
    selectedRoles.length === 1
      ? selectedRoles[0].title
      : selectedRoles.length === 2
        ? `${selectedRoles[0].title} + ${selectedRoles[1].title}`
        : `${selectedRoles[0].title} + ${selectedRoles.length - 1} 个角色`;
  const visibleRoleOptions = useMemo(() => {
    if (showAllRoles) {
      return props.roleOptions;
    }

    const selected = props.roleOptions.filter((role) => role.selected);
    const unselected = props.roleOptions.filter((role) => !role.selected);
    return [...selected, ...unselected.slice(0, 5)];
  }, [props.roleOptions, showAllRoles]);

  const personaSummaryCards = useMemo(
    () => [
      {
        id: 'role' as const,
        label: '角色组合',
        value: selectedRoleSummary,
        meta: `${selectedRoles.length} 个角色`,
      },
      {
        id: 'stacks' as const,
        label: '模块',
        value: selectedStacks.length > 0 ? joinPreview(selectedStacks.map((stack) => stack.title), 3) : '未添加模块',
        meta: `${selectedStacks.length} 项`,
      },
      {
        id: 'skills' as const,
        label: '能力',
        value:
          visiblePrimarySkills.length > 0
            ? joinPreview(visiblePrimarySkills.map((skill) => skill.title), 3)
            : '未带入能力',
        meta: `${props.skillComposition.totalCount} 个能力`,
      },
    ],
    [props.skillComposition.totalCount, selectedRoleSummary, selectedRoles.length, selectedStacks, visiblePrimarySkills]
  );

  return (
    <section className="rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">配置</div>
          <div className="mt-1 text-[16px] font-semibold tracking-[-0.03em]">Forge 组合</div>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
          {props.workbenchTabs.map((tab) => (
            <WorkbenchTabButton
              key={tab.id}
              active={props.workbenchView === tab.id}
              label={tab.label}
              meta={tab.meta}
              onClick={() => props.setWorkbenchView(tab.id)}
            />
          ))}
        </div>
      </div>

      {props.latestFeedback && props.latestFeedback.tone !== 'success' ? (
        <div className={`mt-4 rounded-[20px] border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${feedbackTone(props.latestFeedback.tone)}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-current/70">最近执行结果</div>
              <div className="mt-1.5 text-[15px] font-semibold">{props.latestFeedback.title}</div>
              <div className="mt-2 text-[12px] leading-6 text-current/90">{props.latestFeedback.impact}</div>
            </div>
            <button
              type="button"
              onClick={props.onDismissFeedback}
              className="text-current/50 hover:text-current/80"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => props.setDrawerMode('details')}
              className="inline-flex items-center gap-2 rounded-[12px] border border-current/20 bg-white/70 px-3 py-2 text-[12px] font-medium text-current hover:bg-white"
            >
              查看详情
              <ArrowRight className="h-4 w-4" />
            </button>
            {props.latestFeedback.warnings.length > 0 ? (
              <WorkbenchStat label={`${props.latestFeedback.warnings.length} 条警告`} />
            ) : null}
          </div>
        </div>
      ) : props.latestFeedback && props.latestFeedback.tone === 'success' ? (
        <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600/70">安装成功</div>
              <div className="mt-1.5 text-[15px] font-semibold text-emerald-900">{props.latestFeedback.title}</div>
              {props.latestFeedback.installedSummary ? (
                <div className="mt-2 text-[13px] font-medium text-emerald-800">{props.latestFeedback.installedSummary}</div>
              ) : null}
              <div className="mt-1 text-[12px] text-emerald-700/80">{props.latestFeedback.nextStep}</div>
            </div>
            <button
              type="button"
              onClick={props.onDismissFeedback}
              className="text-emerald-600/50 hover:text-emerald-600/80"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        {props.workbenchView === 'persona' ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">

              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">当前组合</div>
                    <div className="mt-1.5 text-[15px] font-semibold text-slate-900">先选角色，再补模块和 skill</div>
                  </div>
                  <span className={`rounded-[14px] px-3 py-1.5 text-[11px] font-semibold ${props.activeCardTone}`}>
                    面向 {props.activeCardLabel}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {personaSummaryCards.map((card) => {
                    const active = personaPanelView === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setPersonaPanelView(card.id)}
                        className={`rounded-[16px] border px-3.5 py-3 text-left transition ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.10)]'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${active ? 'text-white/65' : 'text-slate-400'}`}>
                          {card.label}
                        </div>
                        <div className="mt-2 text-[13px] font-semibold">{card.value}</div>
                        <div className={`mt-1 text-[11px] ${active ? 'text-white/70' : 'text-slate-500'}`}>{card.meta}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 rounded-[16px] border border-slate-200 bg-white p-1">
                  {([
                    ['role', '角色'],
                    ['stacks', '模块'],
                    ['skills', '能力'],
                  ] as Array<[PersonaPanelView, string]>).map(([view, label]) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setPersonaPanelView(view)}
                      className={`rounded-[10px] px-3 py-2 text-[12px] font-medium transition ${
                        personaPanelView === view ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {personaPanelView === 'role' ? (
                <div className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">角色</div>
                      <div className="mt-1.5 text-[15px] font-semibold text-slate-900">角色组合决定主线</div>
                      <div className="mt-1 text-[12px] leading-5 text-slate-600">可多选叠加，Forge 会合并推荐模块、skill 与连接建议。</div>
                    </div>
                    <WorkbenchStat label={`${selectedRoles.length} 个角色已启用`} />
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-900">当前角色带来的能力方向</div>
                      <WorkbenchStat label={`${props.skillComposition.autoIncludedCount} 个自动能力`} />
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {selectedRoles.map((role) => (
                        <div key={`selected-role-bundle-${role.id}`} className="rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="text-[12px] font-semibold text-slate-900">{role.title}</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {role.previewSkills.map((skillTitle) => (
                              <span
                                key={`${role.id}-${skillTitle}`}
                                className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
                              >
                                {skillTitle}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {visibleRoleOptions.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => props.onRoleSelect(role.id)}
                        className={`rounded-[16px] border px-3.5 py-3 text-left transition ${
                          role.selected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.12)]'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[13px] font-semibold">{role.title}</div>
                          {role.selected ? (
                            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white">已选</span>
                          ) : null}
                        </div>
                        <div className={`mt-1 text-[11px] leading-5 ${role.selected ? 'text-white/75' : 'text-slate-500'}`}>{role.fit}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {role.previewSkills.map((skillTitle) => (
                            <span
                              key={`${role.id}-${skillTitle}`}
                              className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                role.selected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {skillTitle}
                            </span>
                          ))}
                        </div>
                        <div className={`mt-2 text-[10px] ${role.selected ? 'text-white/65' : 'text-slate-400'}`}>
                          {role.selected ? '再次点击可取消，至少保留一个角色' : '点击叠加到当前组合'}
                        </div>
                      </button>
                    ))}
                  </div>
                  {props.roleOptions.length > visibleRoleOptions.length ? (
                    <button
                      type="button"
                      onClick={() => setShowAllRoles(true)}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                    >
                      展开全部角色
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  ) : null}
                  {showAllRoles ? (
                    <button
                      type="button"
                      onClick={() => setShowAllRoles(false)}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700"
                    >
                      收起角色列表
                      <ChevronDown className="h-4 w-4 rotate-180" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              {personaPanelView === 'stacks' ? (
                <div className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">模块</div>
                    <div className="mt-1.5 text-[15px] font-semibold text-slate-900">只补当前项目真的需要的模块</div>
                    <div className="mt-1 text-[12px] leading-5 text-slate-600">推荐模块优先保留，补强模块按需少量添加。</div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-900">已选模块</div>
                      <WorkbenchStat label={`${selectedStacks.length} 项`} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStacks.map((stack) => (
                        <span
                          key={`selected-stack-pill-${stack.id}`}
                          className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
                        >
                          {stack.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-900">推荐模块</div>
                      <WorkbenchStat label={`${props.recommendedStacks.length} 项建议`} />
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {props.recommendedStacks.map((stack) => (
                        <button
                          key={stack.id}
                          type="button"
                          onClick={() => props.onToggleStack(stack.id)}
                          className={`rounded-[14px] border px-3.5 py-3 text-left transition ${
                            stack.selected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.10)]'
                              : 'border-slate-200 bg-slate-50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[12px] font-semibold">{stack.title}</div>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${stack.selected ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                              建议
                            </span>
                          </div>
                          <div className={`mt-1 text-[11px] leading-5 ${stack.selected ? 'text-white/75' : 'text-slate-500'}`}>
                            {stack.summary}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-900">按需补强</div>
                      <button
                        type="button"
                        onClick={() => setShowOptionalStacks((current) => !current)}
                        className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700"
                      >
                        {showOptionalStacks ? '收起补强模块' : '添加补强模块'}
                        <ChevronDown className={`h-4 w-4 transition ${showOptionalStacks ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {showOptionalStacks ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {props.optionalStacks.map((stack) => (
                          <button
                            key={stack.id}
                            type="button"
                            onClick={() => props.onToggleStack(stack.id)}
                            className={`rounded-full px-3 py-2 text-[12px] font-medium transition ${
                              stack.selected
                                ? 'bg-slate-900 text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)]'
                                : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-white'
                            }`}
                          >
                            {stack.title}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-[12px] leading-5 text-slate-500">当前默认只露出推荐模块，避免一开始铺开全部选项。</div>
                    )}
                  </div>
                </div>
              ) : null}

              {personaPanelView === 'skills' ? (
                <div className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">能力</div>
                    <div className="mt-1.5 text-[15px] font-semibold text-slate-900">自动带入为主，手动补强为辅</div>
                    <div className="mt-1 text-[12px] leading-5 text-slate-600">Forge 会先按角色和模块带入主 skill，你只需要处理少量差异。</div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-900">自动带入</div>
                      <div className="flex flex-wrap gap-2">
                        <WorkbenchStat label={`${props.skillComposition.autoIncludedCount} 个`} />
                        {props.skillComposition.hiddenSkillCount > 0 ? (
                          <WorkbenchStat label={`另有 ${props.skillComposition.hiddenSkillCount} 个隐藏`} />
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {visiblePrimarySkills.map((skill) => (
                        <div key={`recommended-skill-${skill.id}`} className="rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="text-[12px] font-semibold text-slate-900">{skill.title}</div>
                          <div className="mt-1 text-[11px] leading-5 text-slate-500">{skill.reason}</div>
                        </div>
                      ))}
                    </div>
                    {secondarySkills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {secondarySkills.map((skill) => (
                          <span
                            key={`support-skill-${skill.id}`}
                            className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                          >
                            {skill.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => props.setDrawerMode('skills')}
                      className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                    >
                      查看完整能力清单
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[12px] font-semibold text-slate-900">手动补强</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={props.onSelectAllOptionalSkills}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                        >
                          全选当前可补强项
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOptionalSkills((current) => !current)}
                          className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700"
                        >
                          {showOptionalSkills ? '收起补强能力' : '添加补强能力'}
                          <ChevronDown className={`h-4 w-4 transition ${showOptionalSkills ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <WorkbenchStat label={`手动补强 ${props.skillComposition.manualIncludedCount} 个`} />
                      <WorkbenchStat label={`总计 ${props.skillComposition.totalCount} 个能力`} />
                    </div>
                    {selectedOptionalSkills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedOptionalSkills.map((skill) => (
                          <span
                            key={`selected-optional-skill-${skill.id}`}
                            className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white"
                          >
                            {skill.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {showOptionalSkills ? (
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {props.skillOptions.optional.map((skill) => (
                          <button
                            key={`optional-skill-${skill.id}`}
                            type="button"
                            onClick={() => props.onToggleExtraSkill(skill.id)}
                            disabled={skill.locked}
                            className={`rounded-[14px] border px-3 py-3 text-left transition ${
                              skill.selected
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-slate-50 hover:bg-white'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[12px] font-semibold">{skill.title}</div>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${skill.selected ? 'bg-white/10 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
                                {skill.selected ? '已加入' : '加入'}
                              </span>
                            </div>
                            <div className={`mt-1 text-[11px] leading-5 ${skill.selected ? 'text-white/75' : 'text-slate-500'}`}>{skill.reason}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-[12px] leading-5 text-slate-500">只在缺少专项能力时手动补强，避免把配置面重新变成大列表。</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">执行摘要</div>
                    <div className="mt-1.5 text-[15px] font-semibold">确认后再执行</div>
                  </div>
                  <WorkbenchStat label={`${props.applyScope.writeItems.length} 类写入`} />
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">这次会写入</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {props.applyScope.writeItems.map((item) => (
                        <WorkbenchStat key={`write-${item}`} label={item} />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">当前阻塞</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {props.requirements.length > 0 ? (
                        props.requirements.slice(0, 3).map((item) => (
                          <span
                            key={`requirement-pill-${item.id}`}
                            className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200"
                          >
                            {item.title}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                          当前没有阻塞项
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewDetails((current) => !current)}
                  className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                >
                  {showReviewDetails ? '收起执行细节' : '查看执行细节'}
                  <ChevronDown className={`h-4 w-4 transition ${showReviewDetails ? 'rotate-180' : ''}`} />
                </button>

                {showReviewDetails ? (
                  <div className="mt-3 space-y-3">
                    {props.applyScope.skipItems.length > 0 ? (
                      <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3">
                        <div className="text-[12px] font-semibold text-slate-900">这次不会写入</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {props.applyScope.skipItems.map((item) => (
                            <span
                              key={`skip-${item}`}
                              className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3">
                      <div className="text-[12px] font-semibold text-slate-900">目标信息</div>
                      <div className="mt-2 space-y-2">
                        {props.applyScope.targetItems.map((item) => (
                          <InfoLine key={`target-${item.label}`} label={item.label} value={item.value} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {props.requirements.length > 0 ? (
                <div className="rounded-[20px] border border-amber-200 bg-[linear-gradient(135deg,#fffaf1_0%,#f8f3e7_100%)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">待处理</div>
                  <div className="mt-1.5 text-[14px] font-semibold text-slate-900">先补齐前提，再继续执行</div>
                  <div className="mt-3 space-y-2">
                    {props.requirements.slice(0, 2).map((item) => (
                      <div key={`compact-requirement-${item.id}`} className="rounded-[14px] border border-amber-200 bg-white/80 px-3 py-3">
                        <div className="text-[12px] font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-[11px] leading-5 text-slate-600">{item.nextStep}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => props.setWorkbenchView('connections')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors duration-150"
              >
                管理 MCP 连接器
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {props.workbenchView === 'connections' ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">连接器</div>
                  <div className="mt-1.5 text-[15px] font-semibold text-slate-900">选择要启用的 MCP 服务</div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-600">
                    MCP 连接器独立于角色和能力，按需补强。带 <span className="font-medium text-emerald-700">推荐</span> 标签的是当前角色和模块建议的连接。
                  </div>
                </div>
                <WorkbenchStat label={`${props.mcpOptions.filter((o) => o.selected).length} / ${props.mcpOptions.length} 已选`} />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {props.mcpOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => props.onToggleMcpServer(option.id)}
                    className={`rounded-[14px] border px-3.5 py-3 text-left transition-all duration-150 cursor-pointer ${
                      option.selected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold truncate">{option.label}</span>
                          {option.recommended && !option.selected ? (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">推荐</span>
                          ) : null}
                          {option.requiresSecret ? (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${option.selected ? 'bg-white/15 text-white/80' : 'bg-amber-50 text-amber-700'}`}>需要密钥</span>
                          ) : null}
                        </div>
                        <div className={`mt-1 text-[11px] leading-4 ${option.selected ? 'text-white/70' : 'text-slate-500'}`}>
                          {option.description}
                        </div>
                      </div>
                      <div className={`shrink-0 mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center transition-colors duration-150 ${
                        option.selected
                          ? 'border-white bg-white'
                          : 'border-slate-300 bg-transparent'
                      }`}>
                        {option.selected ? <Check className="h-2.5 w-2.5 text-slate-900" /> : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {props.mcpOptions.some((o) => o.requiresSecret && o.selected) ? (
                <div className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-3">
                  <div className="text-[12px] font-semibold text-amber-800">部分连接需要密钥</div>
                  <div className="mt-1 text-[11px] leading-5 text-amber-700">
                    已选中需要 API Key 的连接器，请在高级设置里补齐密钥后再执行安装。
                  </div>
                  <button
                    type="button"
                    onClick={() => props.setDrawerMode('secrets')}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-[10px] border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-medium text-amber-800 cursor-pointer hover:bg-amber-50 transition-colors duration-150"
                  >
                    填写密钥
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {props.workbenchView === 'extensions' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
                {(['mcp', 'memory'] as Array<'mcp' | 'memory'>).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => props.setExtensionView(tab)}
                    className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition ${
                      props.extensionView === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {props.extensionMeta[tab].title}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <WorkbenchStat label={props.currentExtension.enabled ? '当前已启用' : '当前已关闭'} />
                {props.requiredSecretKeys.length > 0 ? <WorkbenchStat label={`${props.requiredSecretKeys.length} 个密钥项`} /> : null}
              </div>
            </div>

            {props.extensionView === 'mcp' ? (
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold">{props.currentExtension.title}</div>
                    <div className="mt-1 text-[12px] leading-5 text-slate-600">{props.currentExtension.description}</div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      {props.currentExtension.enabled ? '已启用' : '已关闭'} · {props.currentExtension.items.length} 个当前连接
                      {props.requiredSecretKeys.length > 0 ? ` · ${props.requiredSecretKeys.length} 个密钥项` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => props.toggleExtension(props.extensionView)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      props.currentExtension.enabled ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
                    }`}
                  >
                    {props.currentExtension.enabled ? '已启用' : '已关闭'}
                  </button>
                </div>
                <div className="mt-4 grid overflow-hidden rounded-[14px] border border-slate-200 bg-white sm:grid-cols-3">
                  <div className="px-3 py-3">
                    <div className="text-[10px] text-slate-500">当前数量</div>
                    <div className="mt-1 text-[15px] font-semibold text-slate-900">{props.currentExtension.items.length}</div>
                  </div>
                  <div className="border-t border-slate-200 px-3 py-3 sm:border-l sm:border-t-0">
                    <div className="text-[10px] text-slate-500">建议数量</div>
                    <div className="mt-1 text-[15px] font-semibold text-slate-900">{props.currentExtension.suggestedItems.length}</div>
                  </div>
                  <div className="border-t border-slate-200 px-3 py-3 sm:border-l sm:border-t-0">
                    <div className="text-[10px] text-slate-500">适合处理</div>
                    <div className="mt-1 text-[15px] font-semibold text-slate-900">补连接与兼容项</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => props.setDrawerMode('connections')}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                  >
                    查看清单
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => props.setDrawerMode('details')}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                  >
                    更多
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold">{props.currentExtension.title}</div>
                    <div className="mt-1 text-[12px] leading-5 text-slate-600">{props.currentExtension.description}</div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      {props.currentExtension.enabled ? '当前会带入工作区记忆与项目记忆' : '当前不带入记忆层'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => props.toggleExtension(props.extensionView)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      props.currentExtension.enabled ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
                    }`}
                  >
                    {props.currentExtension.enabled ? '已启用' : '已关闭'}
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="rounded-[14px] border border-slate-200 bg-white px-3 py-3 text-[12px] text-slate-700">
                    作用范围：{props.currentExtension.suggestedItems.join(' + ')}
                  </div>
                  <button
                    type="button"
                    onClick={() => props.setDrawerMode('connections')}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                  >
                    查看详情
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
