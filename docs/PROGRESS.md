# White Shop — progress

**Ընդհանուր կարգավիճակ.** Specification draft prepared; implementation not started
**Վերջին թարմացում.** 2026-07-17

## Milestones

| Phase | Անվանում | Կարգավիճակ | Նշում |
|---:|---|---|---|
| 0 | Approval | 🔄 Ընթացքում | TECH_CARD և open decisions approval են պահանջում |
| 1 | Foundation | ⬜ Չի սկսվել | Blocked by Phase 0 approval |
| 2 | Database foundation | ⬜ Չի սկսվել | |
| 3 | Identity and authorization | ⬜ Չի սկսվել | |
| 4 | Catalog admin and media | ⬜ Չի սկսվել | |
| 5 | Storefront catalog | ⬜ Չի սկսվել | |
| 6 | Cart and checkout | ⬜ Չի սկսվել | |
| 7 | Customer self-service | ⬜ Չի սկսվել | |
| 8 | Admin commerce operations | ⬜ Չի սկսվել | |
| 9 | Content, communication and analytics | ⬜ Չի սկսվել | |
| 10 | Reviews, currency and optional payments | ⬜ Չի սկսվել | |
| 11 | Hardening and release readiness | ⬜ Չի սկսվել | |

## Documentation baseline — 2026-07-17

### Created/updated

- `docs/00-SPECIFICATION-INDEX.md`
- `docs/BRIEF.md`
- `docs/TECH_CARD.md`
- `docs/01-ARCHITECTURE.md`
- `docs/02-FUNCTIONAL-SPECIFICATION.md`
- `docs/03-DATA-MODEL.md`
- `docs/04-ROUTES-AND-CONTRACTS.md`
- `docs/05-SECURITY-AND-PRIVACY.md`
- `docs/06-I18N-SEO-PERFORMANCE-A11Y.md`
- `docs/07-TESTING-AND-QUALITY.md`
- `docs/08-IMPLEMENTATION-PLAN.md`
- `docs/DECISIONS.md`
- `docs/PROGRESS.md`

### Verification

- Prompt requirements mapped into product, functional, data, route, security, quality և delivery specifications։
- Local Markdown links checked: no broken links։
- Trailing whitespace/template placeholder scan checked: no findings։
- Functional requirement ID uniqueness checked: no duplicates։
- Prompt capability coverage keyword audit checked: all selected critical areas found։
- `git diff --check` passed։
- Application typecheck/lint/build/tests not applicable: application scaffold does not exist and this task authorizes documentation only։

### Open approvals

See [`DECISIONS.md`](./DECISIONS.md) and [`TECH_CARD.md`](./TECH_CARD.md)։

## Lean schema decision update — 2026-07-17

### Approved architecture changes

- PostgreSQL canonical schema-ն սահմանվել է 25 application table։
- UI copy-ն մնում է locale JSON files-ում; admin-managed translations-ը parent entity `translations JSONB`-ում են։
- Coupons և automatic discounts-ը միավորվել են `promotions` model-ում՝ relational `promotion_users` allowlist-ով։
- Product/category/hero/blog media ownership-ը տեղափոխվել է `media_assets` typed FK/role model։
- Verification/reset tokens-ը տեղափոխվել են Redis hashed TTL/atomic single-use contract։
- Order address/idempotency snapshots-ը պահվում են `orders`-ում; status/notes/provider event history-ն՝ `order_events`-ում։
- `order_items`, `payments`, `stock_movements`, `audit_logs` և `outbox_events` intentionally առանձին են մնացել data integrity/reliability-ի համար։

### Documents synchronized

- `docs/BRIEF.md`
- `docs/TECH_CARD.md`
- `docs/01-ARCHITECTURE.md`
- `docs/02-FUNCTIONAL-SPECIFICATION.md`
- `docs/03-DATA-MODEL.md`
- `docs/05-SECURITY-AND-PRIVACY.md`
- `docs/06-I18N-SEO-PERFORMANCE-A11Y.md`
- `docs/07-TESTING-AND-QUALITY.md`
- `docs/08-IMPLEMENTATION-PLAN.md`
- `docs/DECISIONS.md`

### Verification

- Canonical inventory parser-ը հաստատել է 1–25 ճիշտ numbering, 25 unique table names և `count=25`։
- Obsolete table-name scan-ը finding չի գտել։
- Contradictory translation/coupon/discount persistence scan-ը finding չի գտել։
- Բոլոր local Markdown links-ը resolve են լինում։
- Trailing whitespace scan-ը finding չի գտել։
- `git diff --check` անցել է։
- Application typecheck/lint/build/tests չեն գործարկվել, քանի որ application scaffold/migrations դեռ չկան և փոփոխությունը documentation-only է։

## Phase report template

### Phase X — title

**Status.** Not started / In progress / Complete
**Requirement IDs.** ...

#### Created/changed files

- ...

#### Migrations

- Name/status/environment: ...

#### Verification performed

- Command/check: result

#### Remaining risks/open decisions

- ...

#### Next authorized phase

- ...
