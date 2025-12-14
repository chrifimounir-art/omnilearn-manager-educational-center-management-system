# OmniLearn Manager

[cloudflarebutton]

## Overview

**OmniLearn Manager** is a comprehensive, multi-tenant SaaS application designed to streamline the operations of educational training centers. It serves as a centralized hub for managing multiple centers, students, teachers, students, and complex financial flows across locations.

Built with a minimalist design philosophy, it prioritizes data density, intuitive navigation, and real-time insights for administrators handling academic structures, enrollments, and profitability.

### Key Features
- **Multi-Center Management**: Switch seamlessly between centers with independent configurations for levels, classes, and subjects.
- **Student & Teacher CRM**: Detailed profiles with multi-center enrollments, class assignments, and payment tracking.
- **Advanced Financial Engine**: Automated calculations for tuition, discounts, teacher commissions (hourly/per-student/revenue share), expenses, and net profits.
- **Interactive Dashboards**: Real-time metrics via Recharts (revenue, enrollments, payouts) with PDF/Excel exports.
- **Responsive UI**: Mobile-first, shadcn/ui-powered interface with sidebar navigation and data tables.
- **Secure & Scalable**: Role-based access, Cloudflare Durable Objects for stateful storage, atomic operations.

Views include:
- Global Dashboard (aggregated metrics)
- Center Management (CRUD for centers/levels/subjects)
- Student Directory (enrollments/payments)
- Teacher Registry (assignments/payouts)
- Financial Hub (income/expenses/payroll)

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v3, shadcn/ui, React Router, TanStack Query, Zustand, Recharts, Framer Motion
- **Backend**: Hono, Cloudflare Workers, Durable Objects (single DO multi-entity pattern)
- **Data**: IndexedEntity pattern with CAS atomicity, JSON storage
- **UI/UX**: Lucide icons, Sonner toasts, Date-fns
- **Dev Tools**: Vite, Bun, ESLint, Wrangler

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (package manager & runtime)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-update/) (for deployment)

### Installation
```bash
bun install
```

### Local Development
```bash
bun dev
```
Opens at `http://localhost:3000` (or `$PORT`).

### Production Build & Preview
```bash
bun build
bun preview
```

## Usage

The app features a responsive sidebar layout (`AppLayout`) with key navigation:
- **Global Dashboard**: High-level metrics across centers.
- **Centers**: Manage locations, levels (Primary/Secondary/Professional), classes, subjects.
- **Students**: Enroll, track payments, multi-center assignments.
- **Teachers**: Profiles, specialties, multi-center teaching, commission models.
- **Finances**: Record payments/expenses, view auto-calculated profits.

**API Endpoints** (REST via `/api/*`):
- `GET/POST /api/centers` (list/create centers)
- `GET/POST /api/students` (directory/enroll)
- Extend via `worker/user-routes.ts` and `worker/entities.ts`.

Data flows: UI → TanStack Query → Hono API → Entity DOs → Storage.

## Development

### Project Structure
```
├── src/              # React app (pages, components/ui, hooks)
├── worker/           # Hono API + DO Entities
├── shared/           # Shared types (ApiResponse<T>)
└── tailwind.config.js # Theme (shadcn)
```

### Adding Entities
1. Define in `shared/types.ts` (e.g., `Center { id, name, address }`).
2. Extend `IndexedEntity` in `worker/entities.ts`.
3. Add CRUD routes in `worker/user-routes.ts`.
4. Query via `api<T>('/api/...')` in frontend.

**Rules**:
- Use shadcn/ui components: `import { Button } from '@/components/ui/button'`.
- Responsive: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12`.
- No new deps/bindings; extend existing.

### Customization
- **Sidebar**: Edit `src/components/app-sidebar.tsx`.
- **Theme**: Toggle via `ThemeToggle`; edit `tailwind.config.js`.
- **Home**: Replace `src/pages/HomePage.tsx`.
- **Routes**: Add to `src/main.tsx` via `createBrowserRouter`.

## Deployment

Deploy to Cloudflare Workers (Pages + DOs):

```bash
bun install    # Ensure deps
wrangler types # Generate TS types
bun deploy     # Build + wrangler deploy
```

Or use the one-click deploy:

[cloudflarebutton]

**Bindings**: Single `GlobalDurableObject` (auto-managed).

**Custom Domain**: `wrangler pages deploy` or Pages integration.

## Contributing
1. Fork & PR.
2. Follow UI standards (shadcn, Tailwind-safe).
3. Test: No runtime errors, responsive across devices.
4. Lint: `bun lint`.

## License
MIT. See [LICENSE](LICENSE) for details.

---

⭐ **Built for educational centers with ❤️ at Cloudflare**