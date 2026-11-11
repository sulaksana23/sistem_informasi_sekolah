#!/bin/bash
# Deploy helper untuk SERVER: pastikan Docker Engine + Compose plugin
# terpasang (install otomatis kalau belum ada), dan kalau ini deploy PERTAMA
# kali di server ini (.env belum ada — project Laravel-nya sendiri sudah ada
# lewat git pull, cuma kredensial/port yang belum diisi), tanya interaktif
# persis seperti scripts/new-project.sh (database, Redis, SSO, port, UID/GID)
# lalu tulis ke .env. Setelah itu jalankan ./docker.sh up.
#
# Alur di server:
#   git pull
#   ./deploy.sh
#
# Aman dijalankan berulang kali (idempotent):
#   - Docker sudah terpasang -> langkah install di-skip.
#   - .env sudah ada (deploy kedua dst setelah git pull update) -> wizard
#     kredensial di-skip total, langsung docker.sh up.
set -euo pipefail

cd "$(dirname "$0")"

# ---- Tampilan (warna, kalau terminal mendukung) ------------------------------
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ] && command -v tput >/dev/null 2>&1 && [ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]; then
  C_BOLD="$(tput bold)"; C_DIM="$(tput dim)"; C_RESET="$(tput sgr0)"
  C_CYAN="$(tput setaf 6)"; C_GREEN="$(tput setaf 2)"; C_YELLOW="$(tput setaf 3)"
else
  C_BOLD=""; C_DIM=""; C_RESET=""; C_CYAN=""; C_GREEN=""; C_YELLOW=""
fi
action() { echo "${C_CYAN}==>${C_RESET} $1"; }
info() { echo "${C_DIM}  $1${C_RESET}"; }
success() { echo "${C_GREEN}✓${C_RESET} $1"; }
warn() { echo "${C_YELLOW}⚠${C_RESET}  $1" >&2; }

NON_INTERACTIVE="false"
[ "${1:-}" = "--non-interactive" ] && NON_INTERACTIVE="true"

# ==== 1. Docker Engine + Compose plugin =======================================
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "Error: perlu root/sudo untuk install Docker, tapi 'sudo' tidak ditemukan." >&2
    echo "Jalankan ulang script ini sebagai root, atau install Docker manual dulu:" >&2
    echo "  https://docs.docker.com/engine/install/" >&2
    exit 1
  fi
fi

if ! command -v docker >/dev/null 2>&1; then
  action "Docker belum terpasang, menginstall lewat get.docker.com ..."
  if ! command -v curl >/dev/null 2>&1; then
    $SUDO apt-get update -qq && $SUDO apt-get install -y curl
  fi
  curl -fsSL https://get.docker.com | $SUDO sh
  $SUDO systemctl enable --now docker 2>/dev/null || true

  DEPLOY_USER="${SUDO_USER:-$(id -un)}"
  if [ "$DEPLOY_USER" != "root" ]; then
    $SUDO usermod -aG docker "$DEPLOY_USER" || true
    success "$DEPLOY_USER ditambahkan ke group 'docker'."
    info "Logout/login ulang (atau 'newgrp docker') dulu sebelum menjalankan script ini lagi, supaya tidak perlu sudo tiap kali menjalankan docker."
  fi
else
  success "Docker sudah terpasang, skip instalasi."
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: Docker terpasang tapi plugin 'docker compose' (v2) tidak ditemukan." >&2
  echo "Install plugin: https://docs.docker.com/compose/install/linux/" >&2
  exit 1
fi

