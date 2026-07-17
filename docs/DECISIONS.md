# White Shop — decisions and open questions

**Կարգավիճակ.** Draft for approval
**Վերջին թարմացում.** 2026-07-17

## Կարգավիճակների նշանակություն

- **Approved by brief** — ուղղակի սահմանված է user prompt-ով։
- **Approved by user** — conversation-ում հստակ հաստատված architecture փոփոխություն է։
- **Proposed** — architecture առաջարկ է, հաստատում է պահանջում։
- **Open** — առանց product/owner որոշման implementation-ը կարող է սխալ business behavior ստեղծել։
- **Deferred** — գիտակցաբար դուրս է initial release-ից։

## Որոշումների գրանցամատյան

| ID | Թեմա | Կարգավիճակ | Որոշում / հարց | Default մինչև հաստատում |
|---|---|---|---|---|
| DEC-001 | Primary architecture | Proposed | Modular monolith մեկ Next.js app-ում, feature boundaries-ով | Օգտագործել այս architecture-ը documentation/planning-ի համար |
| DEC-002 | Product size | Proposed | Size C product scope | Չի ենթադրում պարտադիր microservices/monorepo |
| DEC-003 | Database | Approved by brief | Neon PostgreSQL + Drizzle ORM | PostgreSQL-ը source of truth է |
| DEC-004 | Auth | Approved by brief | Auth.js credentials flow, Argon2id, database sessions | OAuth provider-ներ scope-ից դուրս |
| DEC-005 | Locale | Approved by brief | `hy`, `en`, `ru`; default `hy`; locale URL segment-ում | Missing translation-ը CI error է production namespace-ների համար |
| DEC-006 | Money | Approved by brief | Base AMD, integer amounts, display conversion | Order-ը պահում է exchange-rate snapshot |
| DEC-007 | Initial payment | Approved by brief | Payment abstraction; provider չլինելու դեպքում COD | COD-ը P0 adapter է |
| DEC-008 | Durable cart | Approved by brief | PostgreSQL source of truth; guest session cart; login merge | Redis-ը optional accelerator է |
| DEC-009 | Deletes | Approved by brief | Finance/audit hard delete չի արվում | Archive/soft delete/anonymize |
| DEC-010 | Images | Approved by brief | R2 object key database-ում, public URL config-ից | Presigned upload, delayed old-object cleanup |
| DEC-011 | Database footprint | Approved by user | Canonical lean schema՝ 25 PostgreSQL table | Նոր table միայն migration rationale-ով |
| DEC-012 | Dynamic translations | Approved by user | Product/category/hero/blog translations-ը parent table-ի validated JSONB-ում | UI copy-ն մնում է locale JSON files-ում |
| DEC-013 | Promotions | Approved by user | Coupons և automatic discounts-ը մեկ `promotions` table-ում | User allowlist-ը `promotion_users` relation է |
| DEC-014 | Auth tokens | Approved by user | Verification/reset tokens-ը hashed TTL records են Upstash Redis-ում | PostgreSQL sessions-ը պահվում են revoke-ի համար |
| DEC-015 | Order model | Approved by user | Address snapshots-ը `orders` JSONB-ում, status/notes/provider events-ը `order_events`-ում | `order_items` և `payments` առանձին են մնում |
| DEC-016 | Media ownership | Approved by user | Product/category/hero/blog ownership-ը `media_assets` typed FKs/roles-ով | Generic polymorphic owner առանց FK չի օգտագործվում |
| OPEN-001 | Hosting/runtime | Open | Vercel, այլ Node hosting, region և runtime սահմաններ | Next.js Node runtime, deployment չի արվում մինչև approval |
| OPEN-002 | Online payments | Open | Որ provider-ներն են launch scope-ում և ինչ webhook/refund flows են պետք | Միայն COD |
| OPEN-003 | Exchange rates | Open | Provider, update schedule, fallback և margin/rounding policy | Admin-maintained AMD rates + Redis cache |
| OPEN-004 | Tax | Open | Prices tax-inclusive՞ են, tax zones/rates և invoice behavior | Tax amount 0, բայց schema/summary field-ը նախատեսված է |
| OPEN-005 | Order status model | Open | Allowed statuses և revenue-generating status-ներ | Draft set՝ pending/confirmed/processing/shipped/delivered/cancelled/refunded |
| OPEN-006 | Product category cardinality | Open | Product-ը մեկ primary category՞, թե multiple | Multiple categories + մեկ optional primary category |
| OPEN-007 | Variants | Open | Color/size variants launch-ին ակտիվ են, թե extension point | Schema extension point, UI deferred |
| OPEN-008 | Coupon stacking | Open | Coupon-ը կարող է stack լինել automatic discount-ի հետ | Settings-ով, default՝ false |
| OPEN-009 | Customer deletion | Open | Retention duration և legal/audit պահանջներ | PII anonymization, order snapshots retained |
| OPEN-010 | Content editor | Open | Blog rich-text editor և canonical sanitized format | Sanitized HTML կամ structured JSON՝ adapter boundary-ով |
| OPEN-011 | Observability | Open | Sentry/այլ provider, log retention և PII policy | Structured server logs, provider adapter |
| OPEN-012 | Analytics | Open | Vercel Analytics/PostHog/այլ և consent requirements | First-party aggregate order analytics only |
| OPEN-013 | Design system | Open | Figma, brand tokens, dark mode և final breakpoints | shadcn/ui + Tailwind CSS variables, light theme first |
| OPEN-014 | Legal content | Open | Terms/privacy/shipping/returns/cookies approved copy | Routes ստեղծվում են, publish-ը blocked է մինչև approved text |
| OPEN-015 | Countries | Open | Միայն Հայաստան, թե միջազգային shipping | Armenia-first, data model-ը international-ready |
| OPEN-016 | Inventory policy | Open | Overselling/backorder և reservation timeout | Backorder չկա; stock decrement order creation-ի transaction-ում |
| DEF-001 | Granular staff roles | Deferred | ADMIN/CUSTOMER-ից ավելի մանր permissions | Future RBAC extension |
| DEF-002 | Advanced search | Deferred | Algolia/Meilisearch/Elastic | PostgreSQL indexed search initial release-ում |
| DEF-003 | Background jobs | Deferred | Durable queue provider | Synchronous/outbox-ready flows; critical work չի կորցվում |

## Assumptions requiring validation

1. AMD-ի integer unit-ը մեկ դրամ է, հետևաբար amount scale-ը 0 է AMD-ի համար։ USD/EUR/RUB display rounding-ը currency metadata-ից է։
2. Guest checkout թույլատրված է, քանի որ prompt-ը սահմանում է guest cart, բայց պարտադիր registration չի պահանջում։
3. Review eligibility-ն սահմանվում է delivered/completed order item-ով։ Refund-ից հետո review visibility policy-ն դեռ բաց է։
4. `ADMIN` role-ը launch-ին ներառում է բոլոր admin capabilities, սակայն every mutation-ը դեռ server-side role check ունի։
5. Storefront slugs-ը `translations JSONB`-ում են և fixed-locale expression indexes-ով unique են per locale։

## Approval checklist

- [ ] Product owner-ը հաստատել է P0/P1 launch scope-ը։
- [ ] Tech lead-ը հաստատել է modular monolith layout-ը։
- [ ] Hosting/runtime և regions-ը ընտրված են։
- [ ] Payment launch scope-ը ընտրված է։
- [ ] Tax/order/refund policies-ը հաստատված են։
- [ ] Legal content owner-ը նշանակված է։
- [ ] Design source/brand tokens-ը տրամադրված են։
