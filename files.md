# Project File Structure and Purpose

This document provides a high-level overview of the files and directories in the Colab Text Editor project.

## 📂 Root Directory
- **`README.md`**: Main project documentation, setup instructions, and tech stack overview.
- **`files.md`**: This file, describing the purpose of each file and folder.
- **`next.config.ts`**: Configuration for Next.js.
- **`package.json`**: Project dependencies, scripts, and metadata.
- **`tsconfig.json`**: TypeScript compiler configuration.
- **`.env.local`**: Environment variables for the frontend and API.
- **`.gitignore`**: Specifies files and directories ignored by Git.
- **`postcss.config.mjs`**: Configuration for PostCSS (Tailwind CSS).
- **`eslint.config.mjs`**: ESLint rules for code quality.
- **`components.json`**: shadcn/ui component configuration.
- **`proxy.ts`**: A local proxy server for development (if used for WebSocket/CORS).
- **`debug-db.mjs`**: Utility script for debugging database connections.

## 📁 `app/` (Next.js App Router)
- **`page.tsx`**: The main dashboard/landing page of the application.
- **`layout.tsx`**: The root layout for the entire application, including the HTML head and body.
- **`globals.css`**: Global CSS styles and Tailwind imports.
- **`collaboration.css`**: Specialized styles for collaborative features like cursor indicators.
- **`api/`**: Serverless API routes for the application.
    - **`auth/`**: Authentication routes (login, register, session management).
    - **`documents/`**: CRUD operations for document metadata.
    - **`invitations/`**: Routes for managing user invitations to documents.
    - **`users/`**: User-specific data and profile routes.
- **`editor/`**: Sub-directory for document-specific pages (e.g., `[id]/page.tsx`).
- **`login/`**: User login page.
- **`register/`**: User registration page.

## 📁 `colab-sync-service/` (Synchronization Microservice)
- **`index.ts`**: Entry point for the Hocuspocus/WebSocket synchronization server.
- **`db.ts`**: Database persistence logic for saved document state (MongoDB).
- **`package.json`**: Dependencies for the synchronization service.
- **`tsconfig.json`**: TypeScript config for the service.
- **`debug_db.ts`**, `debug_users.ts`, `diagnose-connection.ts`: Diagnostic and testing scripts for the sync service.
- **`server.log`**: Local log file for service output.

## 📁 `components/` (React Components)
- **`editor/`**: Components specifically for the TipTap editor (toolbar, editor area, share modal).
- **`layout/`**: General UI layout components (Sidebar, Navbar).
- **`ui/`**: Reusable base UI components (Buttons, Inputs, Dialogs, etc. - built with shadcn/ui).
- **`theme-provider.tsx`**: Context provider for light/dark mode switching.

## 📁 `context/` (React Context)
- **`auth-context.tsx`**: Provides global authentication state to the entire app.

## 📁 `lib/` (Utilities and Shared Logic)
- **`db.ts`**: Mongoose connection utility for the Next.js API.
- **`auth-utils.ts`**: Helper functions for JWT verification and hashing.
- **`utils.ts`**: General-purpose utility functions (e.g., `cn` for Tailwind class merging).

## 📁 `models/` (Database Models)
- **`User.ts`**: Mongoose schema for User profiles and accounts.
- **`Document.ts`**: Mongoose schema for Document metadata and ownership.
- **`Invitation.ts`**: Mongoose schema for tracking document access invitations.

## 📁 `public/` (Static Assets)
- SVG icons, favicon, and other static files served by Next.js.
