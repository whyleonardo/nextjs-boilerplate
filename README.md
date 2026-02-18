# Next.js Production Boilerplate

A minimal, production-ready Next.js starter with modern tooling and authentication wired up — no demo content, ready to build on.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** + **Tailwind CSS v4**
- **bun** package manager
- **@t3-oss/env-nextjs** type-safe environment variables
- **Biome** + **ultracite** for linting/formatting
- **shadcn/ui** component library
- **better-auth** authentication (email/password, extendable)
- **Drizzle ORM** + **PostgreSQL**
- **oRPC** type-safe API layer
- **TanStack Query v5** data fetching
- **TanStack DB** client-side collections
- **Zustand** global state (with persist)
- **React Hook Form** + **Zod** validation

## Quick Start

```bash
# Clone and install
git clone https://github.com/whyleonardo/nextjs-boilerplate.git
cd nextjs-boilerplate
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local — set BETTER_AUTH_SECRET to a random 32+ char string

# Start PostgreSQL
docker compose up -d

# Push database schema
bun run db:push

# Start dev server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000)


## Project Structure

```
src/
  instrumentation.ts                      # Initialises oRPC server client at startup
  env.ts                                  # Type-safe env vars (@t3-oss/env-nextjs + Zod)
  app/
    layout.tsx                            # Root layout — imports Providers
    page.tsx                              # Home page
    providers.tsx                         # QueryClientProvider + ReactQueryDevtools
    globals.css                           # Tailwind v4 + shadcn CSS variables
    (api)/                                # Route group — no layout wrapping
      api/
        [[...rest]]/route.ts              # OpenAPI / Scalar UI handler
        auth/[...all]/route.ts            # better-auth handler
      rpc/[[...rest]]/route.ts            # oRPC RPC handler
    (auth)/                               # Route group — guest-only
      layout.tsx                          # requireGuest() guard
      sign-in/page.tsx
      sign-up/page.tsx
    (dashboard)/
      dashboard/page.tsx                  # Protected page — requireSession() guard
  features/                               # Feature-based modules
    auth/
      components/
        sign-in-form.tsx
        sign-up-form.tsx
    todo/                                 # Reference feature implementation
      contracts.ts                        # API contract (schemas + HTTP metadata)
      collections.ts                      # TanStack DB collection (query-db bridge)
      procedures/
        list.ts
        index.ts                          # Assembles and exports the router slice
  components/
    auth/
      user-button.tsx                     # Avatar dropdown with sign-out
    ui/                                   # shadcn/ui primitives
      avatar.tsx
      button.tsx
      card.tsx
      dropdown-menu.tsx
      form.tsx
      input.tsx
      label.tsx
      separator.tsx
      skeleton.tsx
      sonner.tsx
  lib/
    auth/
      client.ts                           # better-auth React client
      session.ts                          # getSession / requireSession / requireGuest
    orpc/
      client.ts                           # oRPC client + TanStack Query utils (browser)
      server.ts                           # oRPC direct router client (server-only)
      serializer.ts                       # StandardRPCJsonSerializer for SSR hydration
    query/
      client.ts                           # createQueryClient / getQueryClient singleton
      hydration.tsx                       # HydrateClient + per-request getQueryClient
    utils.ts                              # cn() — clsx + tailwind-merge
  server/
    auth/index.ts                         # betterAuth config (Drizzle adapter, email/password)
    db/
      index.ts                            # Drizzle client (postgres-js)
      schema/
        auth.ts                           # user, session, account, verification tables
        index.ts                          # Barrel re-export
    rpc/
      index.ts                            # Central router + AppRouter type
      middleware.ts                       # publicProcedure / authMiddleware / protectedProcedure
  store/
    app-store.ts                          # Zustand store (persisted to localStorage)
```

## Environment Variables

Environment variables are validated at build time using `@t3-oss/env-nextjs` and Zod schemas.

All environment variable definitions live in `src/env.ts`:
- **Server variables**: Only accessible server-side (e.g., `DATABASE_URL`, `BETTER_AUTH_SECRET`)
- **Client variables**: Must be prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_APP_URL`)

**Adding a new environment variable:**
1. Add to `.env.example` and `.env.local`
2. Add schema to `src/env.ts` (server or client section)
3. Add to `runtimeEnv` object in `src/env.ts`

Import and use: `import { env } from "@/env"`

## Authentication

Server-side route guards live in Server Components — no middleware.

