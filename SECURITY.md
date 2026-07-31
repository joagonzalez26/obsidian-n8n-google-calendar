# Seguridad

Este repositorio es educativo y no incluye el workflow exportado de n8n.

Antes de publicar una versión propia:

- No subas credenciales de Google, access tokens, refresh tokens, client secrets ni contraseñas.
- No subas la carpeta de datos de n8n (`.n8n/`).
- No subas tu vault real ni notas privadas.
- No publiques rutas personales si preferís mantenerlas privadas.
- Si exportás un workflow, abrilo como texto y revisá `credentials`, `/Users/`, `accessToken`, `refreshToken` y `clientSecret`.
- Usá siempre un archivo de ejemplo con información ficticia.

Si un secreto llegó a GitHub, borrarlo del último commit no alcanza: revocalo o rotalo inmediatamente y después eliminá el dato del historial del repositorio.
