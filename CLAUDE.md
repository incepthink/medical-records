# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite HMR)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run tests once (vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## Architecture

**VaultMed** is a blockchain-based medical records demo app. Medical records are represented as NFTs minted on **Base Sepolia** testnet. The app has three distinct user personas: `doctor`, `patient`, and `hospital`.

### Provider stack (`App.tsx`)

```
WagmiProvider → QueryClientProvider → RainbowKitProvider
  → AuthProvider → CollectionsProvider → TooltipProvider
    → BrowserRouter (basename: /examples/medical-records)
```

### Authentication & routing

- `AuthContext` (`src/context/AuthContext.tsx`) — holds the active `Persona` (`"doctor" | "patient" | "hospital"`) and a mock `User`. Login is purely client-side; no real auth backend.
- `ProtectedLayout` wraps each persona's routes and redirects unauthenticated users to `/` or wrong-persona users to their own dashboard.
- Entry: `/auth/:persona` → `AuthPage` → sets context → redirects to `/:persona/dashboard`.

### Data layer

All state lives in **`CollectionsContext`** (`src/context/CollectionsContext.tsx`), seeded from `src/mock/data.ts`. There is no backend or blockchain calls for CRUD — everything is in-memory React state. Blockchain integration is limited to wallet connection via wagmi/RainbowKit (Base Sepolia).

Key data types in `src/mock/data.ts`:
- `MedicalRecord` — NFT record with `tokenId`, `contractAddress`, `txHash`, `patientWallet`
- `Collection` — doctor-owned grouping of records
- `SharedAccess` — hospital access grant per record
- `ViewLog` — audit trail of hospital views with `signatureHash`
- `SharedRecordForHospital` — hospital's view of records shared to them

### UI

- All UI primitives are shadcn/ui components in `src/components/ui/` — do not edit these directly.
- Custom components: `Navbar`, `NavLink`, `ProtectedLayout` in `src/components/`.
- Tailwind CSS with `tailwindcss-animate`; path alias `@/` maps to `src/`.
- Toasts: use `sonner` (`useToast` hook from `src/hooks/use-toast.ts`).

### Wallet config

`src/config/wagmi.ts` — configured for Base Sepolia only via RainbowKit's `getDefaultConfig`.