# ==== 2. Wizard kredensial — HANYA kalau .env belum ada (first deploy) ========
if [ ! -f .env ]; then
  echo ""
  echo "${C_CYAN}================================================================${C_RESET}"
  echo "${C_BOLD}${C_CYAN}  Deploy pertama di server ini — .env belum ada${C_RESET}"
  echo "${C_CYAN}================================================================${C_RESET}"
  info "Project Laravel-nya sudah ada (dari git pull) — cuma kredensial & port Docker"
  info "yang perlu diisi sekali di sini, sama seperti scripts/new-project.sh."

  if [ -f .env.example ]; then
    cp .env.example .env
    info ".env dibuat dari .env.example."
  else
    : > .env
    info ".env.example tidak ada — mulai dari .env kosong."
  fi
  ENV_OUT=".env"

  # ---- helper generik (gaya sama seperti scripts/new-project.sh) ------------
  strip_ctrl() {
    printf '%s' "$1" | sed -E 's/\x1b\[[0-9;]*[a-zA-Z~]//g; s/\x1bO[a-zA-Z]//g' | tr -d '[:cntrl:]'
  }

  prompt() {
    local var_name="$1" question="$2" default="$3"
    if [ "$NON_INTERACTIVE" = "true" ]; then
      eval "$var_name=\"\${$var_name:-$default}\""
      return
    fi
    local answer
    read -r -p "  ${C_BOLD}${question}${C_RESET} [${C_DIM}${default}${C_RESET}]: " answer
    answer="$(strip_ctrl "$answer")"
    eval "$var_name=\"\${answer:-$default}\""
  }

  gen_password() {
    if command -v openssl >/dev/null 2>&1; then
      openssl rand -hex 12
    else
      LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom 2>/dev/null | head -c 24
    fi
  }

  prompt_secret() {
    local var_name="$1" question="$2" answer
    if [ "$NON_INTERACTIVE" = "true" ]; then
      eval "$var_name=\"\${$var_name:-\$(gen_password)}\""
      return
    fi
    read -r -s -p "  ${C_BOLD}${question}${C_RESET} [kosongkan untuk digenerate random]: " answer
    echo
    answer="$(strip_ctrl "$answer")"
    if [ -z "$answer" ]; then
      answer="$(gen_password)"
      info "digenerate random: $answer"
    fi
    eval "$var_name=\"\$answer\""
  }

  choose2() {
    local question="$1" default_idx="$2" label1="$3" label2="$4" ans d1="" d2=""
    if [ "$NON_INTERACTIVE" = "true" ]; then echo "$default_idx"; return; fi
    echo "  ${C_BOLD}${question}${C_RESET}" >&2
    [ "$default_idx" = "1" ] && d1=" ${C_DIM}(default)${C_RESET}"
    [ "$default_idx" = "2" ] && d2=" ${C_DIM}(default)${C_RESET}"
    echo "    ${C_CYAN}1)${C_RESET} ${label1}${d1}" >&2
    echo "    ${C_CYAN}2)${C_RESET} ${label2}${d2}" >&2
    read -r -p "  Pilihan [${default_idx}]: " ans
    [ "$ans" != "1" ] && [ "$ans" != "2" ] && ans="$default_idx"
    echo "$ans"
  }

  ask_yn() {
    local var_name="$1" question="$2" default="$3" label_true="${4:-Ya}" label_false="${5:-Tidak}" default_idx ans
    default_idx=2
    [ "$default" = "y" ] && default_idx=1
    ans="$(choose2 "$question" "$default_idx" "$label_true" "$label_false")"
    if [ "$ans" = "1" ]; then eval "$var_name=true"; else eval "$var_name=false"; fi
  }

  checklist() {
    # Sama seperti checklist() di scripts/new-project.sh — pisah spasi, kosong
    # kalau tidak TTY (fallback ke input nomor dipisah koma) atau non-interactive.
    local result_var="$1" question="$2"; shift 2
    local -a opts=("$@")
    local n=${#opts[@]} i
    if [ "$NON_INTERACTIVE" = "true" ] || [ ! -t 0 ]; then
      echo "  ${C_BOLD}${question}${C_RESET}" >&2
      for ((i = 0; i < n; i++)); do echo "    ${C_CYAN}$((i + 1)))${C_RESET} ${opts[i]}" >&2; done
      if [ "$NON_INTERACTIVE" = "true" ]; then eval "$result_var=\"\""; return; fi
      local ans sel="" num
      read -r -p "  Pilih nomor (pisah koma, mis. 2,3; kosongkan = tidak pilih apa-apa): " ans
      local -a nums; IFS=',' read -ra nums <<< "$ans"
      for num in "${nums[@]}"; do num="$(echo "$num" | tr -d '[:space:]')"; [ -n "$num" ] && sel="${sel}${num} "; done
      eval "$result_var=\"\$sel\""
      return
    fi
    local -a checked=(); for ((i = 0; i < n; i++)); do checked[i]=0; done
    local cursor=0 key rest drawn=0
    draw_checklist() {
      if [ "$drawn" = "1" ]; then tput cuu $((n + 2)) 2>/dev/null; tput ed 2>/dev/null; fi
      echo "  ${C_BOLD}${question}${C_RESET}"
      echo "  ${C_DIM}(panah atas/bawah pindah, spasi centang, enter konfirmasi)${C_RESET}"
      local j box marker
      for ((j = 0; j < n; j++)); do
        box="[ ]"; [ "${checked[j]}" = "1" ] && box="[${C_GREEN}x${C_RESET}]"
        marker="  "; [ "$j" = "$cursor" ] && marker="${C_CYAN}>${C_RESET} "
        echo "  ${marker}${box} $((j + 1))) ${opts[j]}"
      done
      drawn=1
    }
    draw_checklist
    while true; do
      IFS= read -rsn1 key
      if [ "$key" = "$(printf '\033')" ]; then IFS= read -rsn2 -t 0.05 rest; key="${key}${rest}"; fi
      case "$key" in
        $'\033[A'|k) cursor=$(( (cursor - 1 + n) % n )) ;;
        $'\033[B'|j) cursor=$(( (cursor + 1) % n )) ;;
        ' ') if [ "${checked[cursor]}" = "1" ]; then checked[cursor]=0; else checked[cursor]=1; fi ;;
        '') break ;;
      esac
      draw_checklist
    done
    unset -f draw_checklist
    local sel=""
    for ((i = 0; i < n; i++)); do [ "${checked[i]}" = "1" ] && sel="${sel}$((i + 1)) "; done
    eval "$result_var=\"\$sel\""
  }

  set_env() {
    local key="$1" value="$2"
    if grep -q "^${key}=" "$ENV_OUT"; then
      local esc_value
      esc_value=$(printf '%s' "$value" | sed -e 's/[&|]/\\&/g')
      sed -i.bak "s|^${key}=.*|${key}=${esc_value}|" "$ENV_OUT"
      rm -f "${ENV_OUT}.bak"
    else
      echo "${key}=${value}" >> "$ENV_OUT"
    fi
  }

  port_listening() {
    local p="$1"
    if command -v ss >/dev/null 2>&1; then
      ss -tulpn 2>/dev/null | awk '{print $5}' | grep -q ":${p}\$"
    elif command -v netstat >/dev/null 2>&1; then
      netstat -an 2>/dev/null | grep -i listen | grep -qE "[.:]${p}([^0-9]|\$)"
    else
      (exec 3<>"/dev/tcp/127.0.0.1/$p") 2>/dev/null && { exec 3>&- 3<&-; return 0; }
      return 1
    fi
  }
  used_ports=" "
  port_busy() { local p="$1"; [ "${used_ports#* "$p" }" != "$used_ports" ] || port_listening "$p"; }
  next_free_port() {
    local base="$1"
    local p="$base"
    while [ -n "$p" ] && port_busy "$p"; do p=$((p + 1)); done
    used_ports="${used_ports}${p} "
    echo "$p"
  }
  prompt_port() {
    local var_name="$1" question="$2" default="$3" val ans
    if [ "$NON_INTERACTIVE" = "true" ]; then
      val="$default"
    else
      while true; do
        read -r -p "  ${C_BOLD}${question}${C_RESET} [${C_DIM}${default}${C_RESET}]: " ans
        val="${ans:-$default}"
        if port_busy "$val"; then
          warn "Port $val kelihatannya sudah dipakai (sedang listening di OS)."
          ans="$(choose2 "Tetap pakai port $val?" 2 "Ya" "Tidak, ganti port lain")"
          [ "$ans" = "1" ] && break
          continue
        fi
        break
      done
    fi
    used_ports="${used_ports}${val} "
    eval "$var_name=\"\$val\""
  }

  # ---- pertanyaan --------------------------------------------------------
  DEFAULT_NAME="$(basename "$(pwd)")"
  prompt SUFFIX_APP_NAME "Nama project (prefix container, unik di server ini)" "$DEFAULT_NAME"

  ask_yn WANT_NODE "Project ini pakai Node/Vite (Inertia, atau build asset JS lewat container node)?" "n" "Ya" "Tidak"

  checklist DB_SEL "Database (spasi centang, bisa lebih dari satu; kosongkan semua = tidak pakai)" \
    "Mariadb Extension PHP" "Mariadb Container" "Postgres Extension PHP" "Postgres Container" \
    "Oracle Extension PHP" "SQL Server Extension PHP"
  want_mariadb_ext="false"; want_mariadb_container="false"
  want_postgres_ext="false"; want_postgres_container="false"
  want_oracle="false"; want_sqlsrv="false"
  for n in $DB_SEL; do
    case "$n" in
      1) want_mariadb_ext="true" ;;
      2) want_mariadb_container="true" ;;
      3) want_postgres_ext="true" ;;
      4) want_postgres_container="true" ;;
      5) want_oracle="true" ;;
      6) want_sqlsrv="true" ;;
    esac
  done
  DB_CHOICE=""
  if [ "$want_mariadb_container" = "true" ]; then
    DB_CHOICE="${DB_CHOICE:+$DB_CHOICE,}mariadb-container"
  elif [ "$want_mariadb_ext" = "true" ]; then
    DB_CHOICE="${DB_CHOICE:+$DB_CHOICE,}mariadb"
  fi
  if [ "$want_postgres_container" = "true" ]; then
    DB_CHOICE="${DB_CHOICE:+$DB_CHOICE,}postgres-container"
  elif [ "$want_postgres_ext" = "true" ]; then
    DB_CHOICE="${DB_CHOICE:+$DB_CHOICE,}postgres"
  fi
  [ "$want_oracle" = "true" ] && DB_CHOICE="${DB_CHOICE:+$DB_CHOICE,}oracle"
  [ "$want_sqlsrv" = "true" ] && DB_CHOICE="${DB_CHOICE:+$DB_CHOICE,}sqlsrv"
  [ -z "$DB_CHOICE" ] && DB_CHOICE="none"

  ask_yn WANT_REDIS "Butuh Redis?" "n" "Ya" "Tidak"
  ask_yn WANT_PYTHON "Butuh container Python engine?" "n" "Ya" "Tidak"
  ask_yn WANT_SSO "Integrasi SSO (itmm/sso)?" "n" "Ya" "Tidak"

  # ---- port ----------------------------------------------------------------
  echo ""
  ask_yn WANT_CUSTOM_PORTS "Cara alokasi port host" "n" "Custom, isi manual satu-satu" "Otomatis (disarankan)"

  NODE_PORT=""; MARIADB_PORT=""; POSTGRES_PORT=""; REDISD_PORT=""; PYTHON_PORT=""
  if [ "$WANT_CUSTOM_PORTS" = "true" ]; then
    prompt_port APP_PORT "Port APP (nginx)" "8080"
  else
    APP_PORT=$(next_free_port 8081)
  fi
  PROFILES=()
  if [ "$WANT_NODE" = "true" ]; then
    PROFILES+=("node")
    if [ "$WANT_CUSTOM_PORTS" = "true" ]; then prompt_port NODE_PORT "Port NODE (vite dev server)" "5173"; else NODE_PORT=$(next_free_port 5174); fi
  fi
  if echo "$DB_CHOICE" | grep -qw mariadb-container; then
    PROFILES+=("mariadb")
    if [ "$WANT_CUSTOM_PORTS" = "true" ]; then prompt_port MARIADB_PORT "Port MARIADB" "3306"; else MARIADB_PORT=$(next_free_port 3307); fi
  fi
  if echo "$DB_CHOICE" | grep -qw postgres-container; then
    PROFILES+=("postgres")
    if [ "$WANT_CUSTOM_PORTS" = "true" ]; then prompt_port POSTGRES_PORT "Port POSTGRES" "5432"; else POSTGRES_PORT=$(next_free_port 5433); fi
  fi
  if [ "$WANT_REDIS" = "true" ]; then
    PROFILES+=("redis")
    if [ "$WANT_CUSTOM_PORTS" = "true" ]; then prompt_port REDISD_PORT "Port REDIS" "6379"; else REDISD_PORT=$(next_free_port 6380); fi
  fi
  if [ "$WANT_PYTHON" = "true" ]; then
    PROFILES+=("python")
    if [ "$WANT_CUSTOM_PORTS" = "true" ]; then prompt_port PYTHON_PORT "Port PYTHON" "8000"; else PYTHON_PORT=$(next_free_port 8001); fi
  fi
  IFS=,; PROFILES_STR="${PROFILES[*]}"; unset IFS
  info "Port yang dipakai: app=$APP_PORT${NODE_PORT:+ node=$NODE_PORT}${MARIADB_PORT:+ mariadb=$MARIADB_PORT}${POSTGRES_PORT:+ postgres=$POSTGRES_PORT}${REDISD_PORT:+ redis=$REDISD_PORT}${PYTHON_PORT:+ python=$PYTHON_PORT}"

  # ---- kredensial database ---------------------------------------------------
  DB_CONNECTION_VAL=""; DB_HOST_VAL=""; DB_PORT_VAL=""
  if [ "$DB_CHOICE" != "none" ]; then
    echo ""
    if echo "$DB_CHOICE" | grep -qwE 'mariadb|postgres'; then
      action "Kredensial database ($DB_CHOICE)"
      DEFAULT_DB_NAME="$(echo "$SUFFIX_APP_NAME" | tr '[:upper:]' '[:lower:]' | tr '-' '_')"
      prompt DB_NAME "Nama database" "$DEFAULT_DB_NAME"
      prompt DB_USER "Username database" "laravel"
      prompt_secret DB_PASSWORD "Password database"
    fi
    if echo "$DB_CHOICE" | grep -qw mariadb-container; then
      DB_CONNECTION_VAL="mysql"; DB_HOST_VAL="mariadb"; DB_PORT_VAL="3306"
    elif echo "$DB_CHOICE" | grep -qw mariadb; then
      DB_CONNECTION_VAL="mysql"
      prompt DB_HOST "Host database MariaDB (server eksternal, ext saja)" ""
      prompt DB_PORT "Port database MariaDB" "3306"
      DB_HOST_VAL="$DB_HOST"; DB_PORT_VAL="$DB_PORT"
    elif echo "$DB_CHOICE" | grep -qw postgres-container; then
      DB_CONNECTION_VAL="pgsql"; DB_HOST_VAL="postgres"; DB_PORT_VAL="5432"
    elif echo "$DB_CHOICE" | grep -qw postgres; then
      DB_CONNECTION_VAL="pgsql"
      prompt DB_HOST "Host database PostgreSQL (server eksternal, ext saja)" ""
      prompt DB_PORT "Port database PostgreSQL" "5432"
      DB_HOST_VAL="$DB_HOST"; DB_PORT_VAL="$DB_PORT"
    fi
    if echo "$DB_CHOICE" | grep -qw oracle; then
      echo ""; action "Kredensial Oracle (koneksi terpisah \"oracle\" — bukan DB_CONNECTION utama)"
      prompt ORACLE_HOST "Host database Oracle (server eksternal)" ""
      prompt ORACLE_PORT "Port database Oracle" "1521"
      prompt ORACLE_DATABASE "Service name / SID Oracle (mis. ORCL)" ""
      prompt ORACLE_USER "Username Oracle" ""
      prompt_secret ORACLE_PASSWORD "Password Oracle"
      DEFAULT_ORACLE_TNS="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ORACLE_HOST})(PORT=${ORACLE_PORT}))(CONNECT_DATA=(SERVICE_NAME=${ORACLE_DATABASE})))"
      prompt ORACLE_TNS "TNS Oracle (kosongkan untuk auto dari host/port/service name)" "$DEFAULT_ORACLE_TNS"
    fi
    if echo "$DB_CHOICE" | grep -qw sqlsrv; then
      echo ""; action "Kredensial SQL Server (koneksi terpisah \"sqlsrv\" — bukan DB_CONNECTION utama)"
      prompt SQLSRV_HOST "Host database SQL Server (server eksternal)" ""
      prompt SQLSRV_PORT "Port database SQL Server" "1433"
      prompt SQLSRV_DATABASE "Nama database SQL Server" ""
      prompt SQLSRV_USER "Username SQL Server" ""
      prompt_secret SQLSRV_PASSWORD "Password SQL Server"
    fi
  fi

  if [ "$WANT_REDIS" = "true" ]; then
    echo ""; action "Kredensial Redis"
    prompt_secret REDIS_PASSWORD "Password Redis"
  fi

  if [ "$WANT_SSO" = "true" ]; then
    echo ""; action "Kredensial SSO (itmm/sso)"
    prompt SSO_URL "SSO_URL (base URL provider SSO)" ""
    prompt SSO_API_URL "SSO_API_URL" ""
    prompt SSO_CLIENT_ID "SSO_CLIENT_ID" ""
    prompt_secret SSO_CLIENT_SECRET "SSO_CLIENT_SECRET"
    prompt APP_ID "APP_ID" "$SUFFIX_APP_NAME"
    prompt APP_CALLBACK_URL "APP_CALLBACK_URL" "http://localhost:${APP_PORT}/callback"
    prompt APP_LOGIN_URL "APP_LOGIN_URL" "http://localhost:${APP_PORT}/login"
  fi

  # ---- UID/GID/GRP ------------------------------------------------------------
  echo ""
  action "User & group container"
  info "Ini SERVER — kalau dipakai bareng beberapa developer, JANGAN pakai UID/GID"
  info "milik 1 akun. Jalankan scripts/server/provision-project-group.sh di repo"
  info "setup-project (bukan di sini) dan isi GID/GRP dengan shared group hasilnya."
  DETECTED_UID="$(id -u)"; DETECTED_GID="$(id -g)"
  prompt HOST_UID "UID" "1000"
  prompt HOST_USR "Nama user (USR)" "appuser"
  prompt HOST_GID "GID (isi dari shared group provision-project-group.sh kalau multi-dev, kalau tidak: $DETECTED_GID)" "$DETECTED_GID"
  prompt HOST_GRP "Nama group (GRP)" "appuser"

  # ---- tulis ke .env ----------------------------------------------------------
  echo ""
  action "Menulis .env"
  set_env "SUFFIX_APP_NAME" "$SUFFIX_APP_NAME"
  set_env "COMPOSE_PROFILES" "$PROFILES_STR"
  set_env "UID" "$HOST_UID"
  set_env "USR" "$HOST_USR"
  set_env "GID" "$HOST_GID"
  set_env "GRP" "$HOST_GRP"
  set_env "APP_PORT" "$APP_PORT"
  [ -n "$NODE_PORT" ] && { set_env "NODE_PORT" "$NODE_PORT"; set_env "VITE_HOST" "localhost"; set_env "VITE_PORT" "$NODE_PORT"; }
  [ -n "$MARIADB_PORT" ] && set_env "MARIADB_PORT" "$MARIADB_PORT"
  [ -n "$POSTGRES_PORT" ] && set_env "POSTGRES_PORT" "$POSTGRES_PORT"
  [ -n "$REDISD_PORT" ] && set_env "REDISD_PORT" "$REDISD_PORT"
  [ -n "$PYTHON_PORT" ] && set_env "PYTHON_PORT" "$PYTHON_PORT"
  echo "$DB_CHOICE" | grep -qw mariadb && set_env "INSTALL_EXT_MYSQL" "true"
  echo "$DB_CHOICE" | grep -qw postgres && set_env "INSTALL_EXT_PGSQL" "true"
  [ "$WANT_REDIS" = "true" ] && set_env "INSTALL_EXT_REDIS" "true"
  echo "$DB_CHOICE" | grep -qw oracle && set_env "INSTALL_EXT_ORACL" "true"
  echo "$DB_CHOICE" | grep -qw sqlsrv && set_env "INSTALL_EXT_SQLSRV" "true"
  if [ -n "$DB_CONNECTION_VAL" ]; then
    set_env "DB_CONNECTION" "$DB_CONNECTION_VAL"
    set_env "DB_HOST" "$DB_HOST_VAL"
    set_env "DB_PORT" "$DB_PORT_VAL"
    set_env "DB_DATABASE" "$DB_NAME"
    set_env "DB_USERNAME" "$DB_USER"
    set_env "DB_PASSWORD" "$DB_PASSWORD"
  fi
  if echo "$DB_CHOICE" | grep -qw oracle; then
    set_env "DB_ORACL_TNS" "$ORACLE_TNS"
    set_env "DB_ORACL_HOST" "$ORACLE_HOST"
    set_env "DB_ORACL_PORT" "$ORACLE_PORT"
    set_env "DB_ORACL_DATABASE" "$ORACLE_DATABASE"
    set_env "DB_ORACL_USERNAME" "$ORACLE_USER"
    set_env "DB_ORACL_PASSWORD" "$ORACLE_PASSWORD"
  fi
  if echo "$DB_CHOICE" | grep -qw sqlsrv; then
    set_env "DB_SQLSRV_HOST" "$SQLSRV_HOST"
    set_env "DB_SQLSRV_PORT" "$SQLSRV_PORT"
    set_env "DB_SQLSRV_DATABASE" "$SQLSRV_DATABASE"
    set_env "DB_SQLSRV_USERNAME" "$SQLSRV_USER"
    set_env "DB_SQLSRV_PASSWORD" "$SQLSRV_PASSWORD"
  fi
  if [ "$WANT_REDIS" = "true" ]; then
    set_env "REDIS_HOST" "redis"
    set_env "REDIS_PORT" "6379"
    set_env "REDIS_PASSWORD" "$REDIS_PASSWORD"
  fi
  if [ "$WANT_SSO" = "true" ]; then
    set_env "SSO_URL" "$SSO_URL"
    set_env "SSO_API_URL" "$SSO_API_URL"
    set_env "SSO_CLIENT_ID" "$SSO_CLIENT_ID"
    set_env "SSO_CLIENT_SECRET" "$SSO_CLIENT_SECRET"
    set_env "APP_ID" "$APP_ID"
    set_env "APP_CALLBACK_URL" "$APP_CALLBACK_URL"
    set_env "APP_LOGIN_URL" "$APP_LOGIN_URL"
    set_env "APP_ROUTE_HOME_NAME" "home"
  fi
  success ".env sudah ditulis."
fi

# ==== 3. docker.sh up + generate APP_KEY kalau masih kosong ==================
action "Menjalankan docker.sh up"
./docker.sh up

APP_KEY_VAL="$(grep '^APP_KEY=' .env 2>/dev/null | tail -n1 | cut -d= -f2-)"
if [ -z "$APP_KEY_VAL" ]; then
  action "APP_KEY kosong, generate lewat artisan"
  ./docker.sh artisan key:generate --force
fi
