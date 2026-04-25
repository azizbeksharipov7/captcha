# CAPTCHA System (React + TanStack + Canvas)

A modern CAPTCHA verification page. This project generates CAPTCHA challenges on Canvas, limits invalid attempts, and applies temporary lockout protection.

## Why this project?

Beyond a basic text CAPTCHA, this implementation provides practical anti-bot behavior:

- Dynamic 6-character CAPTCHA generation
- Canvas distortion with noise dots and curved lines
- Invalid attempt tracking
- 60-second lockout after 3 failed attempts
- Lock state persistence via localStorage
- Clean and user-friendly UI (shadcn/ui + Tailwind)

## Key features

- Character set: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Case-insensitive verification (`toUpperCase`)
- Fast submit with the Enter key
- Manual CAPTCHA refresh (`Refresh`)
- Clear status states:
  - verified successfully
  - invalid input
  - temporarily locked
  - unlocked (retry available)

## Tech stack

- React 19
- TypeScript
- TanStack Router / TanStack Start
- Vite 7
- Tailwind CSS 4
- shadcn/ui (Radix UI components)
- Lucide icons

## Project structure

```text
src/
  routes/
    __root.tsx      # Root shell and SEO meta
    index.tsx       # CAPTCHA logic and UI
  components/ui/    # shadcn/ui components
  styles.css        # global styles
```

## Getting started

### Requirements

- Node.js 20+
- Bun (recommended) or npm

### 1) Install dependencies

```bash
bun install
```

Or:

```bash
npm install
```

### 2) Run development server

```bash
bun run dev
```

Or:

```bash
npm run dev
```

### 3) Build and preview

```bash
bun run build
bun run preview
```

Or:

```bash
npm run build
npm run preview
```

## Scripts

- `dev` - run local development server
- `build` - create production build
- `build:dev` - create development-mode build
- `preview` - preview the build locally
- `lint` - run ESLint checks
- `format` - run Prettier formatting

## CAPTCHA flow

1. On page load, a new 6-character CAPTCHA is generated.
2. CAPTCHA is rendered on Canvas (gradient, noise dots, noise lines, random rotation).
3. User enters input and submits.
4. If correct, success status is shown.
5. If incorrect, attempt count increases and CAPTCHA refreshes.
6. After 3 failed attempts, the user is locked for 60 seconds.
7. Lock expiration is stored in localStorage and survives page reloads.
8. After countdown ends, lock is removed and a new CAPTCHA is issued.

## Security note

This project is a front-end demonstration. For production usage, also implement:

- Server-side CAPTCHA verification
- IP/device-based rate limiting
- Additional bot defenses (WAF, challenge escalation)
- Audit logs and monitoring

## Deployment

The app is Vite-based. Since `wrangler.jsonc` and `@cloudflare/vite-plugin` are present, it can be deployed to Cloudflare with the right environment setup.

General flow:

1. Run `build`
2. Publish build artifacts to hosting
3. Verify environment configuration

## Future improvements

- Audio CAPTCHA
- Accessibility-focused flow for screen readers
- Multi-language UI (i18n)
- CAPTCHA analytics and admin dashboard
- One-time server token verification

## Author

This project was created to quickly prototype CAPTCHA UX and a basic anti-bot flow.