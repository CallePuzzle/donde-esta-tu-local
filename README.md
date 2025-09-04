# donde-esta-tu-local

## migración

```
npx wrangler d1 export donde-esta-tu-local --remote --output=./database.sql
bun run prisma/migrate-gangs.ts
source .env.auth0
bun run prisma/migrate-users.ts
```
