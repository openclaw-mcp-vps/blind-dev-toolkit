# Build Task: blind-dev-toolkit

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: blind-dev-toolkit
HEADLINE: Screen reader optimized coding environment and tools
WHAT: A specialized IDE and toolkit designed for blind and visually impaired developers, with optimized screen reader integration, audio code navigation, and accessible debugging tools that work seamlessly with NVDA, JAWS, and VoiceOver.
WHY: Blind developers spend 3-5x longer navigating standard IDEs due to poor screen reader support and visual-first interfaces. With remote work increasing demand for diverse talent, companies need accessible dev tools to tap into this underserved market.
WHO PAYS: Blind and visually impaired software engineers at tech companies, accessibility consultants building inclusive products, and development teams committed to hiring diverse talent who need proper tooling to onboard blind developers effectively.
NICHE: accessibility-tools
PRICE: $$19/mo

ARCHITECTURE SPEC:
A Next.js web application that provides a screen reader-optimized code editor with audio navigation cues, accessible debugging tools, and seamless integration with popular screen readers. The architecture uses a modular design with specialized accessibility components, real-time audio feedback systems, and keyboard-first navigation patterns.

PLANNED FILES:
- app/page.tsx
- app/editor/page.tsx
- app/dashboard/page.tsx
- app/api/auth/route.ts
- app/api/lemonsqueezy/webhook/route.ts
- components/AccessibleEditor.tsx
- components/AudioNavigator.tsx
- components/ScreenReaderOptimized.tsx
- components/KeyboardShortcuts.tsx
- components/AccessibleDebugger.tsx
- components/PricingTable.tsx
- lib/accessibility-utils.ts
- lib/audio-feedback.ts
- lib/screen-reader-api.ts
- lib/lemonsqueezy.ts
- hooks/useScreenReader.ts
- hooks/useAudioCues.ts
- styles/accessibility.css

DEPENDENCIES: next, react, typescript, tailwindcss, @lemonsqueezy/lemonsqueezy.js, next-auth, prisma, @prisma/client, monaco-editor, @monaco-editor/react, web-speech-api, focus-trap-react, react-hotkeys-hook, aria-live-announcer, screen-reader-utils

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Stripe Payment Link for payments (hosted checkout — use the URL directly as the Buy button href)
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_STRIPE_PAYMENT_LINK  (full URL, e.g. https://buy.stripe.com/test_XXX)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (pk_test_... or pk_live_...)
- STRIPE_WEBHOOK_SECRET  (set when webhook is wired)

BUY BUTTON RULE: the Buy button's href MUST be `process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
used as-is — do NOT construct URLs from a product ID, do NOT prepend any base URL,
do NOT wrap it in an embed iframe. The link opens Stripe's hosted checkout directly.

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.
