import { Blocks, Bot, FolderKanban, Gauge, Rocket, Settings2, Sparkles, TerminalSquare } from 'lucide-react';
import { clients } from '../domain/seed';
import type { ClientId, WorkbenchSection } from '../domain/model';
import { navigation } from './routes';

const navIcons = {
  overview: Gauge,
  workspaces: FolderKanban,
  'roles-stacks': Blocks,
  'skills-prompts': Sparkles,
  tools: Bot,
  diagnostics: TerminalSquare,
  release: Rocket,
  settings: Settings2,
} satisfies Record<WorkbenchSection, React.ComponentType<{ className?: string }>>;

export function Sidebar({
  section,
  activeClient,
  onSectionChange,
  onClientChange,
}: {
  section: WorkbenchSection;
  activeClient: ClientId;
  onSectionChange: (section: WorkbenchSection) => void;
  onClientChange: (client: ClientId) => void;
}) {
  return (
    <>
      <div>
        <div className="wb-kicker">Forge Workbench</div>
        <div className="mt-3 wb-title">团队 AI 工作台</div>
        <div className="mt-3 text-sm leading-6 text-[#5f5953]">
          当前方向不是继续堆安装页，而是重建一个面向团队的桌面工作台，让角色、Stack、Prompt、Skill 和 Tool 在一个空间内协同。
        </div>
      </div>

      <section className="wb-panel rounded-[24px] px-4 py-4">
        <div className="wb-kicker">当前客户端视角</div>
        <div className="mt-3 space-y-2">
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => onClientChange(client.id)}
              className={`wb-nav-button ${activeClient === client.id ? 'active' : ''}`}
            >
              <div className="text-sm font-semibold">{client.title}</div>
              <div className="mt-1 text-xs text-[#6a655f]">{client.summary}</div>
            </button>
          ))}
        </div>
      </section>

      <nav className="wb-panel flex-1 rounded-[28px] px-4 py-4">
        <div className="wb-kicker">工作台导航</div>
        <div className="mt-3 space-y-2">
          {navigation.map((item) => {
            const Icon = navIcons[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`wb-nav-button ${section === item.id ? 'active' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <div className="mt-1 text-xs text-[#6a655f]">{item.summary}</div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
