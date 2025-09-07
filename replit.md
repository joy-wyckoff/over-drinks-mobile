# Over Drinks - Dating App

## Overview

Over Drinks is a sophisticated dating application with a speakeasy-themed UI that connects users at specific venues like jazz clubs, cocktail bars, and dance clubs. The app enables location-based matching where users check into venues and discover potential romantic connections who are physically present at the same location. The application features a full-stack TypeScript architecture with a React frontend, Express backend, and PostgreSQL database, all styled with a vintage art deco aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes based on authentication state
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom speakeasy/art deco theming using CSS variables
- **State Management**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Authentication**: Replit OpenID Connect (OIDC) authentication with Passport.js strategy
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and logging middleware
- **Database Layer**: Storage abstraction pattern with interface-based design for testability

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless driver for connection pooling
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema**: Comprehensive dating app schema including users, profiles, venues, check-ins, and matches
- **Migrations**: Drizzle Kit for database schema migrations and version control

### Authentication and Authorization
- **Provider**: Replit's OIDC authentication system for seamless platform integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL (7-day default)
- **Route Protection**: Middleware-based authentication checking with automatic redirect handling
- **User Management**: Automatic user creation/update on authentication with profile linking

### Core Business Logic
- **Venue System**: Curated venue database with categorization (jazz clubs, cocktail bars, speakeasies)
- **Check-in Mechanism**: Location-based check-ins with automatic checkout functionality
- **Matching Algorithm**: Mutual interest-based matching system with venue-specific context
- **Profile Management**: Rich user profiles with interests, demographics, and photos

### Development and Deployment
- **Build System**: Vite for frontend bundling with ESBuild for backend compilation
- **Environment**: Development/production configuration with Replit-specific optimizations
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Logging**: Structured request/response logging for API endpoints

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time capabilities through Neon's WebSocket connections

### Authentication Services
- **Replit OIDC**: Platform-native authentication with automatic user provisioning
- **OpenID Client**: Industry-standard authentication flow implementation

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide Icons**: Consistent iconography throughout the application
- **Google Fonts**: Custom typography (Playfair Display, Inter) for brand identity

### Development Tools
- **Replit Integration**: Platform-specific plugins for development environment optimization
- **TypeScript**: Full-stack type safety with shared schema definitions
- **ESLint/Prettier**: Code quality and formatting consistency (implied by project structure)