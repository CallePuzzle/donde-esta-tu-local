# Donde esta tu local

Aplicación para saber donde están las peñas de tu pueblo.

## Desarrollo

```bash
yarn install
npx wrangler d1 migrations apply donde-esta-tu-local --local
yarn dev
```

## Migraciones

```bash
npx wrangler d1 migrations create donde-esta-tu-local migration_name
npx prisma migrate diff \
  --from-local-d1 \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output migrations/migration_name.sql
npx wrangler d1 migrations apply donde-esta-tu-local --local
npx prisma generate
```

Kill vite server and run `yarn dev` again.

## TODO

- https://reacthustle.com/blog/how-to-implement-a-reusable-responsive-modal-in-react-with-daisyui#implementing-click-outside-functionality
