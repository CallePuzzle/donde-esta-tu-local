# Actividades de peñas 2026 — cómo modelar las actividades de madrugada

> Análisis (sin cambios de código) de cómo plasmar el programa 2026 en el seed de
> actividades y en el modelo de datos. Pendiente de decidir la opción antes de tocar
> nada.

## El programa 2026

- **MIÉRCOLES 9**
  - Organizado por las peñas — Limonada [19:30] (Inicio desde la plaza)
  - Las Nomadas — Fiesta Las Nomadas [Después de la Limonada]
- **JUEVES 10**
  - Los Bugas — TRUCHA SOUND FESTIVAL XI - SIDRADA [Después del pregón]
  - Alok-2 — FIESTA LA TEJA [04:00] ← noche del jueves, físicamente viernes 04:00
- **VIERNES 11**
  - PASCUAL RACE — Carrera de motos para niños de 0 a 4 años [13:00] (confirmar asistencia: +34 617 14 84 19)
  - Las Contenta me tienes — FIESTA CONTENTONGO XX ANIVERSARIO [16:00 a 19:00]
  - El Desmadre — DANZA DEL SAPO V [05:00 a 08:00] ← noche del viernes, físicamente sábado 05:00
- **SÁBADO 12**
  - La Babrera + KPY — VII BABRERA CIRCUS PARTY + CHUPITADA [15:30 a 18:00]
  - El Badulake — XV METERLA EN LA VIGA [Después de los toros]
  - La Movida — FIESTA DEL CORZO III [De encierro a encierro]
- **DOMINGO 13**
  - Las Druidas + Gres-k — Concierto Flamenco Pop-Rock con Aarón Miguel [15:30]
  - La Talankera — VIVA EL VINO (NUMERO) [Después de los toros] ← `(NUMERO)` es placeholder de edición, resolver antes de seedear
  - El 13 La Víspera — JUEGO DEL PAÑUELO [Descanso del Baile]
- **LUNES 14**
  - La Talankera — Fiesta La Talankera [Por la noche]

## El problema

`Activity.date` (`prisma/schema.prisma:140`, `DateTime @unique`) hoy hace dos trabajos:

1. **Lógica**: ordenar y separar próximas/pasadas y agrupar por año en
   `src/routes/activities/+page.server.ts` (`where: { date: { gte: now } }`, etc.).
2. **Presentación**: decirle al usuario qué día/hora es la actividad.

Para actividades de madrugada esos dos trabajos entran en conflicto: "Fiesta La Teja
[04:00] del jueves" es físicamente el **viernes 11 a las 04:00**, pero debe aparecer
como jueves noche.

El seed actual (`prisma/seed-activities.ts`) ya sufre el hack en las dos direcciones:

- `Fiesta La Teja` guarda el instante real (`2026-09-11T02:00Z` = viernes 04:00 local,
  CEST = UTC+2) y lo "arregla" con `dateDesc: 'Noche del jueves 10, a las 04:00'` → si
  la UI muestra el día de `date`, aparece como **viernes** 04:00 con una aclaración.
  Confuso.
- `V Danza del Sapo` guarda `2026-09-11T03:00Z` = **viernes** 05:00 local, pero en el
  programa es "[05:00 a 08:00]" del viernes noche, es decir, **sábado 05:00 real**.
  Aquí se mintió en `date` para que se vea como viernes → la lógica pasada/futura se
  adelanta 24h (pasaría a "pasada" el viernes 05:00, un día antes de ocurrir).

## Opciones

### Opción A — `date` = instante real, `dateDesc` lleva el encuadre festivo

Guardar siempre el instante físico correcto (La Teja → viernes 04:00 local, Sapo →
sábado 05:00 local) y usar `dateDesc` para "Noche del jueves", "Noche del viernes", etc.

- ✅ Cero migración; la lógica de próximas/pasadas queda exacta.
- ❌ El día visible (de `date`) y el `dateDesc` se contradicen salvo que la UI sepa
  combinarlos ("vie 11, 04:00 · Noche del jueves"). Hay que revisar cómo se renderiza
  la fecha en `src/routes/activities/+page.svelte`.

### Opción B — dos campos: instante real + día festivo (recomendada si se toca el esquema)

`date` pasa a ser estrictamente el instante real (solo para ordenar y filtrar), y se
añade p.ej. `festiveDate DateTime @db.Date` con el día social de la actividad: jueves
10 para La Teja, viernes 11 para el Sapo.

- La UI muestra siempre `festiveDate` + hora real; el servidor filtra por `date`.
- ✅ Sin contradicciones; sin texto libre para algo estructural; el `@unique` de `date`
  sigue cumpliendo D2 con instantes reales.
- ❌ Migración Prisma + rellenar el campo en seeds existentes + usar el campo nuevo en
  la página.

### Opción C — flag "noche del día anterior"

Un solo `date` real más un booleano "pertenece a la noche del día anterior"; al
renderizar se resta un día al día mostrado.

- ✅ Más barato que B.
- ❌ Guarda información derivable de forma redundante y es menos legible que una fecha
  explícita. No recomendada sobre B.

## Recomendación

- Si la página de actividades **no agrupa por cabeceras de día** (pendiente mirar
  `+page.svelte`), la Opción A con convención estricta (`date` siempre real +
  `dateDesc` con "Noche del X") resuelve el seed de 2026 sin migración.
- Si la UI agrupa por día o se quiere que "jueves noche" sea un **dato** y no un
  texto, la Opción B es la correcta a largo plazo.

## Cosas a resolver al tocar el seed 2026

- `VIVA EL VINO (NUMERO)`: `(NUMERO)` es un placeholder del programa para el número de
  edición; resolverlo antes de seedear.
- `V Danza del Sapo`: corregir la fecha según la convención elegida (instante real =
  sábado 12 a las 05:00 local, `2026-09-12T03:00:00.000Z`).
