#!/usr/bin/env bash
# Levanta el PostgreSQL de test con reintentos.
#
# Con podman/netavark, tras ciclos de down/up las reglas nftables de la red
# del proyecto pueden quedar corruptas y todo arranque con puerto publicado
# falla con "netavark: nftables error: got invalid json". La receta que lo
# resuelve: borrar el contenedor a medio crear Y la red del proyecto (compose
# la recrea limpia en el siguiente up), y reintentar.
set -u

for attempt in 1 2 3 4 5; do
	if docker compose up -d postgres-test; then
		exit 0
	fi
	echo "docker compose up falló (intento $attempt/5); limpiando y reintentando…" >&2
	# `docker compose rm` no borra el contenedor a medio crear bajo
	# podman-compose (falla silenciosamente); se borra por nombre fijo
	docker rm -f donde-esta-tu-local-e2e-db 2>/dev/null || true
	podman network rm donde-esta-tu-local_default >/dev/null 2>&1 || true
	sleep 5
done

echo "No se pudo levantar el PostgreSQL de test tras 5 intentos" >&2
exit 1
