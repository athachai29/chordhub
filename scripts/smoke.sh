#!/usr/bin/env bash
# Unauthenticated GET probes against a running ChordHub server.
# Prints one stable line per probe so two runs can be diffed:
#   <path> -> <status>[ loc=<redirect path+query>][ <key>=<value>...]
# Usage: scripts/smoke.sh [BASE_URL]   (default http://localhost:3000)
set -euo pipefail

BASE="${1:-http://localhost:3000}"
BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT

# Fetch without following redirects; sets STATUS and LOC (scheme/host stripped).
fetch() {
  local out
  out="$(curl -s -A 'Mozilla/5.0 (chordhub-smoke)' -o "$BODY" -w '%{http_code} %{redirect_url}' "$BASE$1")"
  STATUS="${out%% *}"
  LOC="${out#* }"
  LOC="$(printf '%s' "$LOC" | sed -E 's#^https?://[^/]+##')"
}

line() {
  local path="$1"
  shift
  local s="$path -> $STATUS"
  [ -n "$LOC" ] && s="$s loc=$LOC"
  for kv in "$@"; do s="$s $kv"; done
  printf '%s\n' "$s"
}

html_lang() { grep -oE '<html[^>]* lang="[^"]*"' "$BODY" | head -1 | sed -E 's/.*lang="([^"]*)"/\1/' || true; }
html_title() { grep -oE '<title>[^<]*</title>' "$BODY" | head -1 | sed -E 's#</?title>##g' || true; }
has_gtag() { grep -qE 'src="https://www\.googletagmanager\.com/gtag/js' "$BODY" && echo yes || echo no; }
json() { node -e "const b=require('fs').readFileSync('$BODY','utf8');let j;try{j=JSON.parse(b)}catch{process.stdout.write('');process.exit(0)}process.stdout.write(String(($1)(j)))"; }

fetch "/"; line "/"

for p in /th /en; do
  fetch "$p"; line "$p" "lang=$(html_lang)" "title=$(html_title)" "gtag=$(has_gtag)"
done

fetch "/th/login"; line "/th/login" "title=$(html_title)"
# next-auth's pages.signIn is the unprefixed /login; i18n must redirect it.
fetch "/login"; line "/login"
fetch "/login?error=CredentialsSignin"; line "/login?error=CredentialsSignin"
fetch "/th/profile"; line "/th/profile"
fetch "/th/results?search=test"; line "/th/results?search=test"

# The catalogue API is gone; take a song id from the first sitemap song URL.
fetch "/__sitemap__/th-TH.xml"
SONG_ID="$(grep -oE '<loc>[^<]*</loc>' "$BODY" | sed -E 's#</?loc>##g' | grep '/song/' | sed -nE 's#.*/song/([^/]+)$#\1#p' | head -1 || true)"

if [ -n "$SONG_ID" ]; then
  fetch "/th/song/$SONG_ID"; line "/th/song/<first>" "title=$(html_title)"
fi
fetch "/th/song/does-not-exist"; line "/th/song/does-not-exist"
fetch "/th/no-such-page"; line "/th/no-such-page"

fetch "/api/health"; line "/api/health"
fetch "/api/songs"; line "/api/songs"

fetch "/api/auth/providers"
line "/api/auth/providers" "ids=$(json 'j=>Object.keys(j).sort().join(",")')"
fetch "/api/auth/session"; line "/api/auth/session" "body=$(tr -d '\n' < "$BODY")"
fetch "/api/auth/csrf"; line "/api/auth/csrf"
fetch "/api/no-such-route"; line "/api/no-such-route"

locs() { grep -oE '<loc>[^<]*</loc>' "$BODY" | sed -E 's#</?loc>##g; s#^https?://[^/]+##' || true; }

fetch "/sitemap.xml"; line "/sitemap.xml"
# With i18n the sitemap is an index of per-locale child sitemaps.
fetch "/sitemap_index.xml"
CHILDREN="$(locs)"
line "/sitemap_index.xml" "children=$(printf '%s' "$CHILDREN" | paste -sd ',' -)"
for child in $CHILDREN; do
  fetch "$child"
  ALL="$(locs)"
  LOCS="$(printf '%s' "$ALL" | grep -c . || true)"
  EXCLUDED="$(printf '%s' "$ALL" | grep -cE '/(login|profile|editor|register)' || true)"
  line "$child" "locs=$LOCS" "excluded=$EXCLUDED"
done

fetch "/robots.txt"; line "/robots.txt" "body=$(paste -sd '|' "$BODY")"
