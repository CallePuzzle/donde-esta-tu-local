# Donde esta tu local

Aplicación para saber donde están las peñas de tu pueblo.

## Desarrollo

```bash
yarn install
npx wrangler d1 migrations apply donde-esta-tu-local --local
yarn dev
```

## Migraciones

### Desde cero

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script \
  --output migrations/0001_v2.0.0.sql
npx prisma db seed
```

### Crear una migración

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

- Reinciciar base de datos local:

```bash
rm -rf .wrangler && npx wrangler d1 migrations apply donde-esta-tu-local --local && npx prisma db seed
```

- https://reacthustle.com/blog/how-to-implement-a-reusable-responsive-modal-in-react-with-daisyui#implementing-click-outside-functionality

- Asignar usuario admin:

```sqlite
UPDATE User
SET role = 'ADMIN'
WHERE id = 'sms|66d34d58ac3bbf23e5fe179';
```

- Resetar datos:

```sqlite
DELETE FROM Gang;
DELETE FROM Notification;
DELETE FROM Session;
DELETE FROM User;
DELETE FROM _NotificationToUser;
```
