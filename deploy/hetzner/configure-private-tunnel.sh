#!/bin/sh
set -eu

PRODUCTION_HOST=${PRODUCTION_HOST:-vez-prod}
LAB_HOST=${LAB_HOST:-vezlabs-coolify}
PRODUCTION_IP=${PRODUCTION_IP:-46.225.25.171}
REMOTE_ADMIN_PORT=${REMOTE_ADMIN_PORT:-43001}
LAB_ADMIN_PORT=${LAB_ADMIN_PORT:-43000}
ssh "$LAB_HOST" 'sudo install -d -m 700 /etc/vezvision-production-tunnel; sudo sh -s' <<'REMOTE'
set -eu
umask 077
test -s /etc/vezvision-production-tunnel/id_ed25519 || \
  ssh-keygen -q -t ed25519 -N '' -C vezvision-production-tunnel \
    -f /etc/vezvision-production-tunnel/id_ed25519
REMOTE

tunnel_public_key=$(ssh "$LAB_HOST" \
  'sudo head -n 1 /etc/vezvision-production-tunnel/id_ed25519.pub')
tunnel_key_type=$(printf '%s\n' "$tunnel_public_key" | awk '{print $1}')
tunnel_key_data=$(printf '%s\n' "$tunnel_public_key" | awk '{print $2}')

ssh "$PRODUCTION_HOST" sudo sh -s -- \
  "$tunnel_key_type" "$tunnel_key_data" "$REMOTE_ADMIN_PORT" <<'REMOTE'
set -eu
key_type=$1
key_data=$2
remote_admin_port=$3

id vezvision_tunnel >/dev/null 2>&1 || \
  useradd --system --create-home --home-dir /var/lib/vezvision-tunnel \
    --shell /bin/sh vezvision_tunnel
if passwd -S vezvision_tunnel | awk '{exit ($2 == "L" ? 0 : 1)}'; then
  random_password=$(openssl rand -hex 32)
  usermod -p "$(openssl passwd -6 "$random_password")" vezvision_tunnel
fi
install -d -m 700 -o vezvision_tunnel -g vezvision_tunnel \
  /var/lib/vezvision-tunnel/.ssh
umask 077
printf '%s %s %s\n' \
  "command=\"/bin/false\",no-agent-forwarding,no-X11-forwarding,no-pty,no-user-rc,permitopen=\"127.0.0.1:$remote_admin_port\"" \
  "$key_type" \
  "$key_data" \
  > /var/lib/vezvision-tunnel/.ssh/authorized_keys
chown vezvision_tunnel:vezvision_tunnel \
  /var/lib/vezvision-tunnel/.ssh/authorized_keys
chmod 600 /var/lib/vezvision-tunnel/.ssh/authorized_keys
printf '%s\n' \
  'Match User vezvision_tunnel' \
  '    AuthenticationMethods publickey' \
  '    PasswordAuthentication no' \
  '    KbdInteractiveAuthentication no' \
  '    PubkeyAuthentication yes' \
  '    AllowTcpForwarding local' \
  "    PermitOpen 127.0.0.1:$remote_admin_port" \
  '    X11Forwarding no' \
  '    PermitTTY no' \
  > /etc/ssh/sshd_config.d/60-vezvision-tunnel.conf
sshd -t
systemctl reload ssh
REMOTE

production_host_key=$(ssh "$PRODUCTION_HOST" \
  'sudo head -n 1 /etc/ssh/ssh_host_ed25519_key.pub')
host_key_type=$(printf '%s\n' "$production_host_key" | awk '{print $1}')
host_key_data=$(printf '%s\n' "$production_host_key" | awk '{print $2}')
coolify_gateway=$(ssh "$LAB_HOST" \
  'docker network inspect coolify --format "{{(index .IPAM.Config 0).Gateway}}"')

ssh "$LAB_HOST" sudo sh -s -- \
  "$PRODUCTION_IP" "$host_key_type" "$host_key_data" \
  "$coolify_gateway" "$LAB_ADMIN_PORT" "$REMOTE_ADMIN_PORT" <<'REMOTE'
set -eu
production_ip=$1
host_key_type=$2
host_key_data=$3
coolify_gateway=$4
lab_admin_port=$5
remote_admin_port=$6

umask 077
printf '%s %s %s\n' "$production_ip" "$host_key_type" "$host_key_data" \
  > /etc/vezvision-production-tunnel/known_hosts

printf '%s\n' \
  '[Unit]' \
  'Description=VEZvision private production admin tunnel' \
  'After=network-online.target docker.service' \
  'Wants=network-online.target' \
  '' \
  '[Service]' \
  'Type=simple' \
  "ExecStart=/usr/bin/ssh -NT -i /etc/vezvision-production-tunnel/id_ed25519 -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/etc/vezvision-production-tunnel/known_hosts -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -L $coolify_gateway:$lab_admin_port:127.0.0.1:$remote_admin_port vezvision_tunnel@$production_ip" \
  'Restart=always' \
  'RestartSec=5s' \
  'NoNewPrivileges=true' \
  'PrivateTmp=true' \
  'ProtectSystem=strict' \
  'ProtectHome=true' \
  'ReadOnlyPaths=/etc/vezvision-production-tunnel' \
  '' \
  '[Install]' \
  'WantedBy=multi-user.target' \
  > /etc/systemd/system/vezvision-production-admin-tunnel.service

systemctl daemon-reload
systemctl enable vezvision-production-admin-tunnel.service
systemctl restart vezvision-production-admin-tunnel.service
REMOTE

ssh "$PRODUCTION_HOST" 'sudo head -n 1 /etc/vezvision-admin/api-key' | \
  ssh "$LAB_HOST" 'sudo sh -c '\''umask 077; head -n 1 > /etc/vezvision-production-tunnel/api-key'\'''

ssh "$LAB_HOST" sudo sh -s -- "$coolify_gateway" "$LAB_ADMIN_PORT" <<'REMOTE'
set -eu
gateway=$1
port=$2
api_key=$(head -n 1 /etc/vezvision-production-tunnel/api-key)

i=0
until curl -fsS -H "X-Internal-API-Key: $api_key" \
  "http://$gateway:$port/vv_site_settings?select=key&limit=1" >/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 20 ]; then
    systemctl --no-pager --full status vezvision-production-admin-tunnel.service >&2
    exit 1
  fi
  sleep 1
done

no_key_status=$(curl -sS -o /dev/null -w '%{http_code}' \
  "http://$gateway:$port/vv_site_settings?select=key&limit=1")
with_key_status=$(curl -sS -o /dev/null -w '%{http_code}' \
  -H "X-Internal-API-Key: $api_key" \
  "http://$gateway:$port/vv_site_settings?select=key&limit=1")
printf 'private tunnel: %s:%s no-key=%s with-key=%s\n' \
  "$gateway" "$port" "$no_key_status" "$with_key_status"
REMOTE
