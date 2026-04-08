import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ArrowRight,
  Bot,
  CheckCheck,
  FolderOpen,
  Hammer,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  TerminalSquare,
  WandSparkles,
} from 'lucide-react';
import forgeBloomIcon from './assets/forge-bloom.png';
import claudeIcon from './assets/platform-icons/claude.svg';
import codexIcon from './assets/platform-icons/codex.png';
import geminiIcon from './assets/platform-icons/gemini.svg';
import opencodeIcon from './assets/platform-icons/opencode.png';
import './styles.css';
import { forgeDeviceContext } from './generated-device-context';
import { forgeRoleMcpMatrix } from './generated-role-mcp';
import {
  bootstrapOfficialClient,
  getAppState,
  installClientConfig,
  installExternalMcp,
  installExternalSkill,
  isTauriRuntime,
  loadBuiltinMcpSecrets,
  openTarget,
  openTerminalHere,
  repairClientConfig,
  saveBuiltinMcpSecrets,
  searchExternalMcp,
  searchExternalSkills,
  type ActionPayload,
  type ActionResult,
  type AppStatePayload,
  type BootstrapResultData,
  type Client,
  verifyClientConfig,
} from './lib/backend';
import {
  buildActionFeedback,
  buildActionMenuItems,
  buildApplyScope,
  buildClientCards,
  buildExtensionMeta,
  buildHero,
  buildMcpOptions,
  buildRecommendedMcpIds,
  buildRequirements,
  buildRoleOptions,
  buildSkillComposition,
  buildSkillOptions,
  buildStackOptions,
  summarizeRoleSelection,
  buildWorkbenchTabs,
  feedbackTone,
  getPrimaryRequirementAction,
  requirementTone,
  skillTitles,
  statusTone,
  supportLabel,
  type ActionFeedbackVM,
  type McpOptionVM,
  type PlatformActionKind,
  type WorkbenchView,
} from './platform-vm';
import {
  clientMetas,
  createDefaultPersonaDrafts,
  secretHints,
  sectionTabs,
  type ExtensionView,
  type PlatformSection,
  type RoleId,
  type StackId,
} from './platform-data';
import {
  ActionMenuItem,
  AdvancedCard,
  InfoCard,
  SummaryRow,
  WorkbenchStat,
} from './components/platform/cards';
import { Drawer, DrawerHeader } from './components/platform/drawer';
import {
  PlatformAttentionStrip,
  PlatformClientSwitcherSection,
  PlatformHeroSection,
} from './components/platform/platform-shell';
import { PlatformWorkbenchSection } from './components/platform/workbench-section';

type ActionKind = PlatformActionKind;
type DrawerMode = 'actions' | 'details' | 'secrets' | 'skills' | 'requirements' | 'review' | 'connections' | 'clients' | null;
type CommunityView = 'skills' | 'mcp';

const clientIcons: Record<Client, string | null> = {
  claude: claudeIcon,
  codex: codexIcon,
  gemini: geminiIcon,
  opencode: opencodeIcon,
};

const baseComponents = ['hooks', 'rules', 'stacks', 'commands'] as const;
const previewSecretStorageKey = 'forge-desktop-rebuild.preview-secrets';
const previewAppState: AppStatePayload = {
  report: {
    detection: [
      {
        name: 'codex',
        home: '/Users/uui6yee/.codex',
        homeLabel: 'Native · /Users/uui6yee/.codex',
        detected: true,
        configured: true,
        homeExists: true,
        commandAvailable: true,
      },
      {
        name: 'claude',
        home: '/Users/uui6yee/.claude',
        homeLabel: 'Native · /Users/uui6yee/.claude',
        detected: true,
        configured: true,
        homeExists: true,
        commandAvailable: true,
      },
      {
        name: 'gemini',
        home: '/Users/uui6yee/.gemini',
        homeLabel: 'Native · /Users/uui6yee/.gemini',
        detected: false,
        configured: false,
        homeExists: false,
        commandAvailable: false,
      },
      {
        name: 'opencode',
        home: '/Users/uui6yee/.config/opencode',
        homeLabel: 'Native · /Users/uui6yee/.config/opencode',
        detected: true,
        configured: true,
        homeExists: true,
        commandAvailable: true,
      },
    ],
    capabilityMatrix: {
      capabilities: {
        mcp: {
          codex: 'Native',
          claude: 'Native',
          gemini: 'Native',
          opencode: 'Bridge',
        },
      },
    },
    support: [
      { client: 'codex', ok: true, exitCode: 0, stdout: 'Codex ready.', stderr: '' },
      { client: 'claude', ok: true, exitCode: 0, stdout: 'Claude ready.', stderr: '' },
      { client: 'gemini', ok: false, exitCode: 1, stdout: '', stderr: 'Gemini missing.' },
      { client: 'opencode', ok: true, exitCode: 0, stdout: 'OpenCode bridge ready.', stderr: '' },
    ],
  },
  runtime: {
    nodeAvailable: true,
    npmAvailable: true,
    pythonAvailable: true,
    gitAvailable: true,
    repoRoot: '/Users/uui6yee/develop/person/forge',
    runtimeCacheRoot: '/tmp/forge-desktop-rebuild-preview',
    isolated: false,
  },
  installed: {
    codex: { mcpServers: ['context7', 'memory', 'fetch', 'playwright', 'exa'], skills: ['frontend-design', 'web-frameworks', 'ui-styling', 'code-review', 'systematic-debugging-sp'] },
    claude: { mcpServers: ['context7', 'memory', 'fetch'], skills: ['frontend-design', 'ui-styling', 'webapp-testing', 'code-review'] },
    gemini: { mcpServers: ['context7'], skills: ['frontend-design'] },
    opencode: { mcpServers: ['context7', 'fetch', 'memory', 'playwright'], skills: ['code-review', 'systematic-debugging-sp'] },
  },
};

function clonePreviewState() {
  return JSON.parse(JSON.stringify(previewAppState)) as AppStatePayload;
}

