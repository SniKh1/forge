# Forge Core

Forge Core stores client-agnostic capability definitions used by adapters.

## Contents

- `mcp-servers.json`: canonical MCP server catalog with per-client support flags
- `capability-matrix.json`: first-pass capability support matrix across clients
- `memory-layout.md`: shared memory and learned-skill layout conventions

Adapters should read from Core instead of hardcoding capability definitions.

Related docs:

- [`../docs/CLIENT-CAPABILITY-MATRIX.md`](../docs/CLIENT-CAPABILITY-MATRIX.md)
- [`../docs/user/getting-started.md`](../docs/user/getting-started.md)
