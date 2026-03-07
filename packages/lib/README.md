# @repo/lib

Shared utility library for the monorepo.

## Installation

This package is part of the monorepo and is installed via workspace dependencies:

```json
{
  "dependencies": {
    "@repo/lib": "workspace:*"
  }
}
```

## Usage

```typescript
import { sleep, isDefined, formatDate } from '@repo/lib';

// Sleep for 1 second
await sleep(1000);

// Check if value is defined
const value = isDefined(someValue) ? someValue : 'default';

// Format date
const dateString = formatDate(new Date());
```

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev

# Lint
pnpm lint
```

## Structure

```
lib/
├── src/
│   ├── index.ts          # Main entry point
│   └── utils/            # Utility functions
│       └── index.ts
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```