**Protect a page:**
```tsx
import { requireSession } from "@/lib/auth/session";

export default async function ProtectedPage() {
  const { user } = await requireSession(); // Redirects to /sign-in if not authenticated
  return <div>Hello {user.email}</div>;
}
```

**Redirect authenticated users away from auth pages:**
```tsx
import { requireGuest } from "@/lib/auth/session";

export default async function AuthLayout({ children }) {
  await requireGuest(); // Redirects to /dashboard if already signed in
  return <div>{children}</div>;
}
```

## Database

```bash
bun run db:generate   # Generate migration from schema changes
bun run db:migrate    # Run migrations
bun run db:push       # Push schema to DB (dev only)
bun run db:studio     # Open Drizzle Studio
```

Schema files live in `src/server/db/schema/`. The `auth.ts` schema is auto-generated by better-auth.

## API (oRPC)

The API layer uses a **contract-first** pattern. Each feature owns its contract (schema + HTTP metadata) and its procedure implementations. The central router in `src/server/rpc/index.ts` only wires features together.

### File layout (follow the `todo` feature as the reference)

```
src/features/<name>/
  contracts.ts          # API shape: schemas + HTTP route metadata (no logic)
  procedures/
    <procedure>.ts      # One file per procedure
    index.ts            # Assembles and exports the router slice
```

### 1. Define the contract

```ts
// src/features/todo/contracts.ts
import { oc } from "@orpc/contract";
import { z } from "zod";

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const todoContract = {
  list: oc
    .route({ method: "GET", path: "/todos", summary: "List all todos" })
    .output(z.array(TodoSchema)),

  create: oc
    .route({ method: "POST", path: "/todos", summary: "Create a todo" })
    .input(z.object({ title: z.string().min(1).max(255) }))
    .output(TodoSchema),
};
```

### 2. Implement each procedure in its own file

```ts
// src/features/todo/procedures/list.ts
import { implement } from "@orpc/server";
import { todoContract } from "@/features/todo/contracts";
import { authMiddleware } from "@/server/rpc/middleware";

const os = implement(todoContract);

export const listTodos = os.list.use(authMiddleware).handler(() => {
  return []; // replace with a real query
});
```

```ts
// src/features/todo/procedures/create.ts
import { implement } from "@orpc/server";
import { type Todo, todoContract } from "@/features/todo/contracts";
import { authMiddleware } from "@/server/rpc/middleware";

const os = implement(todoContract);

export const createTodo = os.create.use(authMiddleware).handler(({ input }) => {
  const todo: Todo = { id: crypto.randomUUID(), title: input.title };
  return todo;
});
```

### 3. Assemble the feature slice

```ts
// src/features/todo/procedures/index.ts
import { listTodos } from "./list";
import { createTodo } from "./create";

export const todo = {
  list: listTodos,
  create: createTodo,
};
```

### 4. Register the slice in the router

```ts
// src/server/rpc/index.ts
import { todo } from "@/features/todo/procedures";

export const router = {
  todo,
};

export type AppRouter = typeof router;
```

### Middleware

Two procedure bases are available from `src/server/rpc/middleware.ts`:

| Export | When to use |
|---|---|
| `publicProcedure` | No auth required |
| `authMiddleware` | Use with `implement()` — gates the handler behind a valid session |
| `protectedProcedure` | Builder-style alternative to `authMiddleware` |

### Calling procedures from the client

```tsx
"use client";
import { orpc } from "@/lib/orpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function Todos() {
  const { data } = useQuery(orpc.todo.list.queryOptions());

  const create = useMutation(orpc.todo.create.mutationOptions());

  return (
    <div>
      {data?.map(t => <p key={t.id}>{t.title}</p>)}
      <button onClick={() => create.mutate({ title: "New todo" })}>Add</button>
    </div>
  );
}
```

### Calling procedures from Server Components

```tsx
// No HTTP round-trip — calls the router directly on the server
import "@/lib/orpc/server";

export default async function TodosPage() {
  const todos = await globalThis.$client.todo.list();
  return <ul>{todos.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

## TanStack DB Collections

TanStack DB sits on top of TanStack Query and provides a reactive, client-side collection store. The bridge between them is `@tanstack/query-db-collection`, which maps a query key directly to a live collection — so any mutation that invalidates the query automatically syncs the collection.

### How it works

```
oRPC procedure ──► queryKey / queryFn ──► TanStack Query cache ──► TanStack DB collection
                                                   ▲
                                          mutations invalidate here
```

### 1. Create a collection

Put collections next to the feature they belong to:

```ts
// src/features/todo/collections.ts
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { orpc } from "@/lib/orpc/client";
import { getQueryClient } from "@/lib/query/client";

