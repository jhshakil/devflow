# DevFlow - Developer Productivity Application

DevFlow is a comprehensive productivity tool for developers, featuring task management, deadline tracking, and time logging.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://prisma.io) (v6.18.0)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Styling**: Tailwind CSS & shadcn/ui
- **Package Manager**: [pnpm](https://pnpm.io)

## NixOS Setup (Required)

This project is optimized for NixOS. Due to Prisma's engine requirements, you **must** use the provided `nix-shell`.

1.  **Enter the shell**:
    ```bash
    nix-shell
    ```
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Setup Database**:
    ```bash
    pnpm db:push
    ```

## Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/devflow"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Running the Application

Inside the `nix-shell`:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Prisma Commands

- `pnpm db:generate`: Regenerate the Prisma Client
- `pnpm db:migrate`: Create and apply migrations in development
- `pnpm db:push`: Push local schema changes to the database
- `pnpm db:studio`: Open a GUI to browse your database content

> [!NOTE]
> All Prisma commands must be run inside the `nix-shell` to access the correct engine binaries.
