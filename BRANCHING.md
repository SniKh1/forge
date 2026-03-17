# Forge Branching Strategy

Forge uses a deliberately small branch model:

| Branch | Purpose | Push Policy | Release Policy |
| --- | --- | --- | --- |
| `public` | External-facing stable line | No direct push except owner emergency fixes | Only this branch may produce release tags |
| `dev` | Full internal integration line | Owner and core maintainers may push | Never tag releases directly |
| `feature/*` | Short-lived task branches | Free to push | Must merge back into `dev` |
| `hotfix/*` | Short-lived urgent fixes | Free to push | Merge into `dev`, then promote to `public` |
| `master` | Transitional compatibility branch | Keep in sync only while migrating settings | Do not use for new release policy |

## Recommended GitHub Protection

These controls must be configured in GitHub repository settings because they cannot be enforced fully from git alone.

Important visibility rule:

- GitHub branch visibility is repository-level, not branch-level.
- If the repository is public, pushed `dev`, `public`, and `master` branches are all publicly visible.
- True internal-only work needs either a private repository or a separate public mirror.

### `public`

- Set as the default branch after migration.
- Disable direct pushes for everyone except the repo owner.
- Require pull requests before merging.
- Require at least 1 approval.
- Require status checks:
  - `CI / validate`
- Require code owner review.
- Disable force pushes.
- Disable branch deletion.

### `dev`

- Allow owner push access.
- Optional pull requests for collaborators.
- Disable force pushes.
- Disable branch deletion.

### `feature/*` and `hotfix/*`

- Leave unprotected.
- Delete after merge.

## Release Rule

Forge release tags must point to commits reachable from `public`.

The release workflow enforces this rule, so even if a tag is pushed from another branch, the job will fail unless that commit is on `public`.

## Promotion Flow

1. Work lands on `feature/*` or `hotfix/*`.
2. Merge into `dev`.
3. Curate and promote from `dev` to `public`.
4. Create release tags from `public`.
