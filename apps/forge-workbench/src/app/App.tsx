import React from 'react';
import { AppShell } from './AppShell';
import { Sidebar } from './Sidebar';
import { RightRail } from './RightRail';
import { navigation } from './routes';
import { OverviewPage } from '../features/overview/OverviewPage';
import { WorkspacesPage } from '../features/workspaces/WorkspacesPage';
import { RolesStacksPage } from '../features/roles-stacks/RolesStacksPage';
import { SkillsPromptsPage } from '../features/skills-prompts/SkillsPromptsPage';
import { ToolsPage } from '../features/tools/ToolsPage';
import { DiagnosticsPage } from '../features/diagnostics/DiagnosticsPage';
import { ReleasePage } from '../features/release/ReleasePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import type { ClientId, ShellSnapshot, WorkbenchSection } from '../domain/model';
import { emptySnapshot } from '../domain/seed';
import { getShellSnapshot, openTarget, openTerminalHere } from '../lib/backend';

export function App() {
  const [section, setSection] = React.useState<WorkbenchSection>('overview');
  const [activeClient, setActiveClient] = React.useState<ClientId>('codex');
  const [snapshot, setSnapshot] = React.useState<ShellSnapshot>(emptySnapshot);

  React.useEffect(() => {
    void (async () => {
      const next = await getShellSnapshot();
      setSnapshot(next);
    })();
  }, []);

  const currentNav = navigation.find((item) => item.id === section);

  return (
    <AppShell
      sidebar={(
        <Sidebar
          section={section}
          activeClient={activeClient}
          onSectionChange={setSection}
          onClientChange={setActiveClient}
        />
      )}
      main={(
        <>
          <div className="wb-kicker">Greenfield Rewrite</div>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <div className="wb-title">{currentNav?.title}</div>
              <div className="mt-3 max-w-4xl text-sm leading-6 text-[#5f5953]">
                Forge Workbench 当前的任务不是复制旧桌面端，而是把旧能力重新放进新的产品结构里。
                这里的主角是工作空间、角色、Stack、Prompt Pack 和 Skill Cluster，工具层退到工作流之后。
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="wb-chip" onClick={() => void openTarget(snapshot.repoRoot || '.')}>打开仓库</button>
              <button type="button" className="wb-chip" onClick={() => void openTerminalHere(snapshot.repoRoot || '.')}>打开终端</button>
            </div>
          </div>

          <section className="mt-6">
            {section === 'overview' && <OverviewPage snapshot={snapshot} activeClient={activeClient} />}
            {section === 'workspaces' && <WorkspacesPage />}
            {section === 'roles-stacks' && <RolesStacksPage />}
            {section === 'skills-prompts' && <SkillsPromptsPage />}
            {section === 'tools' && <ToolsPage />}
            {section === 'diagnostics' && <DiagnosticsPage snapshot={snapshot} />}
            {section === 'release' && <ReleasePage />}
            {section === 'settings' && <SettingsPage />}
          </section>
        </>
      )}
      rail={<RightRail snapshot={snapshot} />}
    />
  );
}
