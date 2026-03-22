import { primaryRoles, primaryStacks } from '../../domain/seed';

export function RolesStacksPage() {
  return (
    <div className="wb-grid two">
      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">主角色</div>
        <div className="mt-4 space-y-3">
          {primaryRoles.map((role) => (
            <div key={role.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="text-base font-semibold">{role.title}</div>
              <div className="mt-1 text-sm text-[#5f5953]">{role.summary}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="wb-panel rounded-[28px] px-5 py-5">
        <div className="wb-kicker">主栈包</div>
        <div className="mt-4 space-y-3">
          {primaryStacks.map((stack) => (
            <div key={stack.id} className="rounded-[20px] border border-[rgba(47,39,29,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <div className="text-base font-semibold">{stack.title}</div>
              <div className="mt-1 text-sm text-[#5f5953]">{stack.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
