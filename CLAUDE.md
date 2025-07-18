# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Sound Notification

After finishing responding to my request or running a command, run this command to notify me by sound:

```bash
afplay /System/Library/Sounds/Funk.aiff
```

## Project Overview

This is a SvelteKit application for the Korean Claude developer community platform. It uses TypeScript, Tailwind CSS v4, and Supabase for authentication and data storage. For local development, it uses SQLite with Drizzle ORM.

## Essential Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run check        # TypeScript type checking
npm run lint         # Run ESLint and Prettier check
npm run format       # Auto-format code with Prettier
npm run test         # Run all tests once
npm run test:unit    # Run tests in watch mode
```

### Database (Local Development)
```bash
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio for database inspection
```

## Architecture Overview

### Technology Stack
- **Frontend Framework**: SvelteKit with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with Typography and Forms plugins
- **Authentication**: Supabase Auth with OAuth (Google, GitHub)
- **Database**: 
  - Production: Supabase (PostgreSQL with Row Level Security)
  - Local Development: SQLite with Drizzle ORM
- **Testing**: Vitest with separate browser and server environments
- **Build Tool**: Vite

### Key Directories
- `src/lib/server/`: Server-side utilities including auth logic and database configuration
- `src/lib/components/`: Reusable UI components
- `src/routes/`: SvelteKit routes for pages and API endpoints
  - `api/`: REST API endpoints
  - `auth/`: Authentication-related pages
  - `profile/`: User profile management
  - `demo/`: Demo pages showcasing Lucia auth integration

### Important Files
- `src/lib/server/auth.ts`: Core authentication logic
- `src/lib/server/supabase.ts`: Supabase client initialization
- `src/lib/server/db/index.ts`: Database configuration and schema
- `src/hooks.server.ts`: Server hooks for session management
- `src/app.d.ts`: TypeScript ambient declarations

### Database Schema
The application uses two authentication approaches:
1. **Supabase Auth**: For production with OAuth providers
2. **Local SQLite**: For development with custom session management

Key tables:
- `profiles`: User profile information linked to auth.users
- `user`: Local development user table
- `session`: Local development session management

### Testing Strategy
- **Unit Tests**: Use `npm run test` for one-time run or `npm run test:unit` for watch mode
- **Test Environment**: Vitest configured with separate browser and server contexts
- **Test Files**: Located alongside source files with `.test.ts` extension

### Development Workflow
1. Always run `npm run check` before committing to catch TypeScript errors
2. Use `npm run lint` to ensure code style consistency
3. The project uses MDsveX for Markdown processing in Svelte components
4. Environment variables are required - check `.env.example` for required values
5. For database changes in local development, use Drizzle Kit commands

### Security Considerations
- Row Level Security (RLS) is enabled on all Supabase tables
- Server-side session validation in `hooks.server.ts`
- Environment variables for sensitive configuration
- OAuth-only authentication (no password storage)

## Project Specifications (from .kiro/specs)

### Project Vision
Claude Code Korea is designed as a comprehensive knowledge-sharing community platform for Korean Claude Code users. The platform will support:
- Web application (SvelteKit) and mobile applications (iOS/Android via React Native)
- Initial target: 100 users, scaling to 1,000+ active users within 1 year
- Core features: Forum system, code snippet sharing, project gallery, real-time notifications

### Implementation Status
The project follows a detailed 20-phase implementation plan (see `.kiro/specs/claude-code-korea-community/tasks.md`):
- ✅ Phase 1: Project setup and infrastructure (Complete)
- ✅ Phase 3: Authentication system (Complete)
- ⚡ Phase 4: Basic layout and navigation (In Progress)
- 📋 Phases 5-20: Forum, comments, code snippets, projects, social features, mobile apps (Planned)

### Architectural Decisions
Based on the design specifications:
- **API-First Design**: Same API serves both web and mobile clients
- **Real-time First**: Leveraging Supabase Realtime for live updates
- **Mobile-First UI**: Responsive design prioritizing mobile experience
- **Scalable Backend**: Supabase BaaS for easy scaling

### Key Database Tables (Planned)
Beyond the current `profiles` table, the system will include:
- `categories`, `posts`, `comments`: Forum system
- `code_snippets`: Code sharing with syntax highlighting
- `projects`: Project showcase gallery
- `likes`, `follows`, `notifications`: Social features
- Polymorphic likes system for multiple content types

### Development Guidelines
- Follow the detailed requirements in `.kiro/specs/claude-code-korea-community/requirements.md`
- Reference the API design in `design.md` for endpoint structure
- Use provided TypeScript interfaces for consistent data models
- Implement Row Level Security policies as specified in the design document

### Task Management
**IMPORTANT**: At the start of each session, read `/.kiro/specs/claude-code-korea-community/tasks.md` to check implementation progress.
- Completed tasks are marked with `[x]`
- Incomplete tasks are marked with `[ ]`
- When completing a task, update the file by changing `[ ]` to `[x]`
- The tasks.md file tracks the 20-phase implementation plan for the entire project

## Session Start Guidelines

**IMPORTANT**: Before starting each session, you must:

1. **Read Development Plan**: Read `/cckorea/cckorea-dev-plan.md` to understand the overall development plan
2. **Read TDD Guidelines**: Read `/cckorea/TDD.md` to understand and follow the test-driven development workflow
3. **Read Design Specifications**: Read `/Users/internetbasedboy/cckorea/.kiro/specs/claude-code-korea-community/design.md` for design information
4. **Read Requirements**: Read `/Users/internetbasedboy/cckorea/.kiro/specs/claude-code-korea-community/requirements.md` for detailed requirements
5. **Check Current Tasks**: Read `/Users/internetbasedboy/cckorea/.kiro/specs/claude-code-korea-community/tasks.md` to identify which tasks to work on
6. **Update Task Status**: After completing tasks, update the tasks.md file to mark them as completed