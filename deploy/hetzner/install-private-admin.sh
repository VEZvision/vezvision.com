#!/bin/sh
set -eu

SQL_FILE=${1:-/tmp/provision-admin-postgrest.sql}
DB_CONTAINER=${DB_CONTAINER:-eqjb8pst5x7hcgk3a8wp4uy6}
DB_NAME=${DB_NAME:-vezvision}
SECRET_DIR=${SECRET_DIR:-/etc/vezvision-admin}
CONTAINER_NAME=${CONTAINER_NAME:-vezvision-admin-postgrest}
LISTEN_ADDRESS=${LISTEN_ADDRESS:-127.0.0.1}
LISTEN_PORT=${LISTEN_PORT:-43001}

test -r "$SQL_FILE"
docker inspect "$DB_CONTAINER" >/dev/null

sudo install -d -m 700 "$SECRET_DIR"
sudo sh -c '
  set -eu
  umask 077
  test -s "$1/db-password" || openssl rand -hex 32 > "$1/db-password"
  test -s "$1/api-key" || openssl rand -hex 32 > "$1/api-key"
' sh "$SECRET_DIR"

admin_password=$(sudo head -n 1 "$SECRET_DIR/db-password")
admin_api_key=$(sudo head -n 1 "$SECRET_DIR/api-key")
admin_api_key_sha256=$(printf '%s' "$admin_api_key" | sha256sum | awk '{print $1}')

docker exec -i "$DB_CONTAINER" psql \
  -v ON_ERROR_STOP=1 \
  -U postgres \
  -d "$DB_NAME" \
  -v admin_password="$admin_password" \
  -v admin_api_key_sha256="$admin_api_key_sha256" \
  < "$SQL_FILE"

sudo sh -c '
  set -eu
  umask 077
  printf "%s\n" \
    "PGRST_DB_URI=postgresql://vezvision_admin_authenticator:$1@$2:5432/$3" \
    "PGRST_DB_SCHEMA=public" \
    "PGRST_DB_ANON_ROLE=vezvision_admin_api" \
    "PGRST_DB_PRE_REQUEST=public.check_vezvision_admin_api_key" \
    "PGRST_SERVER_HOST=0.0.0.0" \
    "PGRST_SERVER_PORT=3000" \
    > "$4/postgrest.env"
' sh "$admin_password" "$DB_CONTAINER" "$DB_NAME" "$SECRET_DIR"

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --network coolify \
  --publish "$LISTEN_ADDRESS:$LISTEN_PORT:3000" \
  --env-file "$SECRET_DIR/postgrest.env" \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --label vezvision.component=private-admin-postgrest \
  postgrest/postgrest:v14.1 >/dev/null

i=0
until curl -fsS \
  -H "X-Internal-API-Key: $admin_api_key" \
  "http://$LISTEN_ADDRESS:$LISTEN_PORT/vv_site_settings?select=key&limit=1" \
  >/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 20 ]; then
    docker logs --tail 50 "$CONTAINER_NAME" >&2
    exit 1
  fi
  sleep 1
done

no_key_status=$(curl -sS -o /dev/null -w '%{http_code}' \
  "http://$LISTEN_ADDRESS:$LISTEN_PORT/vv_site_settings?select=key&limit=1")
with_key_status=$(curl -sS -o /dev/null -w '%{http_code}' \
  -H "X-Internal-API-Key: $admin_api_key" \
  "http://$LISTEN_ADDRESS:$LISTEN_PORT/vv_site_settings?select=key&limit=1")

printf 'private admin API: no-key=%s with-key=%s\n' "$no_key_status" "$with_key_status"
