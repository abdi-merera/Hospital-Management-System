# HMIS Architecture

The project is moving toward a TypeScript, module-based layout while preserving the existing Green Hills Hospital visual design and color palette.

For the fuller product plan, see `docs/system-design.md`.

## Client

- `src/api`: HTTP clients and API-specific functions
- `src/assets`: images, styles, and static assets
- `src/components`: reusable UI components
- `src/layouts`: page shells such as dashboard layout
- `src/pages`: route-level screens
- `src/routes`: React Router configuration
- `src/hooks`: reusable React hooks
- `src/types`: TypeScript types
- `src/utils`: reusable helper functions
- `src/constants`: shared client constants
- `src/main.tsx`: React app bootstrap

## Server

- `src/config`: environment and database configuration
- `src/middleware`: shared Express middleware
- `src/modules`: domain modules
- `src/routes`: route composition
- `src/utils`: server helper functions
- `src/app.ts`: Express app bootstrap
