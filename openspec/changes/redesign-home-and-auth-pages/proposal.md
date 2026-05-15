## Why

The current `_home` and `_auth` pages were built as functional placeholders but lack visual polish, modern design patterns, and the high-end aesthetic expected of a premium SaaS boilerplate product. A skills-driven redesign will elevate the landing experience, increase conversions, and better reflect the quality of the underlying code.

## What Changes

- **Hero section**: New high-impact layout with stronger headline hierarchy, gradient accents, animated code preview or terminal mockup, and refined CTA button styling
- **Navigation**: Cleaner sticky nav with improved mobile responsiveness and scroll-aware background blur
- **Features & Tech stack sections**: Redesigned with icon-heavy cards, better spacing, and a modern grid layout
- **Pricing section**: More visually differentiated tiers, better feature list design, and highlighted recommended plan
- **Testimonials section**: Improved card design with avatars, better typography, and trust signals
- **Comparison & Build-vs-Buy sections**: More scannable layout with improved iconography and color coding
- **Cost comparison section**: Data visualization improvements (bar chart or table upgrade)
- **FAQ section**: Accordion-based design for cleaner UX
- **Showcase & Templates pages**: Card grid redesign with better imagery placeholders and hover states
- **Login page**: Centered card with brand illustration or gradient background, polished OTP input, and smoother step transitions
- **Upgrade page**: Cleaner plan selection with better visual hierarchy
- **Footer**: Enhanced with more links and improved branding treatment
- All sections: consistent spacing system, refined typography scale, cohesive color palette, and dark mode polish

## Capabilities

### New Capabilities

- `home-landing-page`: Full redesign of the marketing homepage composing all sections (hero, nav, features, pricing, testimonials, FAQ, footer) with premium visual design
- `auth-login-page`: Redesigned login flow with polished multi-step OTP form, brand-aligned layout, and smooth transitions
- `home-sub-pages`: Redesign of supporting home pages — showcase gallery, templates marketplace, upgrade, contact, and legal pages

### Modified Capabilities

## Impact

- `apps/web/src/routes/(app)/_home/-components/` — all section components rewritten
- `apps/web/src/routes/(app)/_home/index.tsx` — updated composition
- `apps/web/src/routes/(app)/_home/route.tsx` — nav updates
- `apps/web/src/routes/(app)/_home/upgrade.tsx` — redesigned
- `apps/web/src/routes/(app)/_home/contact.tsx` — redesigned
- `apps/web/src/routes/(app)/_home/showcase/` — card and gallery redesign
- `apps/web/src/routes/(app)/_home/templates/` — card and marketplace redesign
- `apps/web/src/routes/(app)/_auth/-components/login-form.tsx` — redesigned
- `apps/web/src/routes/(app)/_auth/login.tsx` — layout redesign
- No API changes, no schema changes, no breaking changes to existing data contracts
- Depends on `@workspace/ui` (shadcn components), `HugeiconsIcon`, Tailwind CSS v4