export const todosCollection = createCollection(
  queryCollectionOptions({
    syncMode: "on-demand",               // Fetch only when something subscribes
    queryKey: orpc.todo.list.queryKey(), // Shares the same cache entry as useQuery(orpc.todo.list.queryOptions())
    queryFn: async () => await orpc.todo.list.call(),
    queryClient: getQueryClient(),       // Browser singleton — same instance as QueryClientProvider
    getKey: (item) => item.id,           // Primary key for TanStack DB's internal map
  }),
);
```

**Key points:**
- `queryKey` must match the key used by `useQuery` so both share the same cache entry.
- `getQueryClient()` from `src/lib/query/client.ts` returns the browser singleton — the same instance wrapped by `<QueryClientProvider>`.
- `syncMode: "on-demand"` means data is only fetched when the collection is actually used (no background polling on mount).

### 2. Query the collection in a component

Use `useLiveQuery` from `@tanstack/react-db`. It accepts a query builder function (`q`) that describes what to fetch from the collection, and returns reactive `data`, `isLoading`, and `isError` flags.

**Basic — all todos:**

```tsx
"use client";
import { useLiveQuery } from "@tanstack/react-db";
import { todosCollection } from "@/features/todo/collections";

export function TodoList() {
  const { data: todos, isLoading } = useLiveQuery((q) =>
    q.from({ todos: todosCollection })
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

**With `where` filter and `select` projection:**

```tsx
"use client";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { todosCollection } from "@/features/todo/collections";

export function IncompleteTodos() {
  const { data: todos, isLoading, isError } = useLiveQuery((q) =>
    q
      .from({ todos: todosCollection })
      .where(({ todos }) => eq(todos.completed, false))
      .select(({ todos }) => ({ id: todos.id, title: todos.title }))
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

**With reactive deps — re-runs the query when a variable changes:**

```tsx
"use client";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { useState } from "react";
import { todosCollection } from "@/features/todo/collections";

export function FilteredTodos() {
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: todos } = useLiveQuery(
    (q) =>
      q
        .from({ todos: todosCollection })
        .where(({ todos }) => eq(todos.completed, showCompleted)),
    [showCompleted] // Re-runs when showCompleted changes
  );

  return (
    <>
      <button onClick={() => setShowCompleted((v) => !v)}>
        Show {showCompleted ? "incomplete" : "completed"}
      </button>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  );
}
```

### Collection vs plain useQuery — when to use which

| Scenario | Recommended |
|---|---|
| Simple list display, no client-side filtering | `useQuery(orpc.todo.list.queryOptions())` |
| Client-side filter / projection without a round-trip | `useLiveQuery` with `.where()` / `.select()` |
| Reactive query that depends on local state | `useLiveQuery` with deps array |
| Optimistic UI with local writes | TanStack DB (built-in `optimisticUpdate` support) |
| SSR prefetch + hydration | `useQuery` + `HydrateClient` (collections are client-only) |

## OpenAPI Documentation

The API automatically generates OpenAPI 3.x specification from your oRPC router.

**Interactive API documentation (Scalar UI):**
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`
- Or visit `/api/openapi` in a browser (auto-detects HTML preference)

**Raw OpenAPI spec (JSON):**
- `/api/openapi` — JSON specification (default for API clients)
- `/api/openapi?format=json` — Explicit JSON format

**Use the spec with:**
- **Postman**: Import `/api/openapi` URL
- **API clients**: Generate SDKs using [openapi-generator](https://github.com/OpenAPITools/openapi-generator)
- **Custom tools**: Consume the OpenAPI JSON directly

The spec is auto-generated from your Zod schemas and contract definitions in `src/features/`.

## Scripts

```bash
bun run dev           # Start dev server
bun run build         # Production build
bun run start         # Start production server
bun run lint          # Biome check (via ultracite)
bun run fix           # Biome fix (via ultracite)
```

## What's Included

- Email/password authentication (extendable to OAuth, magic links, etc.)
- Server-side session management
- Protected route example (`/dashboard`)
- Auth pages with client-side forms
- Type-safe API client (oRPC + TanStack Query)
- Database migrations + Drizzle Studio
- shadcn/ui components (button, card, input, form, dropdown, avatar, etc.)
- Minimal Zustand store with localStorage persistence
- Docker Compose PostgreSQL setup

## What's NOT Included

This is infrastructure, not a demo app. No landing page, no todo list, no dashboard layout. Build your own features on top.

## License

MIT
