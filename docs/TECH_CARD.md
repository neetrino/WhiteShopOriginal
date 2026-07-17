# White Shop — տեխնոլոգիական քարտ

**Նախագիծ.** White Shop
**Չափ.** Size C product scope
**Architecture proposal.** Feature-based modular monolith
**Ամսաթիվ.** 2026-07-17
**Ստատուս.** Սևագիր — approval required before application code

> ✅ սահմանված է brief-ով · 🟡 առաջարկ/հաստատում է պահանջում · ⬜ implementation-ում ստուգվող · ➖ scope-ից դուրս

## 1. Հիմք

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Project scope | Size C | 🟡 | 50+ capabilities, commerce data integrity, admin և integrations |
| Runtime layout | Single Next.js modular monolith | 🟡 | Monorepo/microservices միայն ապացուցված extraction need-ի դեպքում |
| Package manager | pnpm | ✅ | Exact version pin Corepack/`packageManager`-ով |
| Node.js | Active LTS compatible with selected Next.js | 🟡 | Exact major-ը lock անել kickoff-ին |
| TypeScript | Strict mode | ✅ | `noUncheckedIndexedAccess` և strict server/client boundaries առաջարկվում են |
| Git strategy | Feature branches կամ trunk-based ըստ թիմի | 🟡 | Commit/push միայն explicit request-ով |
| Commit convention | Conventional Commits | 🟡 | CI enforcement ըստ repository baseline-ի |

## 2. Frontend և rendering

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Framework | Latest stable Next.js, App Router | ✅ | Exact version pin implementation kickoff-ին |
| React | Next.js-ի supported stable version | ✅ | React Server Components default |
| Client boundary | `"use client"` միայն interaction boundary-ներում | ✅ | Forms, drawers, carousel, local controls |
| Styling | Tailwind CSS | ✅ | CSS variables for design tokens |
| UI primitives | shadcn/ui | ✅ | Copy-owned components, accessible composition |
| Forms | React Hook Form + Zod | ✅ | Server-ը նույն domain schema-ն կրկին validate է անում |
| Tables | TanStack Table | ✅ | Server-side sort/filter/page contracts |
| Server state | RSC default; TanStack Query selective | ✅ | Admin live tables/interactive flows only |
| Carousel | Embla Carousel | ✅ | Hero և related products |
| Icons | Lucide React | ✅ | Icon-only control-ները ունեն accessible name |
| Internal navigation | Next.js `Link` | ✅ | Selective prefetch, no plain `<a>` internal routes-ի համար |
| i18n | Locale segment + translation dictionaries | ✅ | `hy`, `en`, `ru`; library choice implementation detail/ADR |
| SEO | Metadata API, sitemap, robots, JSON-LD | ✅ | Product/Breadcrumb/BlogPosting schemas |

## 3. Backend և application boundary

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Backend | Next.js Server Actions + Route Handlers | ✅ | Server Actions first-party UI mutations-ի համար; webhooks/uploads/exports՝ Route Handlers |
| Validation | Zod at every trust boundary | ✅ | Form, search params, webhook payload, env |
| Business logic | Feature application services/pure domain functions | 🟡 | UI/action/route handler-ում duplication չկա |
| API style | Internal typed commands/queries; REST-ish HTTP endpoints where needed | 🟡 | Public API չի ենթադրվում v1-ում |
| Idempotency | DB-backed order keys + short-lived Redis guard | ✅ | DB unique constraint-ը վերջնական պաշտպանությունն է |
| Background work | Provider-neutral job/outbox extension point | 🟡 | Queue provider դեռ ընտրված չէ |
| File upload | Presigned R2 flow | ✅ | MIME/size/dimensions validation և metadata persistence |

## 4. Տվյալների շերտ

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Database | PostgreSQL on Neon | ✅ | Durable source of truth |
| ORM | Drizzle ORM + Drizzle Kit | ✅ | SQL migrations committed, reviewed, reversible strategy |
| IDs | UUIDv7 կամ sortable secure ID | 🟡 | Մեկ ռազմավարություն բոլոր նոր tables-ի համար |
| Money | Integer amount + ISO currency code | ✅ | No float/JS `number` arithmetic beyond safe integer range |
| Transactions | Checkout, stock, order/status critical flows | ✅ | Row lock/conditional update strategy պետք է test արվի |
| Search | PostgreSQL indexes/FTS initial release | 🟡 | External search deferred |
| Canonical schema | 25 application tables | ✅ | Lean model-ը սահմանված է `03-DATA-MODEL.md`-ում |
| Multilingual content | Parent-table `translations JSONB` | ✅ | UI copy-ն առանձին locale JSON files-ում է |
| Soft delete | Products/categories/users-ի համար ըստ lifecycle-ի | ✅ | Orders/payments/audit immutable/archived |
| Migrations | Forward-only production migrations | ✅ | Production migration այս task-ի scope-ում չէ |
| Seed | Idempotent dev/test seed | ✅ | Credentials env-ից, production default password չկա |

### Adaptive database limits — approval required

Connection pool size, `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout` և Neon region-ը սահմանվում են hosting/runtime-ի ընտրությունից հետո։ Մինչ այդ դրանք configuration contract են, ոչ invented values։

