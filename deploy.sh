#!/usr/bin/env bash
# ============================================================================
# AI DriveX — one-shot VPS deploy script
# Works on BOTH families:
#   • RHEL family  : AlmaLinux 9, Rocky, CentOS, RHEL  (dnf, firewalld, SELinux)
#   • Debian family: Ubuntu, Debian                    (apt, ufw)
# ----------------------------------------------------------------------------
# What it does, end to end:
#   1. Installs Docker + Compose plugin, Nginx, and Certbot (idempotent).
#   2. Builds the Next.js app image and runs it on 127.0.0.1:3000.
#   3. Opens the firewall, fixes SELinux, configures Nginx reverse proxy.
#   4. Issues a free Let's Encrypt SSL certificate and enables auto-renew.
#
# USAGE (run on the VPS, in the project folder):
#   sudo DOMAIN=aidrivex.agency EMAIL=you@example.com bash deploy.sh
#
# Re-running is safe — it updates the app and reloads Nginx.
# ============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-aidrivex.agency}"
EMAIL="${EMAIL:-}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "\033[1;32m✓ %s\033[0m\n" "$1"; }
info() { printf "\033[1;36m▶ %s\033[0m\n" "$1"; }
err()  { printf "\033[1;31m✗ %s\033[0m\n" "$1" >&2; }

if [ "$(id -u)" -ne 0 ]; then
  err "Run as root:  sudo DOMAIN=$DOMAIN EMAIL=you@example.com bash deploy.sh"
  exit 1
fi

# ---- Detect OS family ------------------------------------------------------
PKG=""          # apt | dnf
FW=""           # ufw | firewalld
NGINX_SITE=""   # where to drop our server block
if [ -f /etc/os-release ]; then . /etc/os-release; fi
case "${ID:-}${ID_LIKE:-}" in
  *rhel*|*fedora*|*centos*|*alma*|*rocky*)
    PKG="dnf"; FW="firewalld"; NGINX_SITE="/etc/nginx/conf.d/${DOMAIN}.conf" ;;
  *debian*|*ubuntu*)
    PKG="apt"; FW="ufw"; NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}" ;;
  *)
    # Fall back by which tool exists
    if command -v dnf >/dev/null 2>&1; then
      PKG="dnf"; FW="firewalld"; NGINX_SITE="/etc/nginx/conf.d/${DOMAIN}.conf"
    else
      PKG="apt"; FW="ufw"; NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
    fi ;;
esac

bold "==============================================="
bold "  AI DriveX — VPS Deploy"
bold "  Domain : ${DOMAIN}"
bold "  OS     : ${PRETTY_NAME:-unknown}  (pkg: ${PKG}, fw: ${FW})"
bold "==============================================="

# ---- 0) Require .env.production -------------------------------------------
if [ ! -f "${APP_DIR}/.env.production" ]; then
  err ".env.production not found."
  info "Create it first:"
  info "   cp .env.production.example .env.production && nano .env.production"
  exit 1
fi
ok ".env.production found"

# ---- 1) Prerequisites + Docker --------------------------------------------
if [ "$PKG" = "dnf" ]; then
  info "Installing prerequisites (dnf)…"
  dnf -y install dnf-plugins-core curl gettext >/dev/null
  if ! command -v docker >/dev/null 2>&1; then
    info "Installing Docker (RHEL repo)…"
    dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo >/dev/null 2>&1 \
      || dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
    dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
    ok "Docker installed"
  else ok "Docker already installed"; fi

  if ! command -v nginx >/dev/null 2>&1; then
    info "Installing Nginx…"; dnf -y install nginx; systemctl enable nginx; ok "Nginx installed"
  else ok "Nginx already installed"; fi

  if ! command -v certbot >/dev/null 2>&1; then
    info "Installing Certbot (via EPEL)…"
    dnf -y install epel-release >/dev/null 2>&1 || true
    dnf -y install certbot python3-certbot-nginx
    ok "Certbot installed"
  else ok "Certbot already installed"; fi
else
  info "Installing prerequisites (apt)…"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release ufw gettext-base
  if ! command -v docker >/dev/null 2>&1; then
    info "Installing Docker (Debian/Ubuntu repo)…"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/${ID}/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
    ok "Docker installed"
  else ok "Docker already installed"; fi
  command -v nginx  >/dev/null 2>&1 || { apt-get install -y nginx; ok "Nginx installed"; }
  command -v certbot >/dev/null 2>&1 || { apt-get install -y certbot python3-certbot-nginx; ok "Certbot installed"; }
