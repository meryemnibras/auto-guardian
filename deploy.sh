#!/usr/bin/env bash
# ============================================================================
# AI DriveX — one-shot VPS deploy script (Ubuntu / Debian)
# ----------------------------------------------------------------------------
# What it does, end to end:
#   1. Installs Docker + Compose plugin, Nginx, and Certbot (idempotent).
#   2. Builds the Next.js app image and runs it on 127.0.0.1:3000.
#   3. Configures Nginx as an HTTPS reverse proxy for your domain.
#   4. Issues a free Let's Encrypt SSL certificate and enables auto-renew.
#
# USAGE (run on the VPS, in the project folder):
#   sudo DOMAIN=aidrivex.agency EMAIL=you@example.com bash deploy.sh
#
# Re-running is safe — it updates the app and reloads Nginx.
# ============================================================================
set -euo pipefail

# ---- Config ----------------------------------------------------------------
DOMAIN="${DOMAIN:-aidrivex.agency}"
EMAIL="${EMAIL:-}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_AVAILABLE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "\033[1;32m✓ %s\033[0m\n" "$1"; }
info() { printf "\033[1;36m▶ %s\033[0m\n" "$1"; }
err()  { printf "\033[1;31m✗ %s\033[0m\n" "$1" >&2; }

if [ "$(id -u)" -ne 0 ]; then
  err "Run as root:  sudo DOMAIN=$DOMAIN EMAIL=you@example.com bash deploy.sh"
  exit 1
fi

bold "==============================================="
bold "  AI DriveX — VPS Deploy"
bold "  Domain: ${DOMAIN}"
bold "==============================================="

# ---- 0) Require .env.production -------------------------------------------
if [ ! -f "${APP_DIR}/.env.production" ]; then
  err ".env.production not found."
  info "Create it first:"
  info "   cp .env.production.example .env.production && nano .env.production"
  exit 1
fi
ok ".env.production found"

# ---- 1) System packages ----------------------------------------------------
info "Updating apt + installing prerequisites…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw

# ---- 2) Docker -------------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  info "Installing Docker Engine…"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null \
    || curl -fsSL https://download.docker.com/linux/debian/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  ok "Docker installed"
else
  ok "Docker already installed"
fi

# ---- 3) Nginx + Certbot ----------------------------------------------------
if ! command -v nginx >/dev/null 2>&1; then
  info "Installing Nginx…"
  apt-get install -y nginx
  ok "Nginx installed"
else
  ok "Nginx already installed"
fi
if ! command -v certbot >/dev/null 2>&1; then
  info "Installing Certbot…"
  apt-get install -y certbot python3-certbot-nginx
  ok "Certbot installed"
else
  ok "Certbot already installed"
fi

# ---- 4) Firewall -----------------------------------------------------------
info "Configuring firewall (allow SSH + HTTP + HTTPS)…"
ufw allow OpenSSH    >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable     >/dev/null 2>&1 || true
ok "Firewall ready"

# ---- 5) Build + run the app container -------------------------------------
info "Building app image (first build takes a few minutes)…"
cd "${APP_DIR}"
docker compose --env-file .env.production build
info "Starting container…"
docker compose --env-file .env.production up -d
ok "App container is up on 127.0.0.1:3000"

# ---- 6) Nginx site config --------------------------------------------------
info "Writing Nginx site for ${DOMAIN}…"
mkdir -p /var/www/certbot
export DOMAIN
envsubst '${DOMAIN}' < "${APP_DIR}/nginx/aidrivex.conf.template" > "${NGINX_AVAILABLE}"
ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
# Drop the default site so it doesn't shadow ours.
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
ok "Nginx reverse proxy active (HTTP)"

# ---- 7) SSL certificate ----------------------------------------------------
if [ -z "${EMAIL}" ]; then
  info "No EMAIL set — issuing cert without email (skips expiry notices)."
  CERTBOT_EMAIL_FLAG="--register-unsafely-without-email"
else
  CERTBOT_EMAIL_FLAG="-m ${EMAIL}"
fi

info "Requesting Let's Encrypt SSL certificate…"
if certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
     --non-interactive --agree-tos ${CERTBOT_EMAIL_FLAG} --redirect; then
  ok "SSL issued — site now serves HTTPS with auto-redirect"
else
  err "Certbot failed. Most common cause: DNS A record for ${DOMAIN} is not"
  err "pointing to this server yet, or hasn't propagated."
  err "Fix the DNS (see VPS-DEPLOY.md), then re-run this script."
fi

# Certbot installs a systemd timer for renewal automatically; verify it.
systemctl list-timers 2>/dev/null | grep -q certbot && ok "Auto-renewal timer active" || true

bold "==============================================="
ok   "Deploy complete!"
bold "  Visit: https://${DOMAIN}"
bold "==============================================="
info "Useful commands:"
info "  docker compose logs -f app      # view app logs"
info "  docker compose --env-file .env.production up -d --build   # redeploy"
info "  systemctl reload nginx          # reload proxy"