## 5. Authentication և authorization

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Auth | Auth.js | ✅ | Credentials flow; OAuth `accounts` table-ը initial scope-ում չկա |
| Password hashing | Argon2id | ✅ | Parameters benchmark անել target runtime-ում |
| Sessions | Database-backed secure sessions | 🟡 | Safer revocation/suspension; final confirm hosting constraints-ից հետո |
| Roles | `ADMIN`, `CUSTOMER` | ✅ | Server-side checks every protected read/mutation-ում |
| Verification | Email verification required | ✅ | Redis-ում hashed, TTL, atomic single-use token |
| Reset | Forgot/reset password | ✅ | Redis token, generic response, session revocation |
| Account controls | Active/suspended/anonymized lifecycle | ✅ | Last admin self-demotion invariant |

## 6. Cache, storage և integrations

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Redis | Upstash Redis | ✅ | Cache/rate limit + ephemeral verification/reset tokens; ոչ durable commerce authority |
| Rate limiting | Upstash Ratelimit | ✅ | Auth, contact, review, coupon, upload, order endpoints |
| Object storage | Cloudflare R2 | ✅ | Store object key, not full CDN URL |
| Image delivery | `next/image` + configured public base URL | ✅ | Responsive sizes, alt text, format/size policy |
| Email | Provider interface, Resend adapter first | ✅ | Verification/reset/order events |
| Exchange rates | Provider interface + Redis cache | ✅ | Concrete source/rounding policy բաց է |
| Payments | Provider interface + COD adapter | ✅ | Online adapter(s) բաց են |
| Analytics | First-party aggregate queries | ✅ | Product analytics provider optional/open |
| Error tracking | Provider-neutral boundary | 🟡 | Sentry կամ այլ provider բաց է |

## 7. Hosting և environments

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Hosting | TBD | 🟡 | Vercel-compatible architecture, բայց provider-ը հաստատված չէ |
| Environments | Local + preview/staging + production | 🟡 | Առանձին DB/Redis/R2 resources կամ safe namespaces |
| CI | GitHub Actions | 🟡 | format, lint, typecheck, unit/integration, build, selected E2E |
| CDN/WAF | Hosting edge + optional Cloudflare WAF | 🟡 | Domain/DNS decision-ից հետո |
| Logs | Structured server logs | 🟡 | Secret/PII redaction պարտադիր |
| Backups | Neon capabilities + restore drill policy | 🟡 | Retention/RPO/RTO հաստատել |

## 8. Testing և quality

| Պարամետր | Որոշում | Ստատուս | Նշում |
|---|---|---|---|
| Unit | Vitest | ✅ | Money, promotions, delivery, permissions, stock |
| Components | React Testing Library | ✅ | Interaction և accessibility semantics |
| Integration | Vitest + isolated PostgreSQL test DB | ✅ | Auth/catalog/cart/checkout/profile |
| E2E | Playwright | ✅ | Critical customer/admin/locale journeys |
| Coverage | Risk-based; domain minimum target approval required | 🟡 | Percentage-ը success-ի միակ չափանիշը չէ |
| Lint/format | ESLint + Prettier | ✅ | Zero hidden failures |
| Accessibility | Automated smoke + keyboard/manual critical flows | ✅ | WCAG 2.2 AA target առաջարկվում է |

## 9. Security baseline

| Control | Ստատուս | Implementation contract |
|---|---|---|
| Input/env validation | ✅ | Zod բոլոր trust boundaries-ում |
| CSRF-safe mutations | ✅ | Same-origin cookies/headers և Auth.js protections; Route Handler policy documented |
| XSS/HTML sanitation | ✅ | Rich content sanitize server-side, CSP-compatible rendering |
| Secure cookies | ✅ | `httpOnly`, `secure` prod-ում, `sameSite`, scoped expiry |
| Enumeration resistance | ✅ | Generic auth/reset responses և comparable paths |
| Upload security | ✅ | Presigned restrictions, MIME sniffing/metadata validation, no secret on client |
| Audit | ✅ | Admin/security/financial mutations actor+target+correlation metadata-ով |
| Dependency scanning | 🟡 | Dependabot և CI audit policy |
| Security headers | 🟡 | CSP/HSTS/referrer/permissions policy hosting-aware rollout |

## 10. Environment contract

Minimum variables (առանց secrets-ի արժեքների)՝

```dotenv
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
EMAIL_FROM=
RESEND_API_KEY=
```

Լրացուցիչ variables-ը սահմանվում են համապատասխան adapter-ի ավելացման պահին։ Client bundle-ում թույլատրվում են միայն դիտավորյալ `NEXT_PUBLIC_*` արժեքները։

## 11. Approval summary

### Prompt-ով արդեն սահմանված

Next.js, TypeScript, Neon/PostgreSQL, Drizzle, Auth.js, Upstash, R2, Tailwind, shadcn/ui, forms/tables/query/carousel/icon stack, Resend abstraction, Argon2id, tests, pnpm, locale/currency և security/data-integrity սկզբունքներ։

### Մինչ կոդավորումը հաստատել

- [ ] Size C scope + modular monolith layout
- [ ] Exact compatible dependency versions և Node LTS
- [ ] Hosting/runtime/regions և environment topology
- [ ] Session strategy
- [ ] ID strategy
- [ ] Online payment launch scope
- [ ] Exchange-rate source/rounding
- [ ] Tax/order/refund policies
- [ ] Observability/analytics providers
- [ ] Design system source և legal content ownership

Կապված open items-ը՝ [`DECISIONS.md`](./DECISIONS.md)։