function loadPreviewSecrets() {
  if (typeof window === 'undefined') return {} as Record<string, string>;
  try {
    const raw = window.localStorage.getItem(previewSecretStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function simulatePreviewAction(
  state: AppStatePayload,
  kind: ActionKind,
  client: Client,
  selectedMcpServers: string[],
  selectedSkills: string[],
  skillSyncMode: ActionPayload['skillSyncMode'],
  requiredSecretKeys: string[],
  secretValues: Record<string, string>
) {
  const next = JSON.parse(JSON.stringify(state)) as AppStatePayload;
  const detection = next.report.detection.find((item) => item.name === client);
  const support = next.report.support.find((item) => item.client === client);
  const installed = next.installed[client] ?? { mcpServers: [], skills: [] };
  const missingSecrets = requiredSecretKeys.filter((key) => !secretValues[key]);

  if (kind === 'bootstrap' && detection) {
    detection.detected = true;
    detection.commandAvailable = true;
    detection.homeExists = true;
    if (support) {
      support.ok = false;
      support.exitCode = 1;
      support.stdout = '';
      support.stderr = `${client} detected. Forge setup not applied yet.`;
    }
  }

  if ((kind === 'install' || kind === 'repair') && detection) {
    detection.detected = true;
    detection.configured = true;
    detection.commandAvailable = true;
    detection.homeExists = true;
    const mirroredSkills =
      skillSyncMode === 'full-library' ? [...forgeDeviceContext.forge.repoSkillIds] : [...selectedSkills];
    next.installed[client] = {
      mcpServers: [...selectedMcpServers],
      skills: mirroredSkills,
    };
    if (support) {
      support.ok = missingSecrets.length === 0;
      support.exitCode = support.ok ? 0 : 1;
      support.stdout = support.ok ? `${client} ready.` : '';
      support.stderr = support.ok ? '' : `Missing secrets: ${missingSecrets.join(', ')}`;
    }
  }

  if (kind === 'verify' && support) {
    support.ok = detection?.configured === true && missingSecrets.length === 0;
    support.exitCode = support.ok ? 0 : 1;
    support.stdout = support.ok ? `${client} verified.` : '';
    support.stderr = support.ok ? '' : missingSecrets.length > 0 ? `Missing secrets: ${missingSecrets.join(', ')}` : 'Client is not configured.';
  }

  const nextInstalled = next.installed[client] ?? installed;

  const ok = kind === 'bootstrap' || (support?.ok ?? false);
  const summaryMap: Record<ActionKind, string> = {
    bootstrap: `${clientMetas.find((item) => item.id === client)?.label ?? client} 已进入可配置状态`,
    install: ok ? '角色组合已写入预览态' : '预览态里仍有未补齐项',
    repair: ok ? '预览态已修复并重新套用' : '预览态仍有阻塞项',
    verify: ok ? '当前状态通过校验' : '当前状态未通过校验',
  };

  const result: ActionResult<unknown> = {
    ok,
    summary: summaryMap[kind],
    details: [
      `client=${client}`,
      `mcp=${nextInstalled.mcpServers.length}`,
      `skills=${nextInstalled.skills.length}`,
    ],
    warnings: missingSecrets.length > 0 ? [`missing_secrets=${missingSecrets.join(',')}`] : [],
    raw: ok ? `${kind} completed in browser preview mode.` : `${kind} needs attention in browser preview mode.`,
    data: null,
  };

  return { next, result };
}

async function openWorkspace(cwd: string) {
  try {
    if (!isTauriRuntime()) {
      window.alert(`浏览器预览模式\n请手动打开终端并进入：\n${cwd}`);
      return;
    }
    await openTerminalHere(cwd);
  } catch {
    window.alert(`请手动打开终端并进入：\n${cwd}`);
  }
}

async function openPathTarget(target: string) {
  try {
    if (!isTauriRuntime()) {
      window.alert(`浏览器预览模式\n目标路径：\n${target}`);
      return;
    }
    await openTarget(target);
  } catch {
    window.alert(`目标路径：\n${target}`);
  }
}

function App() {
  const previewMode = !isTauriRuntime();
  const [section, setSection] = useState<PlatformSection>('platform');
  const [activeClient, setActiveClient] = useState<Client>('codex');
  const [personaDrafts, setPersonaDrafts] = useState(createDefaultPersonaDrafts);
  const [workspace, setWorkspace] = useState('/Users/uui6yee/develop/person/forge');
  const [appState, setAppState] = useState<AppStatePayload | null>(null);
  const [appWarnings, setAppWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<ActionKind | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedbackVM | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [reviewAction, setReviewAction] = useState<ActionKind | null>(null);
  const [workbenchView, setWorkbenchView] = useState<WorkbenchView>('persona');
  const [extensionView, setExtensionView] = useState<ExtensionView>('mcp');
  const [communityView, setCommunityView] = useState<CommunityView>('skills');
  const [communityQuery, setCommunityQuery] = useState('');
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityResults, setCommunityResults] = useState<Record<CommunityView, unknown[]>>({
    skills: [],
    mcp: [],
  });
  const [communitySources, setCommunitySources] = useState<Record<CommunityView, Array<{ id: string; name: string }>>>({
    skills: [],
    mcp: [],
  });
  const [communityInstallingId, setCommunityInstallingId] = useState<string | null>(null);
  const [secretValues, setSecretValues] = useState<Record<string, string>>({});
  const [savingSecrets, setSavingSecrets] = useState(false);

  const activePersona = personaDrafts[activeClient];
  const activeRoleTitle = summarizeRoleSelection(activePersona.roleIds);
  const roleOptions = buildRoleOptions(activePersona.roleIds);
  const stackOptions = buildStackOptions(activePersona.roleIds, activePersona.stackIds);
  const skillComposition = buildSkillComposition({
    client: activeClient,
    roleIds: activePersona.roleIds,
    stackIds: activePersona.stackIds,
    extraSkillIds: activePersona.extraSkillIds,
  });
  const skillOptions = buildSkillOptions({
    client: activeClient,
    roleIds: activePersona.roleIds,
    stackIds: activePersona.stackIds,
    extraSkillIds: activePersona.extraSkillIds,
  });
  const cards = buildClientCards(appState);
  const detection = appState?.report.detection.find((item) => item.name === activeClient);
  const support = appState?.report.support.find((item) => item.client === activeClient);
  const hero = buildHero(activeClient, detection, support, activeRoleTitle);
  const selectedSkills = activePersona.enabledLayers.includes('skills') ? skillComposition.selectedSkillIds : [];
  const selectedMcpServers = activePersona.enabledLayers.includes('mcp') ? activePersona.mcpServers : [];
  const memoryEnabled = activePersona.enabledLayers.includes('memory');
  const requirements = buildRequirements({
    client: activeClient,
    detection,
    runtime: appState?.runtime,
    selectedMcpServers,
    enabledLayers: activePersona.enabledLayers,
    secretValues,
  });
  const selectedComponents = [
    ...baseComponents,
    ...(activePersona.enabledLayers.includes('mcp') ? ['mcp'] : []),
    ...(activePersona.enabledLayers.includes('skills') ? ['skills'] : []),
    ...(memoryEnabled ? ['memory'] : []),
  ];
  const activeCard = cards.find((item) => item.id === activeClient) ?? cards[0];
  const canRunClientActions = activeClient !== 'opencode' || Boolean(detection?.detected);
  const heroToneClass = {
    good: 'border-emerald-200 bg-[linear-gradient(135deg,#f4fbf6_0%,#edf6f1_100%)]',
    warn: 'border-amber-200 bg-[linear-gradient(135deg,#fffaf1_0%,#f8f3e7_100%)]',
    blocked: 'border-rose-200 bg-[linear-gradient(135deg,#fff7f7_0%,#faf0ed_100%)]',
    limited: 'border-sky-200 bg-[linear-gradient(135deg,#f6fbff_0%,#eef4fb_100%)]',
  }[hero.statusTone];
  const recommendedMcpIds = buildRecommendedMcpIds(activePersona.roleIds, activePersona.stackIds);
  const extensionMeta = buildExtensionMeta({
    selectedMcpServers,
    recommendedMcpIds,
    memoryEnabled,
  });
  const currentExtension = extensionMeta[extensionView];
  const applyScope = buildApplyScope({
    client: activeClient,
    roleTitle: activeRoleTitle,
    selectedStackIds: activePersona.stackIds,
    selectedMcpServers,
    selectedSkills,
    mcpEnabled: activePersona.enabledLayers.includes('mcp'),
    memoryEnabled,
    requirements,
    detectionHome: detection?.home,
  });
  const primaryRequirementAction = getPrimaryRequirementAction(requirements);
  const workbenchTabs = buildWorkbenchTabs({
    roleTitle: activeRoleTitle,
    stackCount: activePersona.stackIds.length,
    skillCount: selectedSkills.length,
    selectedMcpCount: selectedMcpServers.length,
  });
  const localSkillPreview = skillTitles(forgeDeviceContext.device.localSkillIds.slice(0, 12));
  const configuredCodexMcpPreview = forgeDeviceContext.device.configuredCodexMcpServerIds;
  const snapshotWarnings: string[] = [...forgeDeviceContext.health.snapshotWarnings];
  const combinedWarnings = [...snapshotWarnings, ...appWarnings.filter((item) => !snapshotWarnings.includes(item))];
  const canonicalGapCount: number = forgeDeviceContext.health.installedMissingCanonicalSkillIds.length;
  const registryGhostCount: number =
    forgeDeviceContext.health.sourceGhostSkillIds.length + forgeDeviceContext.health.moduleGhostSkillIds.length;
  const installedCoverageSummary =
    canonicalGapCount === 0 ? '本机已覆盖全部 canonical skills' : `本机缺少 ${canonicalGapCount} 个 canonical skills`;
  const recommendedSkillPreview = skillComposition.primarySkills.slice(0, 6);
  const recommendedMcpPreview = recommendedMcpIds.slice(0, 6);
  const installedCommunityItems =
    communityView === 'skills'
      ? appState?.installed?.[activeClient]?.skills ?? []
      : appState?.installed?.[activeClient]?.mcpServers ?? [];

  function communityInstalledKey(item: Record<string, unknown>) {
    if (communityView === 'skills') {
      return (
        (typeof item.skill === 'string' && item.skill) ||
        (typeof item.title === 'string' && item.title) ||
        (typeof item.name === 'string' && item.name) ||
        ''
      );
    }
    return (
      (typeof item.name === 'string' && item.name) ||
      (typeof item.title === 'string' && item.title) ||
      ''
    );
  }

  function communityDisplayTitle(item: Record<string, unknown>) {
    const raw =
      (typeof item.title === 'string' && item.title) ||
      (typeof item.name === 'string' && item.name) ||
      (typeof item.skill === 'string' && item.skill) ||
      'unknown';
    return communityView === 'skills' ? skillTitles([raw])[0] : raw;
  }
  const actionMenuItems = buildActionMenuItems({
    canRunClientActions,
    runningAction,
    detected: Boolean(detection?.detected),
  }).map((item) => ({
    ...item,
    icon:
      item.key === 'bootstrap' ? (
        <Plus className="h-4 w-4" />
      ) : item.key === 'install' ? (
        <WandSparkles className="h-4 w-4" />
      ) : item.key === 'repair' ? (
        <Hammer className="h-4 w-4" />
      ) : (
        <CheckCheck className="h-4 w-4" />
      ),
    onClick: () => void requestAction(item.key),
  }));

  useEffect(() => {
    void loadState();
    void loadSecrets();
  }, []);

  useEffect(() => {
    setDrawerMode(null);
  }, [activeClient, section]);

  useEffect(() => {
    if (section !== 'community') return;
    if (communityResults[communityView].length > 0) return;
    void runCommunitySearch('');
  }, [section, communityView]);

  const requiredSecretKeys = useMemo(() => {
    const keys = new Set<string>();
    if (selectedMcpServers.includes('exa')) {
      keys.add('EXA_API_KEY');
    }
    return Array.from(keys);
  }, [selectedMcpServers]);

  async function loadState(options?: { preserveFeedback?: boolean }) {
    setIsLoading(true);
    try {
      if (previewMode) {
        setAppState(clonePreviewState());
        if (!options?.preserveFeedback) {
          setFeedback(null);
        }
        return;
      }
      const result = await getAppState();
      if (result.data) {
        setAppState(result.data);
      }
      setAppWarnings(result.warnings);
      if (!result.ok) {
        setFeedback({
          tone: 'error',
          title: '加载状态失败',
          impact: result.summary,
          nextStep: '先确认 Forge 资源路径是否可见，再重新加载。',
          raw: result.raw,
          details: result.details,
          warnings: result.warnings,
        });
      } else if (!options?.preserveFeedback) {
        setFeedback(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function dismissFeedback() {
    setFeedback(null);
  }

  async function loadSecrets() {
    if (previewMode) {
      setSecretValues(loadPreviewSecrets());
      return;
    }
    const result = await loadBuiltinMcpSecrets();
    if (result.ok && result.data) {
      setSecretValues(result.data);
    }
  }

  async function saveSecrets() {
    setSavingSecrets(true);
    try {
      if (previewMode) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(previewSecretStorageKey, JSON.stringify(secretValues));
        }
        setFeedback({
          tone: 'success',
          title: '密钥已保存',
          impact: '浏览器预览态已保存本地密钥。',
          nextStep: '现在可以继续点 Install、Repair 或 Verify 看状态变化。',
          raw: 'Preview secrets saved to localStorage.',
          details: Object.keys(secretValues).map((key) => `saved=${key}`),
          warnings: [],
        });
        return;
      }
      const result = await saveBuiltinMcpSecrets(secretValues);
      setFeedback({
        tone: result.ok ? 'success' : 'error',
        title: result.ok ? '密钥已保存' : '保存密钥失败',
        impact: result.summary,
        nextStep: result.ok ? '返回 Platform 继续执行 Install 或 Repair。' : '检查密钥值后重试。',
        raw: result.raw,
        details: result.details,
        warnings: result.warnings,
      });
    } finally {
      setSavingSecrets(false);
    }
  }

  async function runCommunitySearch(query: string) {
    setCommunityLoading(true);
    try {
      if (previewMode) {
        setCommunityResults((current) => ({
          ...current,
          [communityView]: [],
        }));
        setCommunitySources((current) => ({
          ...current,
          [communityView]: [],
        }));
        return;
      }

      const result =
        communityView === 'skills' ? await searchExternalSkills(query) : await searchExternalMcp(query);

      setCommunityResults((current) => ({
        ...current,
        [communityView]: result.data?.results ?? [],
      }));
      setCommunitySources((current) => ({
        ...current,
        [communityView]: (result.data?.sources ?? []).map((item) => ({ id: item.id, name: item.name })),
      }));

      if (!result.ok) {
        setFeedback({
          tone: 'warn',
          title: '社区搜索未完成',
          impact: result.summary,
          nextStep: '可以换个关键词重试，或先使用当前设备上已经具备的能力。',
          raw: result.raw,
          details: result.details,
          warnings: result.warnings,
        });
      }
    } finally {
      setCommunityLoading(false);
    }
  }

  async function handleInstallCommunityItem(item: Record<string, unknown>) {
    if (previewMode) {
      setFeedback({
        tone: 'warn',
        title: '预览模式不执行安装',
        impact: '浏览器预览只展示社区能力，不会真实写入客户端。',
        nextStep: '请在 Tauri 桌面端里继续安装。',
        raw: '',
        details: [],
        warnings: [],
      });
      return;
    }

    const installId =
      (typeof item.id === 'string' && item.id) ||
      (typeof item.name === 'string' && item.name) ||
      (typeof item.skill === 'string' && item.skill) ||
      'unknown';

    setCommunityInstallingId(installId);
    try {
      const result =
        communityView === 'skills'
          ? await installExternalSkill({
              client: activeClient,
              source: typeof item.source === 'string' ? item.source : 'skills.sh',
              skill:
                (typeof item.skill === 'string' && item.skill) ||
                (typeof item.title === 'string' && item.title) ||
                installId,
            })
          : await installExternalMcp({
              client: activeClient,
              spec: (item.installSpec as {
                name: string;
                transport: 'stdio';
                command: string;
                args: string[];
                env?: Record<string, string>;
                requiredSecrets?: string[];
                packageIdentifier?: string;
              }) ?? {
                name: installId,
                transport: 'stdio',
                command: 'npx',
                args: [],
              },
            });

      setFeedback({
        tone: result.ok ? 'success' : 'error',
        title: result.ok ? '社区能力已安装' : '社区能力安装失败',
        impact: result.summary,
        nextStep: result.ok ? '返回 Platform 检查已安装结果，必要时再执行 Verify。' : '先查看详情和原始输出，再决定是否重试。',
        raw: result.raw,
        details: result.details,
        warnings: result.warnings,
      });

      await loadState();
      await runCommunitySearch(communityQuery);
    } finally {
      setCommunityInstallingId(null);
    }
  }

  async function runAction(kind: ActionKind) {
    if (activeClient === 'opencode' && kind !== 'bootstrap' && !detection?.detected) {
      setFeedback({
        tone: 'warn',
        title: '还没检测到 OpenCode',
        impact: '先安装或确认 OpenCode 客户端可用，再继续执行当前动作。',
        nextStep: '先执行安装 OpenCode，或确认 opencode 命令已经进入桌面端环境。',
        raw: '',
        details: [],
        warnings: [],
      });
      return;
    }

    setRunningAction(kind);
    try {
      if (previewMode) {
        const simulated = simulatePreviewAction(
          appState ?? clonePreviewState(),
          kind,
          activeClient,
          selectedMcpServers,
          selectedSkills,
          activeClient === 'codex' || activeClient === 'claude' ? 'full-library' : 'selected',
          requiredSecretKeys,
          secretValues
        );
        setAppState(simulated.next);
        setFeedback(buildActionFeedback(kind, activeClient, simulated.result));
        return;
      }
      if (kind === 'bootstrap') {
        const result = await bootstrapOfficialClient(activeClient);
        setFeedback(buildActionFeedback<BootstrapResultData>('bootstrap', activeClient, result));
      } else {
        const normalizedMcpServers = Array.from(new Set(selectedMcpServers)).sort((left, right) => left.localeCompare(right, 'en'));
        const normalizedSkillNames = Array.from(new Set(selectedSkills)).sort((left, right) => left.localeCompare(right, 'en'));
        const skillSyncMode: ActionPayload['skillSyncMode'] =
          activeClient === 'codex' || activeClient === 'claude' ? 'full-library' : 'selected';
        const payload: ActionPayload = {
          client: activeClient,
          cwd: workspace.trim() || undefined,
          lang: 'zh',
          roleTitle: activeRoleTitle,
          stackIds: [...activePersona.stackIds],
          components: selectedComponents,
          mcpServers: normalizedMcpServers,
          skillNames: normalizedSkillNames,
          skillSyncMode,
          secretValuesBase64: encodeSecrets(requiredSecretKeys, secretValues),
        };
        const result =
          kind === 'install'
            ? await installClientConfig(payload)
            : kind === 'repair'
            ? await repairClientConfig(payload)
            : await verifyClientConfig(payload);
        setFeedback(buildActionFeedback(kind, activeClient, result as ActionResult<unknown>));
      }
      await loadState({ preserveFeedback: true });
    } finally {
      setRunningAction(null);
    }
  }

  function requestAction(kind: ActionKind) {
    if (kind === 'install' || kind === 'repair') {
      setReviewAction(kind);
      setDrawerMode('review');
      return;
    }
    void runAction(kind);
  }

  function updateActivePersona(updater: (current: typeof activePersona) => typeof activePersona) {
    setPersonaDrafts((current) => ({
      ...current,
      [activeClient]: updater(current[activeClient]),
    }));
  }

  function toggleRole(nextRoleId: RoleId) {
    const nextRole = forgeRoleMcpMatrix.roles[nextRoleId];
    updateActivePersona((current) => ({
      ...current,
      roleIds: current.roleIds.includes(nextRoleId)
        ? current.roleIds.length === 1
          ? current.roleIds
          : current.roleIds.filter((item) => item !== nextRoleId)
        : [...current.roleIds, nextRoleId],
      stackIds: Array.from(new Set([...current.stackIds, ...nextRole.recommendedStacks])),
    }));
  }

  function toggleStack(stackId: StackId) {
    updateActivePersona((current) => {
      const exists = current.stackIds.includes(stackId);
      return {
        ...current,
        stackIds: exists
          ? current.stackIds.filter((item) => item !== stackId)
          : [...current.stackIds, stackId],
      };
    });
  }

  function toggleExtension(layer: ExtensionView) {
    const mappedLayer = layer === 'mcp' ? 'mcp' : 'memory';
    updateActivePersona((current) => ({
      ...current,
      enabledLayers: current.enabledLayers.includes(mappedLayer)
        ? current.enabledLayers.filter((item) => item !== mappedLayer)
        : [...current.enabledLayers, mappedLayer],
    }));
  }

  function toggleMcpServer(serverId: string) {
    updateActivePersona((current) => {
      const exists = current.mcpServers.includes(serverId);
      const nextServers = exists
        ? current.mcpServers.filter((item) => item !== serverId)
        : [...current.mcpServers, serverId];
      const nextLayers = nextServers.length > 0
        ? Array.from(new Set([...current.enabledLayers, 'mcp' as const]))
        : current.enabledLayers.filter((item) => item !== 'mcp');
      return { ...current, mcpServers: nextServers, enabledLayers: nextLayers };
    });
  }

  const mcpOptions = buildMcpOptions({
    client: activeClient,
    selectedMcpServers,
    recommendedMcpIds,
  });

  function toggleExtraSkill(skillId: string) {
    updateActivePersona((current) => {
      const exists = current.extraSkillIds.includes(skillId);
      return {
        ...current,
        extraSkillIds: exists
          ? current.extraSkillIds.filter((item) => item !== skillId)
          : [...current.extraSkillIds, skillId],
      };
    });
  }

  function selectAllOptionalSkills() {
    updateActivePersona((current) => ({
      ...current,
      extraSkillIds: Array.from(new Set([...current.extraSkillIds, ...skillOptions.optional.map((skill) => skill.id)])),
    }));
  }

  function selectClient(nextClient: Client) {
    setActiveClient(nextClient);
  }

  const runtime = appState?.runtime;
  const readinessIssues = [
    runtime?.nodeAvailable === false ? 'Node.js' : null,
    runtime?.pythonAvailable === false ? 'Python' : null,
    runtime?.gitAvailable === false ? 'Git' : null,
  ].filter(Boolean) as string[];
  const runtimeKnown = Boolean(runtime);
  const readinessSummary = !runtimeKnown
    ? '环境状态未加载'
    : readinessIssues.length === 0
      ? '运行前提已就绪'
      : `${readinessIssues.length} 项运行前提待处理`;
  const readinessTone = !runtimeKnown
    ? 'bg-slate-100 text-slate-600'
    : readinessIssues.length === 0
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-800';

  function runtimeValue(value: boolean | undefined) {
    if (value === true) return '可用';
    if (value === false) return '缺失';
    return '未加载';
  }

  function resolveRequirementAction() {
    if (!primaryRequirementAction) {
      setDrawerMode('requirements');
      return;
    }
    if (primaryRequirementAction.target === 'secrets') {
      setDrawerMode('secrets');
      return;
    }
    if (primaryRequirementAction.target === 'settings') {
      setSection('settings');
      return;
    }
    if (primaryRequirementAction.target === 'bootstrap') {
      void runAction('bootstrap');
      return;
    }
    setDrawerMode('details');
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] text-slate-900">
      <div className="mx-auto max-w-[1520px] px-4 py-4">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-black/5 bg-white/90 px-5 py-4 shadow-[0_18px_44px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex items-center gap-4">
            <img src={forgeBloomIcon} alt="Forge" className="h-11 w-11 rounded-[14px] shadow-[0_10px_24px_rgba(15,23,42,0.18)]" />
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.02em]">Forge Desktop</div>
              <div className="text-[12px] text-slate-500">{previewMode ? '平台页预览' : '多客户端 Forge 配置台'}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSection(tab.id)}
                  className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition ${
                    section === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void loadState()}
              disabled={isLoading || Boolean(runningAction)}
              className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </header>

        {section === 'platform' && (
          <div className="space-y-5">
            <PlatformClientSwitcherSection
              cards={cards}
              activeClient={activeClient}
              clientIcons={clientIcons}
              onSelectClient={selectClient}
            />

            <PlatformHeroSection
              hero={hero}
              secondaryLabel={
                hero.secondaryAction === 'requirements' && primaryRequirementAction
                  ? primaryRequirementAction.label
                  : hero.secondaryLabel
              }
              heroToneClass={heroToneClass}
              activeCardLabel={activeCard.label}
              activeCardTone={activeCard.tone}
              personaTitle={activeRoleTitle}
              requirementCount={requirements.length}
              runningAction={runningAction}
              activeClient={activeClient}
              onRunPrimaryAction={() => {
                if (hero.primaryAction === 'limited') {
                  resolveRequirementAction();
                  return;
                }
                void requestAction(hero.primaryAction);
              }}
              onRunSecondaryAction={() => {
                if (hero.secondaryAction === 'verify') {
                  void requestAction('verify');
                } else {
                  resolveRequirementAction();
                }
              }}
              onOpenActionsDrawer={() => setDrawerMode('actions')}
            />

            <PlatformAttentionStrip
              requirements={requirements}
              requirementActionLabel={primaryRequirementAction?.label}
              feedback={feedback}
              onOpenRequirements={resolveRequirementAction}
              onOpenToolbox={() => setDrawerMode('details')}
            />

            <PlatformWorkbenchSection
              workbenchView={workbenchView}
              setWorkbenchView={setWorkbenchView}
              workbenchTabs={workbenchTabs}
              roleOptions={roleOptions}
              onRoleSelect={toggleRole}
              recommendedStacks={stackOptions.recommended}
              optionalStacks={stackOptions.optional}
              onToggleStack={toggleStack}
              skillComposition={skillComposition}
              skillOptions={skillOptions}
              onToggleExtraSkill={toggleExtraSkill}
              onSelectAllOptionalSkills={selectAllOptionalSkills}
              activeCardLabel={activeCard.label}
              activeCardTone={activeCard.tone}
              applyScope={applyScope}
              latestFeedback={feedback}
              onDismissFeedback={dismissFeedback}
              extensionView={extensionView}
              setExtensionView={setExtensionView}
              extensionMeta={extensionMeta}
              currentExtension={currentExtension}
              requiredSecretKeys={requiredSecretKeys}
              toggleExtension={toggleExtension}
              mcpOptions={mcpOptions}
              onToggleMcpServer={toggleMcpServer}
              requirements={requirements}
              setDrawerMode={(mode) => setDrawerMode(mode)}
            />
          </div>
        )}

        {section === 'community' && (
          <div className="space-y-5">
            <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">社区</div>
                  <div className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">能力来源</div>
                  <div className="mt-2 text-[13px] leading-6 text-slate-500">
                    这里不讲规划，只看当前这台设备上已经能被 Forge Desktop 消费的能力来源。
                  </div>
                </div>
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-4">
                <InfoCard title="当前组合" detail={`${activeRoleTitle} · ${activePersona.stackIds.length} 个模块 · ${selectedSkills.length} 个能力`} />
                <InfoCard title="本机角色包" detail={`${forgeDeviceContext.forge.roleIds.length} 组`} />
                <InfoCard title="本机技能库" detail={`${forgeDeviceContext.device.localSkillIds.length} 个 skill`} />
                <InfoCard title="Codex 已配连接" detail={`${configuredCodexMcpPreview.length} 个 MCP`} />
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">本机快照</div>
                    <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em]">当前设备上的技能与连接</div>
                  </div>
                  <WorkbenchStat label={`${forgeDeviceContext.forge.builtinMcpServerIds.length} 个内置 MCP`} />
                </div>
                <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">Codex 当前已配置的 MCP</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {configuredCodexMcpPreview.map((item) => (
                      <WorkbenchStat key={`community-codex-mcp-${item}`} label={item} />
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">本机 skill 库预览</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {localSkillPreview.map((item) => (
                      <span
                        key={`community-skill-${item}`}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {forgeDeviceContext.device.localSkillIds.length > localSkillPreview.length ? (
                    <div className="mt-3 text-[11px] text-slate-500">
                      还有 {forgeDeviceContext.device.localSkillIds.length - localSkillPreview.length} 个本机 skill 已同步到项目快照。
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">当前接入状态</div>
                <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em]">项目内已经接住的来源</div>
                <div className="mt-2 text-[13px] leading-6 text-slate-500">
                  先把本机 Forge、Codex MCP 和本地 skill 库接实，再继续往外扩社区市场。
                </div>
                <div className="mt-5 space-y-3">
                  <InfoCard title="Forge Core" detail={`${forgeDeviceContext.forge.totalSkills} 个注册 skill、${forgeDeviceContext.forge.builtinMcpServerIds.length} 个内置 MCP 已同步进项目。`} />
                  <InfoCard title="本机覆盖" detail={installedCoverageSummary} />
                  <InfoCard
                    title="源注册健康"
                    detail={registryGhostCount === 0 ? '没有悬空来源或模块引用。' : `${registryGhostCount} 个悬空 skill 条目待处理。`}
                  />
                  <InfoCard title="最近同步" detail={forgeDeviceContext.updatedAt.replace('T', ' ').replace('Z', ' UTC')} mono />
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">当前建议</div>
                    <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em]">面向 {activeCard.label} 的优先能力</div>
                  </div>
                  <WorkbenchStat label={communityView === 'skills' ? `${recommendedSkillPreview.length} 个建议 skill` : `${recommendedMcpPreview.length} 个建议 MCP`} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
                  {([
                    ['skills', 'Skills'],
                    ['mcp', 'MCP'],
                  ] as Array<[CommunityView, string]>).map(([view, label]) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setCommunityView(view)}
                      className={`rounded-[10px] px-4 py-2 text-[12px] font-medium transition ${
                        communityView === view ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">
                    {communityView === 'skills' ? '当前角色组合建议的 skill' : '当前角色组合建议的 MCP'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(communityView === 'skills'
                      ? recommendedSkillPreview.map((item) => item.title)
                      : recommendedMcpPreview
                    ).map((item) => (
                      <WorkbenchStat key={`community-recommended-${communityView}-${item}`} label={item} />
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">
                    {activeCard.label} 当前已安装
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {installedCommunityItems.length > 0 ? (
                      installedCommunityItems.map((item) => (
                        <WorkbenchStat key={`community-installed-${communityView}-${item}`} label={communityView === 'skills' ? skillTitles([item])[0] : item} />
                      ))
                    ) : (
                      <div className="text-[12px] text-slate-500">当前客户端还没有这类已安装项。</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">外部来源</div>
                    <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em]">
                      搜索并安装 {communityView === 'skills' ? 'skill' : 'MCP'}
                    </div>
                    <div className="mt-2 text-[13px] leading-6 text-slate-500">
                      先按当前客户端筛选，再决定是否把外部能力安装到这台设备上。
                    </div>
                  </div>
                  <WorkbenchStat label={`面向 ${activeCard.label}`} />
                </div>
                <div className="mt-4 flex gap-3">
                  <input
                    name="community_query"
                    autoComplete="off"
                    spellCheck={false}
                    value={communityQuery}
                    onChange={(event) => setCommunityQuery(event.target.value)}
                    placeholder={communityView === 'skills' ? '搜索 skill，例如 review、auth、design' : '搜索 MCP，例如 github、browser、slack'}
                    className="w-full rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => void runCommunitySearch(communityQuery)}
                    disabled={communityLoading}
                    className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 disabled:opacity-50"
                  >
                    <Search className={`h-4 w-4 ${communityLoading ? 'animate-pulse' : ''}`} />
                    搜索
                  </button>
                </div>
                {communitySources[communityView].length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {communitySources[communityView].map((source) => (
                      <WorkbenchStat key={`community-source-${communityView}-${source.id}`} label={source.name} />
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 space-y-3">
                  {communityResults[communityView].length > 0 ? (
                    communityResults[communityView].map((rawItem, index) => {
                      const item = rawItem as Record<string, unknown>;
                      const itemId =
                        (typeof item.id === 'string' && item.id) ||
                        (typeof item.name === 'string' && item.name) ||
                        `${communityView}-${index}`;
                      const title = communityDisplayTitle(item);
                      const description =
                        (typeof item.description === 'string' && item.description) ||
                        (typeof item.summary === 'string' && item.summary) ||
                        '暂无说明';
                      const url = typeof item.url === 'string' ? item.url : '';
                      const installedKey = communityInstalledKey(item);
                      const alreadyInstalled = installedCommunityItems.includes(installedKey);
                      const installable = communityView === 'skills'
                        ? true
                        : item.installable !== false && Boolean(item.installSpec);
                      const recommended = communityView === 'skills'
                        ? recommendedSkillPreview.some((skill) => skill.title === title)
                        : recommendedMcpPreview.includes(installedKey);
                      const requiredSecrets =
                        communityView === 'mcp' && Array.isArray(item.requiredSecrets)
                          ? item.requiredSecrets.filter((value): value is string => typeof value === 'string')
                          : [];
                      const missingRequiredSecrets = requiredSecrets.filter((key) => !secretValues[key]);
                      const blockedByRuntime =
                        communityView === 'mcp' && !previewMode && !runtime?.pythonAvailable;
                      const installBlockedReason = !installable
                        ? '当前结果只支持浏览'
                        : missingRequiredSecrets.length > 0
                          ? `缺少密钥：${missingRequiredSecrets.join(' · ')}`
                          : blockedByRuntime
                            ? '当前环境缺少 Python，暂时不能安装 MCP'
                            : '';

                      return (
                        <div key={`community-result-${itemId}`} className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-[14px] font-semibold text-slate-900">{title}</div>
                                {alreadyInstalled ? <WorkbenchStat label="已安装" /> : null}
                                {recommended ? <WorkbenchStat label="推荐" /> : null}
                                {requiredSecrets.length > 0 ? <WorkbenchStat label={`${requiredSecrets.length} 个密钥`} /> : null}
                                {!installable ? <WorkbenchStat label="仅浏览" /> : null}
                              </div>
                              <div className="mt-2 text-[12px] leading-6 text-slate-600">{description}</div>
                              {requiredSecrets.length > 0 ? (
                                <div className="mt-2 text-[11px] text-slate-500">
                                  需要密钥：{requiredSecrets.join(' · ')}
                                </div>
                              ) : null}
                              {installBlockedReason ? (
                                <div className="mt-2 text-[11px] text-amber-700">{installBlockedReason}</div>
                              ) : null}
                              {url ? (
                                <button
                                  type="button"
                                  onClick={() => void openPathTarget(url)}
                                  className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                                >
                                  打开来源
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              disabled={alreadyInstalled || !installable || blockedByRuntime || missingRequiredSecrets.length > 0 || communityInstallingId === itemId}
                              onClick={() => void handleInstallCommunityItem(item)}
                              className="inline-flex items-center gap-2 rounded-[12px] bg-slate-900 px-4 py-2 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {communityInstallingId === itemId ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                              {alreadyInstalled ? '已安装' : installable ? '安装到当前客户端' : '仅浏览'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-[13px] text-slate-500">
                      {communityLoading ? '正在拉取外部来源…' : '还没有搜索结果。先输入关键词，或直接使用当前建议与已安装项。'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'settings' && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">设置</div>
              <div className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">环境设置</div>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 text-[13px] font-medium text-slate-800">当前工作区</div>
                  <input
                    name="workspace_path"
                    autoComplete="off"
                    spellCheck={false}
                    value={workspace}
                    onChange={(event) => setWorkspace(event.target.value)}
                    className="w-full rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] outline-none focus:border-slate-400"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoCard title="仓库根目录" detail={runtime?.repoRoot || '加载中'} mono />
                  <InfoCard title="运行缓存" detail={runtime?.runtimeCacheRoot || '加载中'} mono />
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">本机 Forge 快照</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <SummaryRow label="角色包" value={`${forgeDeviceContext.forge.roleIds.length} 组`} />
                    <SummaryRow label="Stack 包" value={`${forgeDeviceContext.forge.stackIds.length} 组`} />
                    <SummaryRow label="技能库" value={`${forgeDeviceContext.device.localSkillIds.length} 个`} />
                    <SummaryRow label="Codex MCP" value={`${configuredCodexMcpPreview.length} 个`} />
                    <SummaryRow label="源注册悬空" value={`${forgeDeviceContext.health.sourceGhostSkillIds.length} 个`} />
                    <SummaryRow label="模块悬空" value={`${forgeDeviceContext.health.moduleGhostSkillIds.length} 个`} />
                  </div>
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">Codex 当前 MCP</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {configuredCodexMcpPreview.map((item) => (
                      <WorkbenchStat key={`settings-codex-mcp-${item}`} label={item} />
                    ))}
                  </div>
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">环境诊断</div>
                  <div className="mt-3 space-y-2">
                    {combinedWarnings.length > 0 ? (
                      combinedWarnings.map((item) => (
                        <div
                          key={`settings-warning-${item}`}
                          className="rounded-[12px] border border-amber-200 bg-white px-3 py-2 text-[12px] leading-6 text-slate-700"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[12px] border border-emerald-200 bg-white px-3 py-2 text-[12px] leading-6 text-emerald-700">
                        当前没有运行时或快照警告。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">运行环境</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="text-[20px] font-semibold tracking-[-0.03em]">运行前提</div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${readinessTone}`}>
                  {readinessSummary}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <SummaryRow label="Node.js" value={runtimeValue(runtime?.nodeAvailable)} />
                <SummaryRow label="Python" value={runtimeValue(runtime?.pythonAvailable)} />
                <SummaryRow label="Git" value={runtimeValue(runtime?.gitAvailable)} />
              </div>
              <div className="mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">当前客户端诊断</div>
                    <div className="mt-2 text-[12px] leading-6 text-slate-600">
                      直接检查当前选中的客户端，不需要回到 Platform 再找动作。
                    </div>
                  </div>
                  <Bot className="h-4 w-4 text-slate-500" />
                </div>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="当前客户端" value={activeCard.label} />
                  <SummaryRow label="当前状态" value={activeCard.supportNote} />
                  <SummaryRow label="已装能力" value={`${activeCard.installedSkillCount} 个`} />
                  <SummaryRow label="已装连接" value={`${activeCard.installedMcpCount} 个`} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void requestAction('verify')}
                    disabled={Boolean(runningAction)}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 disabled:opacity-50"
                  >
                    <CheckCheck className="h-4 w-4" />
                    验证当前客户端
                  </button>
                  <button
                    type="button"
                    onClick={() => (detection?.home ? void openPathTarget(detection.home) : undefined)}
                    disabled={!detection?.home}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 disabled:opacity-50"
                  >
                    <FolderOpen className="h-4 w-4" />
                    打开客户端目录
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadState()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    重新检测环境
                  </button>
                </div>
              </div>
              <div className="mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">客户端概况</div>
                    <div className="mt-2 text-[12px] leading-6 text-slate-600">
                      客户端逐项状态收在二级层，不和运行前提平铺在同一屏。
                    </div>
                  </div>
                  <Bot className="h-4 w-4 text-slate-500" />
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerMode('clients')}
                  className="mt-4 inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                >
                  查看客户端概况
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {drawerMode ? (
          <Drawer
            onClose={() => {
              setDrawerMode(null);
              setReviewAction(null);
            }}
          >
            {drawerMode === 'actions' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title="更多操作"
                  description="主页只保留当前主动作，其他动作集中放在这里。"
                  onClose={() => setDrawerMode(null)}
                />
                <div className={`rounded-[18px] border px-4 py-4 ${feedback ? feedbackTone(feedback.tone) : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                  <div className="text-[13px] font-semibold">{feedback ? feedback.title : hero.title}</div>
                  <div className="mt-1 text-[12px] leading-6 text-current/80">
                    {feedback ? feedback.nextStep : hero.summary}
                  </div>
                </div>
                <div className="space-y-2">
                  {actionMenuItems.map((item) => (
                    <ActionMenuItem
                      key={item.key}
                      title={item.title}
                      detail={item.detail}
                      icon={item.icon}
                      disabled={item.disabled}
                      onClick={() => {
                        setDrawerMode(null);
                        item.onClick();
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setDrawerMode('details')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-slate-300 bg-white px-4 py-3 text-[13px] font-medium text-slate-600"
                  >
                    查看详情
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : drawerMode === 'review' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title={reviewAction === 'repair' ? '确认修复内容' : '确认应用内容'}
                  description="执行前只确认三件事：会写什么、还差什么、落到哪里。"
                  onClose={() => {
                    setDrawerMode(null);
                    setReviewAction(null);
                  }}
                />
                <div
                  className={`rounded-[18px] border px-4 py-4 ${
                    requirements.length > 0 ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  <div className="text-[13px] font-semibold">
                    {requirements.length > 0 ? '当前还不能直接执行' : '当前可以直接执行'}
                  </div>
                  <div className="mt-1 text-[12px] leading-6 text-current/85">
                    {requirements.length > 0
                      ? `还有 ${requirements.length} 项前提待处理，先补齐再执行 ${reviewAction === 'repair' ? '修复' : '应用'}。`
                      : `${activeRoleTitle} 这套 Forge 组合会写入当前 ${activeCard.label} 客户端。`}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoCard title="角色组合" detail={activeRoleTitle} />
                  <InfoCard title="模块" detail={`${activePersona.stackIds.length} 项`} />
                  <InfoCard title="能力" detail={`${selectedSkills.length} 项`} />
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">会写入</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {applyScope.writeItems.map((item) => (
                      <WorkbenchStat key={`review-write-${item}`} label={item} />
                    ))}
                  </div>
                </div>
                {applyScope.skipItems.length > 0 ? (
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[12px] font-semibold text-slate-900">这次不会写入</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {applyScope.skipItems.map((item) => (
                        <span
                          key={`review-skip-${item}`}
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">目标与落点</div>
                  <div className="mt-3 space-y-3 rounded-[14px] border border-slate-200 bg-white px-3 py-3">
                    {applyScope.targetItems.map((item) => (
                      <SummaryRow key={`review-target-${item.label}`} label={item.label} value={item.value} />
                    ))}
                  </div>
                </div>
                {requirements.length > 0 ? (
                  <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <div className="text-[13px] font-semibold">需要先处理</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {requirements.map((item) => (
                        <span
                          key={`review-requirement-${item.id}`}
                          className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-amber-900 ring-1 ring-amber-200"
                        >
                          {item.title}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerMode('requirements');
                        setReviewAction(null);
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-amber-300 bg-white/80 px-3 py-2 text-[12px] font-medium text-amber-900"
                    >
                      去处理前提
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={!reviewAction || requirements.length > 0 || Boolean(runningAction)}
                  onClick={() => {
                    const nextAction = reviewAction;
                    setDrawerMode(null);
                    setReviewAction(null);
                    if (nextAction) {
                      void runAction(nextAction);
                    }
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-slate-900 px-4 py-3 text-[13px] font-medium text-white disabled:opacity-50"
                >
                  {runningAction ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                  {reviewAction === 'repair' ? '确认修复' : '确认应用'}
                </button>
              </div>
            ) : drawerMode === 'requirements' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title="先处理这些前提"
                  description="先把这里补齐，再回到主页执行应用、修复或验证。"
                  onClose={() => setDrawerMode(null)}
                />
                {requirements.length > 0 ? (
                  <div className="space-y-3">
                    {requirements.map((item) => (
                      <div key={`drawer-requirement-${item.id}`} className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-[14px] font-semibold text-slate-900">{item.title}</div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${requirementTone(item.tone)}`}>
                            {item.tone === 'blocked' ? '阻塞' : item.tone === 'limited' ? '受限' : '待补齐'}
                          </span>
                        </div>
                        <div className="mt-1 text-[12px] leading-6 text-slate-600">{item.detail}</div>
                        <div className="mt-3 rounded-[14px] border border-slate-200 bg-white px-3 py-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">下一步</div>
                          <div className="mt-1 text-[12px] leading-6 text-slate-800">{item.nextStep}</div>
                        </div>
                        {item.actionLabel && item.actionTarget ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (item.actionTarget === 'secrets') {
                                setDrawerMode('secrets');
                                return;
                              }
                              if (item.actionTarget === 'settings') {
                                setDrawerMode(null);
                                setSection('settings');
                                return;
                              }
                              if (item.actionTarget === 'bootstrap') {
                                setDrawerMode(null);
                                void runAction('bootstrap');
                                return;
                              }
                              setDrawerMode('details');
                            }}
                            className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                          >
                            {item.actionLabel}
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <InfoCard title="当前没有阻塞项" detail="可以直接回到主区执行应用、修复或校验。" />
                )}
              </div>
            ) : drawerMode === 'details' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title="更多信息"
                  description="路径、环境状态和最近一次动作结果都放在这里。"
                  onClose={() => setDrawerMode(null)}
                />
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">环境状态</div>
                  <div className="mt-3 space-y-3 rounded-[14px] border border-slate-200 bg-white px-3 py-3">
                    <SummaryRow label="Node.js" value={runtime?.nodeAvailable ? '可用' : '缺失'} />
                    <SummaryRow label="Python" value={runtime?.pythonAvailable ? '可用' : '缺失'} />
                    <SummaryRow label="Git" value={runtime?.gitAvailable ? '可用' : '缺失'} />
                    <SummaryRow label="客户端状态" value={supportLabel(support?.ok)} />
                  </div>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  <AdvancedCard
                    title="工作区"
                    value={workspace}
                    actionLabel="打开终端"
                    onAction={() => void openWorkspace(workspace)}
                    icon={<TerminalSquare className="h-4 w-4" />}
                  />
                  <AdvancedCard
                    title="客户端目录"
                    value={detection?.home || '未检测到'}
                    actionLabel="打开目录"
                    onAction={() => (detection?.home ? void openPathTarget(detection.home) : undefined)}
                    icon={<FolderOpen className="h-4 w-4" />}
                    disabled={!detection?.home}
                  />
                </div>
                {feedback ? (
                  <div className="space-y-3">
                    <div className={`rounded-[18px] border px-4 py-4 ${feedbackTone(feedback.tone)}`}>
                      <div className="text-[13px] font-semibold">{feedback.title}</div>
                      <div className="mt-1 text-[12px] leading-6 text-current/85">{feedback.impact}</div>
                      <div className="mt-2 text-[12px] leading-6 text-current/75">{feedback.nextStep}</div>
                    </div>
                    <InfoCard title="动作详情" detail={feedback.details.join('\n') || '暂无'} mono />
                    <InfoCard title="警告" detail={feedback.warnings.join('\n') || '暂无'} mono />
                    <InfoCard title="原始输出" detail={feedback.raw || '暂无'} mono />
                  </div>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-2">
                    <InfoCard title="标准输出" detail={support?.stdout || '暂无'} mono />
                    <InfoCard title="错误输出" detail={support?.stderr || '暂无'} mono />
                  </div>
                )}
              </div>
            ) : drawerMode === 'connections' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title={extensionView === 'mcp' ? '连接清单' : '记忆清单'}
                  description={
                    extensionView === 'mcp'
                      ? '连接器作为补强层单独查看，避免在主区铺开一整片清单。'
                      : '记忆层只在这里确认带入范围，不和角色能力混在同一屏。'
                  }
                  onClose={() => setDrawerMode(null)}
                />
                <InfoCard
                  title="当前策略"
                  detail={
                    extensionView === 'mcp'
                      ? `${activeRoleTitle} 当前已选 ${currentExtension.items.length} 个连接器，推荐 ${currentExtension.suggestedItems.length} 个。`
                      : memoryEnabled
                        ? '当前会一起带入工作区记忆和项目记忆。'
                        : '当前不会写入记忆层，如需带入上下文可在主区开启。'
                  }
                />
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">
                    {extensionView === 'mcp' ? '当前已纳入的连接' : '当前会带入的记忆'}
                  </div>
                  {currentExtension.items.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentExtension.items.map((item) => (
                        <WorkbenchStat key={`drawer-connection-item-${item}`} label={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-[12px] leading-6 text-slate-500">
                      {extensionView === 'mcp' ? '当前还没有纳入连接器。' : '当前没有带入记忆层。'}
                    </div>
                  )}
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">
                    {extensionView === 'mcp' ? '按当前 persona 推荐' : '建议带入'}
                  </div>
                  <div className="mt-2 text-[12px] leading-6 text-slate-600">
                    {extensionView === 'mcp'
                      ? '推荐项来自当前 role 和已选 stacks，只保留对当前工作方式真正有帮助的补强连接。'
                      : '记忆层建议默认带入，方便把工作区上下文延续到客户端里。'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentExtension.suggestedItems.map((item) => (
                      <WorkbenchStat key={`drawer-connection-suggested-${item}`} label={item} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extensionView === 'mcp' ? (
                    <button
                      type="button"
                      onClick={() => setDrawerMode('secrets')}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                    >
                      <Settings2 className="h-4 w-4" />
                      去管理密钥
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setDrawerMode('details')}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700"
                  >
                    查看更多信息
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : drawerMode === 'skills' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title="包含能力"
                  description="这里展示当前角色组合自动收拢进来的能力项，不占主区阅读空间。"
                  onClose={() => setDrawerMode(null)}
                />
                <InfoCard
                  title="能力概览"
                  detail={`${activeRoleTitle} 当前包含 ${skillComposition.totalCount} 个能力，围绕已选角色和模块自动收拢。`}
                />
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">核心能力</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillComposition.primarySkills.map((skill) => (
                      <div key={`drawer-primary-skill-${skill.id}`} className="rounded-[14px] border border-slate-200 bg-white px-3 py-2">
                        <div className="text-[12px] font-semibold text-slate-900">{skill.title}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{skill.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[12px] font-semibold text-slate-900">补强能力</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillComposition.supportSkills.length > 0 ? (
                      skillComposition.supportSkills.map((skill) => (
                        <div key={`drawer-support-skill-${skill.id}`} className="rounded-[14px] border border-slate-200 bg-white px-3 py-2">
                          <div className="text-[12px] font-semibold text-slate-900">{skill.title}</div>
                          <div className="mt-1 text-[10px] text-slate-500">{skill.reason}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[12px] text-slate-500">当前这一组角色和 stacks 已经足够集中。</div>
                    )}
                  </div>
                  {skillComposition.hiddenSkillCount > 0 ? (
                    <div className="mt-3 text-[11px] text-slate-500">还有 {skillComposition.hiddenSkillCount} 个 skills 已被收拢到这次配置里。</div>
                  ) : null}
                </div>
              </div>
            ) : drawerMode === 'secrets' ? (
              <div className="space-y-6">
                <DrawerHeader
                  title="密钥"
                  description="这里只显示当前角色组合真正需要的密钥项。"
                  onClose={() => setDrawerMode(null)}
                />
                {requiredSecretKeys.length > 0 ? (
                  <div className="space-y-4">
                    {requiredSecretKeys.map((key) => (
                      <div key={key} className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="text-[14px] font-semibold text-slate-900">{secretHints[key] ? secretHints[key].split('；')[0] : key}</div>
                        <div className="mt-1 text-[12px] leading-6 text-slate-500">{secretHints[key] || key}</div>
                        <input
                          name={key}
                          autoComplete="off"
                          spellCheck={false}
                          value={secretValues[key] || ''}
                          onChange={(event) => setSecretValues((current) => ({ ...current, [key]: event.target.value }))}
                          placeholder={key}
                          className="mt-3 w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 font-mono text-[13px] outline-none focus:border-slate-400"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => void saveSecrets()}
                      disabled={savingSecrets}
                      className="inline-flex items-center gap-2 rounded-[14px] bg-slate-900 px-4 py-3 text-[13px] font-medium text-white disabled:opacity-50"
                    >
                      {savingSecrets ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
                      保存密钥
                    </button>
                  </div>
                ) : (
                  <InfoCard title="当前角色组合没有额外密钥要求" detail="如果你切换到包含 Exa 的连接组合，这里会自动出现对应的密钥输入项。" />
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <DrawerHeader
                  title="客户端概况"
                  description="客户端逐项状态放在这里看，不占设置页主区。"
                  onClose={() => setDrawerMode(null)}
                />
                <div className="space-y-2">
                  {cards.map((card) => (
                    <div
                      key={`drawer-client-${card.id}`}
                      className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Bot className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-[13px] font-medium text-slate-900">{card.label}</div>
                          <div className="mt-1 text-[12px] text-slate-500">{card.supportNote}</div>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusTone(card)}`}>
                        {supportLabel(card.healthy)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Drawer>
        ) : null}
      </div>
    </div>
  );
}

function encodeSecrets(requiredKeys: string[], values: Record<string, string>) {
  if (requiredKeys.length === 0) {
    return null;
  }
  const payload = Object.fromEntries(requiredKeys.filter((key) => values[key]).map((key) => [key, values[key]]));
  if (Object.keys(payload).length === 0) {
    return null;
  }
  return btoa(JSON.stringify(payload));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
