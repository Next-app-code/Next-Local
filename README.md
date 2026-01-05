<div align="center">

![NEXT](./navbeo.png)

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/NextLabs_)
[![Website](https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://app.nextlabs.work/)
[![GitHub stars](https://img.shields.io/github/stars/Next-app-code/Next-Web?style=for-the-badge&logo=github)](https://github.com/Next-app-code/Next-Web/stargazers)

Command-line interface for executing Next workflows locally.

</div>

## Overview

Next Local allows you to run Solana visual workflows from the command line. Execute workflows created in the Next web editor without a browser, perfect for automation, scripting, and CI/CD pipelines.

## Installation

```bash
npm install
npm run build
npm link
```

After linking, the `next-local` command will be available globally.

## Commands

### Run a Workflow

Execute a workflow from a JSON file:

```bash
next-local run workflow.json
```

Options:
- `-r, --rpc <endpoint>` - Override the RPC endpoint
- `-k, --keypair <path>` - Path to keypair file for signing transactions
- `-d, --dry-run` - Simulate execution without sending transactions
- `-v, --verbose` - Show detailed execution logs

Examples:

```bash
# Run with custom RPC
next-local run workflow.json --rpc https://api.devnet.solana.com

# Dry run to test workflow
next-local run workflow.json --dry-run --verbose

# Run with keypair for transaction signing
next-local run workflow.json --keypair ~/.config/solana/id.json
```

### Validate a Workflow

Check a workflow file for errors without executing:

```bash
next-local validate workflow.json
```

This checks for:
- Valid JSON structure
- Known node types
- Valid node connections
- Cycle detection
- Missing required fields

### List Available Nodes

View all supported node types:

```bash
next-local nodes
```

Filter by category:

```bash
next-local nodes --category rpc
next-local nodes --category math
```

### Initialize a New Workflow

Create a new workflow configuration file:

```bash
next-local init
```

Options:
- `-n, --name <name>` - Workflow name

This creates a JSON file that can be edited in the Next web editor.

## Workflow Format

Workflows are JSON files with the following structure:

```json
{
  "id": "unique-id",
  "name": "My Workflow",
  "nodes": [...],
  "edges": [...],
  "rpcEndpoint": "https://api.mainnet-beta.solana.com"
}
```

The format is compatible with exports from the Next web editor.

## Supported Node Types

### RPC
- RPC Connection
- Get Balance
- Get Account Info
- Get Slot
- Get Block Height
- Get Recent Blockhash

### Math
- Add, Subtract, Multiply, Divide
- Lamports to SOL conversion
- SOL to Lamports conversion

### Logic
- Compare
- AND, OR, NOT
- Switch (conditional)

### Input/Output
- String, Number, Boolean inputs
- Public Key input
- Display and Console Log

### Utility
- Delay
- JSON Parse/Stringify
- Get Property

## Development

```bash
# Run in development mode
npm run dev -- run workflow.json

# Watch for changes
npm run watch

# Build for production
npm run build
```

## License

MIT

