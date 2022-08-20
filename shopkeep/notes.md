# Directus Install

Installed on DigitalOcean droplet, using one-click install. Domain pointed and HTTPS setup.

## Caddy

Caddyfile (`/etc/caddy/Caddyfile`) needed changing to allow CORS:

```
#
# Caddyfile for HTTPS
#

(cors) {
  @origin{args.0} header Origin {args.0}
  header @origin{args.0} Access-Control-Allow-Origin "{args.0}"
  header @origin{args.0} Vary Origin
}

{
  email james@geeksareforlife.com
  admin off
}

#
# Directus
#

directus.geeksareforlife.com {
  header Access-Control-Allow-Credentials "true"
  header Access-Control-Allow-Methods "OPTIONS,HEAD,GET,POST,PUT,PATCH,DELETE" 
  header Access-Control-Allow-Headers "X-PINGOTHER, Content-Type, Authorization"
  import cors https://geeksareforlife.github.io
  import cors null
  reverse_proxy localhost:8055
}
```

Once developed, remove the `import cors null` and `import cors http://0.0.0.0:8000` lines.

## Directus

Directus project: `/var/directus`
Restart command: `npx directus pm2 restart directus --update-env` (seems to only work when run in root home dir?)

Updated Directus .ENV to make cookies work:

```
####################################################################################################
## General

PORT=8055
PUBLIC_URL="/"

####################################################################################################
## Database

DB_CLIENT="pg"
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_DATABASE="directus"
DB_USER="directus"
DB_PASSWORD="yA0lZayTCKG29wad"
DB_SSL="false"

####################################################################################################
## Rate Limiting

RATE_LIMITER_ENABLED=false
RATE_LIMITER_STORE=memory
RATE_LIMITER_POINTS=25
RATE_LIMITER_DURATION=1

####################################################################################################
## Cache

CACHE_ENABLED=false

####################################################################################################
## File Storage

STORAGE_LOCATIONS="local"
STORAGE_LOCAL_PUBLIC_URL="/uploads"
STORAGE_LOCAL_DRIVER="local"
STORAGE_LOCAL_ROOT="./uploads"

####################################################################################################
## Security

KEY="61edcd19-2ce0-45f4-8436-416fac8570ef"
SECRET="572d2e77-6518-4d03-b4d7-f22a80dba358"

ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="7d"
REFRESH_TOKEN_COOKIE_SECURE=true
REFRESH_TOKEN_COOKIE_SAME_SITE="none"

####################################################################################################
## SSO (OAuth) Providers

OAUTH_PROVIDERS=""

####################################################################################################
## Extensions

EXTENSIONS_PATH="./extensions"

####################################################################################################
## Email

EMAIL_FROM="no-reply@example.com"
EMAIL_TRANSPORT="sendmail"
EMAIL_SENDMAIL_NEW_LINE="unix"
EMAIL_SENDMAIL_PATH="/usr/sbin/sendmail"
```
