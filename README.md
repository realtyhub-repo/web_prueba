# Auth App (HTML/CSS/JS puro)

Login real (no probador de endpoints): login normal, login con Google, registro,
verificación de correo, recuperación/restablecimiento de contraseña, refresh
automático y logout.

## Cómo correrlo

Ábrelo con un servidor estático, **no** con doble click (file://), porque las
cookies y CORS no funcionan bien con `file://`. Lo más fácil:

- Con la extensión **Live Server** de VS Code (por defecto corre en
  `http://localhost:5500`, que es justo la URL que mencionaste).
- O con Python: `python -m http.server 5500` dentro de la carpeta.

## Antes de usarlo

1. **Google login**: abre `js/config.js` y reemplaza `GOOGLE_CLIENT_ID` por tu
   Client ID real de Google (console.cloud.google.com → Credenciales → OAuth
   Client ID → tipo "Web application", con `http://localhost:5500` como
   origen autorizado).

2. **CORS en el backend**: como el front y el backend están en orígenes
   distintos (5500 vs 8081) y usamos cookies httpOnly para el refresh, el
   backend debe permitir:
   - `Access-Control-Allow-Origin: http://localhost:5500` (no puede ser `*`
     cuando se usan credenciales)
   - `Access-Control-Allow-Credentials: true`
   - Que la cookie del refresh token tenga `SameSite=Lax` o `None` (si es
     `None`, necesita `Secure`, lo cual pide HTTPS incluso en local).

## Páginas

| Archivo | Qué hace |
|---|---|
| `index.html` | Login normal + botón de Google |
| `register.html` | Registro |
| `verify-email.html` | Se abre desde el link del correo (`?token=...`) y confirma la cuenta |
| `forgot-password.html` | Pide el correo para enviar el link de recuperación |
| `reset-password.html` | Se abre desde el link del correo (`?token=...`), pide nueva contraseña + confirmación |
| `dashboard.html` | Página protegida de ejemplo, con botón de "Cerrar sesión" |

## Notas técnicas

- El **access token** se guarda en `sessionStorage` (solo dura la pestaña).
- El **refresh token** nunca lo toca JS: vive en la cookie httpOnly que pone
  el backend. Todas las llamadas usan `credentials: "include"` para
  mandarla/recibirla.
- `dashboard.html` al cargar intenta refrescar la sesión automáticamente si
  no hay access token en memoria (por ejemplo, tras un F5), así que si el
  refresh token sigue vigente el usuario no tiene que loguearse otra vez.
- Si el login normal falla porque el correo no está verificado, aparece un
  botón para reenviar el correo de verificación (asume que el backend
  devuelve un mensaje de error que contiene la palabra "verific"; ajusta el
  `RegExp` en `js/login.js` si tu mensaje es distinto).
