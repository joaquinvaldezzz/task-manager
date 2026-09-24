# Task Manager

Task Manager is a modern web application built with **Laravel 12**, **Inertia.js v2**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

## Tech Stack Summary

- **Backend**:
  - Laravel 12
  - Laravel Fortify (Authentication & Two-Factor Authentication)
  - SQLite (Default database engine)
  - Pest 4 (Testing framework)
  - Laravel Pint (PHP code style and formatting)
- **Frontend**:
  - Inertia.js v2
  - React 19
  - Tailwind CSS v4
  - TypeScript
  - Vite 7
- **Runtimes & Package Managers**:
  - PHP 8.4+ (minimum requirement: `>= 8.2`)
  - Composer 2.x
  - Bun >= 1.0 (primary frontend package manager and concurrent dev runner)

## Prerequisites

Ensure your development environment meets the following requirements:

- **PHP >= 8.2** (PHP 8.4 recommended) with the following required extensions:
  - `pdo_sqlite`
  - `curl`
  - `mbstring`
  - `openssl`
  - `tokenizer`
  - `xml`
- **Composer 2.x**: [https://getcomposer.org](https://getcomposer.org)
- **Bun >= 1.0**: [https://bun.sh](https://bun.sh) (used for frontend dependencies, builds, and development orchestration)
- **SQLite 3**: local database engine

## Quick Start (Automated Setup)

1. **Clone the repository**:

   ```bash
   git clone git@github.com:joaquinvaldezzz/task-manager.git
   cd task-manager
   ```

2. **Run automated setup**:

   ```bash
   composer run setup
   ```

   The `composer run setup` command automatically:
   - Installs PHP dependencies via `composer install`
   - Copies `.env.example` to `.env` if `.env` does not already exist
   - Generates the application key with `php artisan key:generate`
   - Runs database migrations with `php artisan migrate --force`
   - Installs JavaScript dependencies via `bun install`
   - Builds frontend production assets via `bun run build`

3. **Seed database (optional)**:

   ```bash
   php artisan db:seed
   ```

4. **Start local development**:
   ```bash
   composer run dev
   ```

## Manual Step-by-Step Installation

If you prefer setting up the application manually rather than running `composer run setup`, follow these steps:

1. **Install backend dependencies**:

   ```bash
   composer install
   ```

2. **Configure environment file**:

   ```bash
   cp .env.example .env
   ```

3. **Generate application key**:

   ```bash
   php artisan key:generate
   ```

4. **Ensure SQLite database file exists**:

   ```bash
   touch database/database.sqlite
   ```

5. **Run database migrations**:

   ```bash
   php artisan migrate
   ```

6. **Seed default user (optional)**:

   ```bash
   php artisan db:seed
   ```

7. **Install frontend packages**:

   ```bash
   bun install
   ```

8. **Build or compile assets**:
   ```bash
   bun run build
   ```

## Running the Application Locally

### Recommended: All-in-One Development Command

Run all services concurrently using:

```bash
composer run dev
```

This starts 4 concurrent processes managed via Bun:

- **`server`**: Laravel local development server via `php artisan serve` (accessible at [http://localhost:8000](http://localhost:8000))
- **`queue`**: Database queue worker via `php artisan queue:listen --tries=1`
- **`logs`**: Real-time terminal log viewer via `php artisan pail --timeout=0`
- **`vite`**: Vite development server with Hot Module Replacement (HMR) via `bun run dev`

### Alternative: Manual Multi-Terminal Approach

If you prefer running individual processes in separate terminal tabs:

- **Terminal 1 (Web Server)**:
  ```bash
  php artisan serve
  ```
- **Terminal 2 (Vite Dev Server)**:
  ```bash
  bun run dev
  ```
- **Terminal 3 (Queue Worker, optional)**:
  ```bash
  php artisan queue:listen
  ```
- **Terminal 4 (Log Tail, optional)**:
  ```bash
  php artisan pail
  ```

## Default Credentials

When seeded using `php artisan db:seed`, the database creates a default user:

- **Email**: `test@example.com`
- **Password**: `password`

Alternatively, you can register a new account directly in your browser at [http://localhost:8000/register](http://localhost:8000/register).

## Testing & Code Quality Commands

### Backend (PHP / Laravel)

- **Run all tests**:
  ```bash
  composer test
  # or
  php artisan test
  ```
- **Format PHP code (Laravel Pint)**:
  ```bash
  composer lint
  ```
- **Check PHP code style without modifying**:
  ```bash
  composer test:lint
  ```

### Frontend (TypeScript / React)

- **TypeScript type checking**:
  ```bash
  bun run types
  ```
- **Lint TypeScript/React code**:
  ```bash
  bun run lint
  ```
- **Format frontend code with Prettier**:
  ```bash
  bun run format
  ```
- **Check formatting without modifying**:
  ```bash
  bun run format:check
  ```
