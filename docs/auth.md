# Authentication System

## Overview

Cookie-based authentication using JWT tokens stored in HTTP-only cookies. This ensures sessions persist across page refreshes without requiring the user to log in again.

## How It Works

```
┌─────────┐      POST /graphql (login)       ┌─────────┐
│  Client  │ ──────────────────────────────►  │  Server  │
│ (Next.js)│                                  │ (Express)│
│          │  ◄──────────────────────────────  │          │
│          │   Set-Cookie: token=<JWT>;        │          │
│          │   HttpOnly; Secure; SameSite=Lax  │          │
│          │                                   │          │
│          │  GET /graphql (any query)          │          │
│          │  Cookie: token=<JWT>               │          │
│          │ ──────────────────────────────►    │          │
└──────────┘                                   └──────────┘
```

## Cookie Configuration

| Property | Value | Reason |
|----------|-------|--------|
| `httpOnly` | `true` | Prevents XSS from accessing the token |
| `secure` | `true` in production | Only sent over HTTPS |
| `sameSite` | `lax` | CSRF protection while allowing normal navigation |
| `maxAge` | 7 days | Session duration |
| `path` | `/` | Available on all routes |

## Database Schema

New `User` model added to Prisma:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hash
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
}
```

## GraphQL API

### Mutations

```graphql
type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
}

input RegisterInput {
  email: String!
  name: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  user: User!
}
```

### Queries

```graphql
type Query {
  me: User  # Returns current user from cookie, or null
}

type User {
  id: ID!
  email: String!
  name: String!
  role: String!
  createdAt: String!
}
```

## Flow

### Register
1. Client sends `register` mutation with email, name, password
2. Server hashes password with bcrypt (12 rounds)
3. Server creates user in database
4. Server signs JWT with user ID and sets it as an HTTP-only cookie
5. Returns the user object

### Login
1. Client sends `login` mutation with email, password
2. Server verifies password against bcrypt hash
3. Server signs JWT and sets HTTP-only cookie
4. Returns the user object

### Session Persistence
1. On every request, Apollo Client sends cookies automatically (`credentials: "include"`)
2. Server middleware reads the cookie, verifies the JWT, and attaches the user to the GraphQL context
3. The `me` query returns the current user without re-authentication

### Logout
1. Client sends `logout` mutation
2. Server clears the cookie by setting `maxAge: 0`
3. Apollo cache is reset on the client

## Security

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT signed with a server-side secret (`JWT_SECRET` env var)
- Cookie is **httpOnly** — inaccessible to JavaScript
- Cookie is **secure** in production — only sent over HTTPS
- Cookie is **sameSite=lax** — mitigates CSRF
- CORS configured with `credentials: true` for cookie transmission