fi

# ---- 2) Firewall -----------------------------------------------------------
info "Opening firewall for HTTP + HTTPS…"
if [ "$FW" = "firewalld" ]; then
  systemctl enable --now firewalld >/dev/null 2>&1 || true
  firewall-cmd --permanent --add-service=http  >/dev/null 2>&1 || true
  firewall-cmd --permanent --add-service=https >/dev/null 2>&1 || true
  firewall-cmd --permanent --add-service=ssh   >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
else
  ufw allow OpenSSH      >/dev/null 2>&1 || true
  ufw allow 'Nginx Full' >/dev/null 2>&1 || true
  yes | ufw enable       >/dev/null 2>&1 || true
fi
ok "Firewall ready"

# ---- 3) SELinux (RHEL only) — let Nginx talk to the app -------------------
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
  info "Configuring SELinux to allow Nginx → app proxy…"
  setsebool -P httpd_can_network_connect 1 || true
  ok "SELinux booleans set"
fi

# ---- 3.5) Docker DNS — many VPS hosts block Docker's default resolver, so
#           containers can't reach npm/Alpine mirrors during build. Pin public
#           DNS so `npm ci` and `apk add` work inside the build container.
info "Configuring Docker DNS (8.8.8.8 / 1.1.1.1)…"
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
JSON
systemctl restart docker
sleep 3
ok "Docker DNS configured"

# ---- 4) Build + run the app container -------------------------------------
info "Building app image (first build takes a few minutes)…"
cd "${APP_DIR}"
docker compose --env-file .env.production build
info "Starting container…"
docker compose --env-file .env.production up -d
ok "App container is up on 127.0.0.1:3000"

# ---- 5) Nginx site config --------------------------------------------------
info "Writing Nginx site for ${DOMAIN}…"
mkdir -p /var/www/certbot
export DOMAIN
envsubst '${DOMAIN}' < "${APP_DIR}/nginx/aidrivex.conf.template" > "${NGINX_SITE}"
# Debian uses sites-enabled symlinks; RHEL auto-includes conf.d.
if [ "$PKG" = "apt" ]; then
  ln -sf "${NGINX_SITE}" "/etc/nginx/sites-enabled/${DOMAIN}"
  rm -f /etc/nginx/sites-enabled/default
fi
nginx -t
systemctl restart nginx
ok "Nginx reverse proxy active (HTTP)"

# ---- 6) SSL certificate ----------------------------------------------------
if [ -z "${EMAIL}" ]; then
  CERTBOT_EMAIL_FLAG="--register-unsafely-without-email"
else
  CERTBOT_EMAIL_FLAG="-m ${EMAIL}"
fi
info "Requesting Let's Encrypt SSL certificate…"
# Try to include the app subdomain; if its DNS isn't ready yet, fall back to
# main + www so the primary site still gets HTTPS. Re-running later picks up
# the subdomain once its A record has propagated.
if certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" -d "app.${DOMAIN}" \
     --non-interactive --agree-tos ${CERTBOT_EMAIL_FLAG} --redirect --expand; then
  ok "SSL issued for ${DOMAIN}, www, and app.${DOMAIN}"
elif certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
     --non-interactive --agree-tos ${CERTBOT_EMAIL_FLAG} --redirect --expand; then
  ok "SSL issued for ${DOMAIN} + www (app.${DOMAIN} DNS not ready — re-run later)"
else
  err "Certbot failed. Most common cause: DNS A record for ${DOMAIN} is not"
  err "pointing to this server (66.29.143.196) yet, or hasn't propagated."
  err "Fix DNS at Namecheap (see VPS-DEPLOY.md), then re-run this script."
fi
systemctl list-timers 2>/dev/null | grep -q certbot && ok "Auto-renewal timer active" || true

bold "==============================================="
ok   "Deploy complete!"
bold "  Visit: https://${DOMAIN}"
bold "==============================================="
info "Useful commands:"
info "  docker compose logs -f app"
info "  docker compose --env-file .env.production up -d --build   # redeploy"
info "  systemctl reload nginx"
