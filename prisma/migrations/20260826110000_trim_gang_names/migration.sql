-- Elimina espacios iniciales/finales de los nombres de peña y sincroniza
-- normalizedName con la versión en minúsculas. El formulario ya aplica .trim()
-- en el schema (addGangSchema), pero registros antiguos quedaron con espacios.
UPDATE "gang"
SET
	name = trim(name),
	"normalizedName" = lower(trim(name));

-- Si tras el recorte quedan nombres duplicados, desambigua los segundos y
-- siguientes añadiendo un sufijo numérico. Se preserva la primera (id menor).
WITH ranked AS (
	SELECT
		id,
		row_number() OVER (PARTITION BY "normalizedName" ORDER BY id) AS rn
	FROM "gang"
)
UPDATE "gang" g
SET
	name = g.name || ' (' || r.rn || ')',
	"normalizedName" = g."normalizedName" || '-' || r.rn
FROM ranked r
WHERE g.id = r.id
  AND r.rn > 1;
