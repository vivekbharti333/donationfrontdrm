# AI Coding Agent Instructions

## Architecture Overview
This is an Angular 17 donation management application with a modular architecture featuring lazy-loaded feature modules. The app uses hash-based routing and cookie-based authentication.

## Key Patterns & Conventions

### Module Structure
- **Feature Modules**: Each management area (donation-management, payment-mode-management, etc.) is a separate lazy-loaded module
- **Shared Module**: Contains all UI library imports (Angular Material, PrimeNG, Bootstrap, ApexCharts, etc.) and common services
- **Core Module**: Houses shared services, guards, interceptors, and utilities
- **Auth Module**: Contains authentication components with multiple theme variants (numbered suffixes: signin/signin-2/signin-3)

### Routing
- Routes defined as static getters in `src/app/core/helpers/routes.ts` class
- Use `routes.dashboard`, `routes.donationManagement`, etc. for navigation
- Hash routing enabled (`{ useHash: true }`)
- AuthGuard protects sensitive routes

### Data Management
- Data loaded from JSON files in `src/assets/JSON/` via `DataService`
- Returns `Observable<apiResultFormat>` with `{ data: [], totalData: number }` structure
- No external API calls - all data is static JSON

### Authentication
- Cookie-based storage (`ngx-cookie-service`)
- Login details stored as JSON in 'loginDetails' cookie
- Logout clears cookies, sessionStorage, and localStorage
- Redirects to `routes.signIn` on logout

### UI Components
- Multiple UI frameworks available: Angular Material, PrimeNG, Bootstrap, ngx-bootstrap
- Components often have multiple variants (e.g., signin.component.ts, signin-2.component.ts)
- Custom pagination component in `src/app/shared/custom-pagination/`
- Spinner interceptor automatically shows loading indicators

### File Organization
- Components follow `[feature]/[component]/[component].component.ts` structure
- Services in `src/app/core/service/[service-name]/`
- Models and interfaces in `src/app/core/models/`
- Guards in `src/app/core/guard/`

### Development Workflow
- Run `npm start` or `ng serve` for development
- Build with `npm run build` or `ng build`
- Test with `npm test` or `ng test`
- Lint with `npm run lint` or `ng lint`

### Key Files to Reference
- `src/app/core/helpers/routes.ts` - All route definitions
- `src/app/shared/shared.module.ts` - Available UI libraries and services
- `src/app/core/service/data/data.service.ts` - Data loading patterns
- `src/app/auth/authentication.service.ts` - Auth implementation
- `src/assets/JSON/` - Data structure examples

When adding new features, follow the established pattern of creating feature modules with routing, components, and services. Use the shared module for UI dependencies and the routes class for navigation paths.