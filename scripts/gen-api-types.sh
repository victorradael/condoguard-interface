#!/usr/bin/env bash
# Regenera types/api.d.ts a partir do OpenAPI da API.
# Na API: `go run ./cmd/openapi > openapi.json`; copie para web/openapi.json e rode `npm run gen:api`.
set -euo pipefail
cd "$(dirname "$0")/.."
npx openapi-typescript openapi.json -o types/api.d.ts
