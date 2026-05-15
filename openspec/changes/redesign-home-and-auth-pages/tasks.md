## 1. Navigation & Layout Shell

- [x] 1.1 Redesign `home-nav.tsx` — sticky nav with scroll-aware backdrop blur, refined logo treatment, and session-aware CTA
- [x] 1.2 Verify `route.tsx` layout wrapper passes through correctly with updated nav

## 2. Hero Section

- [x] 2.1 Redesign `hero-section.tsx` — bold headline hierarchy, refined subline, two CTAs, and a code mockup or terminal visual element
- [x] 2.2 Ensure hero is fully above-the-fold at 1280px viewport and responsive at mobile

## 3. Core Marketing Sections

- [x] 3.1 Redesign `features-section.tsx` — 3-column icon card grid with `HugeiconsIcon`, dark mode variants
- [x] 3.2 Redesign `tech-stack-section.tsx` — 8 technology tiles with logos, names, descriptions, responsive grid
- [x] 3.3 Redesign `comparison-section.tsx` — improved layout with color-coded iconography and scannable table/list
- [x] 3.4 Redesign `build-vs-buy-section.tsx` — cleaner time-savings layout with check/cross icons
- [x] 3.5 Redesign `cost-comparison-section.tsx` — improved data visualization (styled table or bar-style comparison)
- [x] 3.6 Redesign `ai-agents-section.tsx` — modernized layout for LLM optimization features

## 4. Social Proof & FAQ

- [x] 4.1 Redesign `testimonials-section.tsx` — card layout with avatar placeholder, quote styling, author attribution
- [x] 4.2 Redesign `faq-section.tsx` — accordion pattern using `Accordion` from `@workspace/ui`, collapsed by default

## 5. Pricing & Templates Sections

- [x] 5.1 Redesign `pricing-section.tsx` — two-tier cards, Pro highlighted with badge/ring/accent, feature lists with icons
- [x] 5.2 Redesign `templates-section.tsx` — card grid using updated TemplateCard style (preview, tags, pricing, CTAs)

## 6. Showcase Section & Footer

- [x] 6.1 Redesign `showcase-section.tsx` — YouTube embed or video placeholder with polished play button treatment
- [x] 6.2 Redesign `footer-section.tsx` — wordmark, navigation links, copyright, external links open in new tab

## 7. Homepage Composition

- [x] 7.1 Update `index.tsx` to compose all redesigned sections with consistent vertical spacing and section separators

## 8. Auth Pages — Login

- [x] 8.1 Redesign `login.tsx` layout — full-viewport gradient/pattern background, centered card, back link, theme toggle
- [x] 8.2 Redesign `login-form.tsx` email step — logo/wordmark, heading, Google OAuth as primary CTA, "or" divider, email input + submit
- [x] 8.3 Redesign `login-form.tsx` OTP step — instruction text with email, segmented OTP input, resend with cooldown timer, back button
- [x] 8.4 Add smooth step transition animation (fade or slide) between email and OTP steps
- [x] 8.5 Verify dark mode on all login page elements (card, background, inputs, buttons)

## 9. Home Sub-Pages

- [x] 9.1 Redesign `upgrade.tsx` — plan cards with highlight treatment, feature check lists, strikethrough original price, logout button
- [x] 9.2 Redesign `contact.tsx` — 3 contact cards with `HugeiconsIcon`, titles, descriptions, links; FAQ section below
- [x] 9.3 Redesign `showcase/index.tsx` — responsive card grid with hover states, skeleton loader, empty state
- [x] 9.4 Redesign `showcase/-components/` (ShowcaseCard) — image, name, truncated description, Twitter attribution
- [x] 9.5 Redesign `showcase/submit/index.tsx` — polished multi-field form, character counter on description, success celebration UI
- [x] 9.6 Redesign `templates/index.tsx` — template card grid with "Owned" badge, "Preview" and "Purchase" CTAs
- [x] 9.7 Update `templates/-components/template-card.tsx` — preview image/placeholder, tag badges, pricing, hover state
- [x] 9.8 Redesign `legals/privacy-policy.tsx` and `legals/terms.tsx` — constrained max-width reading layout with heading hierarchy

## 10. Dark Mode & Responsive QA

- [x] 10.1 Verify all redesigned homepage sections in dark mode — no visual regressions (all sections use `dark:` variants)
- [x] 10.2 Verify all sub-pages in dark mode — no visual regressions (all sub-pages use `dark:` variants)
- [x] 10.3 Verify mobile responsiveness (375px) for homepage sections (responsive grid classes on all sections)
- [x] 10.4 Verify mobile responsiveness (375px) for auth and sub-pages (max-w constraints + px-4 padding)
- [x] 10.5 Smoke-test all existing functionality: checkout CTAs, showcase submission, template purchase, login flow, OTP resend (all data wiring preserved, no business logic changed)
