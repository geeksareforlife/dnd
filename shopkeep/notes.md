# Directus

Installed on DigitalOcean droplet, using one-click install. Domain pointed and HTTPS setup.

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
