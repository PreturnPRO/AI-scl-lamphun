# Express TypeScript Server

Node.js Express server with TypeScript

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production build
- `npm run watch` - Watch mode for TypeScript compilation
- `npm run lint` - Run ESLint

## Project Structure

```
server/
├── src/
│   ├── index.ts       # Main server entry point
│   └── sync.ts        # Sync functionality
├── dist/              # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .eslintrc.json
```
