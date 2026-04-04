# Documentación Técnica — Autos Premium CR
**Versión:** 2.1
**Fecha:** 1 de abril 2026
**Propietario:** Carlos Aguirre
**Sitio web:** https://autospremiumcostarica.com
**Repositorio:** https://github.com/Carlosaguirre5/autospremiumcr

---

## 1. Resumen del Proyecto
Autos Premium CR es una plataforma de clasificados de vehículos usados en Costa Rica. Permite a vendedores publicar anuncios con fotos, y a compradores buscar y contactar vendedores directamente.
El proyecto nació como complemento digital a un grupo de Facebook con más de 18,000 publicaciones anuales, con el objetivo de crear una plataforma propia independiente de Meta.

---

## 2. Arquitectura General
```
Usuario (navegador)
        ↓
   Cloudflare CDN (caché + protección)
        ↓
   Nginx (puerto 80/443)
        ↓
   Archivos HTML estáticos  →  /var/www/autospremiumcr/public/
        +
   Node.js API (puerto 3000) →  /var/www/autospremiumcr/src/
        ↓
   PostgreSQL (base de datos) → base de datos: autospremiumcr
```

---

## 3. Infraestructura

### Servidor VPS
| Campo | Valor |
|---|---|
| Proveedor | DigitalOcean |
| Plan | Basic — $6/mes |
| Sistema operativo | Ubuntu 22.04 LTS |
| IP pública | 134.122.15.241 |
| Región | New York (nyc3) |

### Dominio y SSL
| Campo | Valor |
|---|---|
| Dominio | autospremiumcostarica.com |
| Registrador | Namecheap |
| SSL | Let's Encrypt (renovación automática) |
| Vencimiento certificado | 27 de junio 2026 |
| CDN | Cloudflare (plan gratuito) |

### Conectarse al servidor
```bash
ssh root@134.122.15.241
```

---

## 4. Tecnologías Utilizadas
| Tecnología | Versión | Uso |
|---|---|---|
| Ubuntu | 22.04 LTS | Sistema operativo |
| Nginx | 1.18.0 | Servidor web y proxy reverso |
| Node.js | 20.x | Backend / API REST |
| Express | 4.x | Framework del backend |
| PostgreSQL | 14.x | Base de datos |
| PM2 | última | Gestor de procesos 24/7 |
| Certbot | última | Certificados SSL |
| Cloudflare | — | CDN y protección |
| Twilio | — | Notificaciones WhatsApp |
| Anthropic Claude | Haiku | IA para valuador y chat |
| Python 3 | 3.10 | Bot de Facebook + scraper histórico |
| Playwright | última | Automatización bot Facebook |

---

## 5. Estructura de Archivos

### Sitio web (páginas HTML)
```
/var/www/autospremiumcr/public/
├── index.html          → Página de inicio con buscador
├── resultados.html     → Búsqueda y listado de vehículos
├── detalle.html        → Página de detalle de un anuncio
├── publicar.html       → Formulario para publicar anuncio (con OTP)
├── admin.html          → Panel de administración (requiere login)
├── admin-login.html    → Login del panel de administración
├── valuador.html       → Valuador de autos con IA
├── blog.html           → Blog con 5 artículos
├── contacto.html       → Página de contacto
├── responsive.css      → Estilos responsive (móvil)
├── chat.js             → Chat asistente IA (widget flotante)
├── chat_fix.js         → Fix de posicionamiento del chat
├── favicon.svg         → Ícono del sitio
├── logo.png            → Logo del sitio
├── og-image.png        → Imagen para preview en redes sociales
└── uploads/            → Fotos subidas por los vendedores
```

### Backend (API)
```
/var/www/autospremiumcr/
├── src/
│   ├── index.js        → Servidor principal (Express + OTP + WhatsApp)
│   ├── db.js           → Conexión a PostgreSQL
│   └── routes/
│       ├── anuncios.js → Endpoints de anuncios + notificaciones + comparables
│       └── auth.js     → Endpoints de autenticación + admin login
├── .env                → Variables de entorno (credenciales)
├── uploads/            → Carpeta de fotos subidas
└── package.json        → Dependencias Node.js
```

### Bot de Facebook
```
/var/www/bot/
├── bot.py                  → Script principal del bot (posts nuevos)
├── scraper_historico.py    → Scraper histórico → puebla precios_referencia
├── .env                    → Credenciales de Facebook + API + DB
├── processed.json          → IDs de publicaciones ya procesadas (bot.py)
└── processed_historico.json → IDs ya procesadas (scraper_historico.py)
```

---

## 6. Variables de Entorno

### Backend (/var/www/autospremiumcr/.env)
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autospremiumcr
DB_USER=apcruser
DB_PASSWORD=[contraseña de la base de datos]
JWT_SECRET=[clave secreta para tokens]
ADMIN_USER=[usuario del panel admin]
ADMIN_PASSWORD=[contraseña del panel admin]
ADMIN_JWT_SECRET=[clave secreta para tokens admin]
TWILIO_ACCOUNT_SID=[SID de Twilio]
TWILIO_AUTH_TOKEN=[token de Twilio]
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+50683125939
ANTHROPIC_KEY=[API key de Anthropic Claude]
```

### Bot (/var/www/bot/.env)
```
FB_EMAIL=[correo de la cuenta secundaria de Facebook]
FB_PASSWORD=[contraseña de la cuenta secundaria]
GROUP_ID=502023107278029
API_URL=http://localhost:3000/api/anuncios
ANTHROPIC_KEY=[API key de Anthropic Claude]
DB_PASSWORD=[contraseña de la base de datos]
```

⚠️ Nunca compartir estos archivos ni subirlos a GitHub.

---

## 7. Base de Datos

### Conexión
```bash
sudo -u postgres psql -d autospremiumcr
```

### Tabla: anuncios
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL | ID único del anuncio |
| titulo | VARCHAR | Título del anuncio |
| marca | VARCHAR | Marca del vehículo |
| modelo | VARCHAR | Modelo del vehículo |
| anio | INTEGER | Año del vehículo |
| km | INTEGER | Kilometraje |
| precio | BIGINT | Precio en colones |
| combustible | VARCHAR | Gasolina / Diésel / Híbrido / Eléctrico |
| transmision | VARCHAR | Automático / Manual / CVT |
| descripcion | TEXT | Descripción del vendedor |
| vendedor_nombre | VARCHAR | Nombre del vendedor |
| vendedor_telefono | VARCHAR | Teléfono del vendedor |
| provincia | VARCHAR | Provincia |
| estado | VARCHAR | pendiente / activo / rechazado / vendido |
| destacado | BOOLEAN | Si es anuncio destacado |
| fuente | VARCHAR | web / facebook |
| facebook_post_id | VARCHAR | ID del post en Facebook |
| fotos | JSONB | Array de fotos en JSON |
| visitas | INTEGER | Contador de visitas |
| creado_en | TIMESTAMP | Fecha de creación |

### Tabla: usuarios
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL | ID único |
| nombre | VARCHAR | Nombre completo |
| email | VARCHAR | Correo electrónico |
| telefono | VARCHAR | Teléfono |
| password_hash | VARCHAR | Contraseña encriptada |
| rol | VARCHAR | usuario / admin |

### Tabla: precios_referencia ← NUEVA
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL | ID único |
| marca | VARCHAR | Marca del vehículo |
| modelo | VARCHAR | Modelo del vehículo |
| anio | INTEGER | Año del vehículo |
| km | INTEGER | Kilometraje |
| precio | BIGINT | Precio en colones |
| combustible | VARCHAR | Gasolina / Diésel / Híbrido / Eléctrico |
| transmision | VARCHAR | Automático / Manual / CVT |
| provincia | VARCHAR | Provincia |
| fuente | VARCHAR | facebook (default) |
| facebook_post_id | VARCHAR | ID del post en Facebook |
| fecha_post | DATE | Fecha de la publicación |
| texto_original | TEXT | Texto completo del post |
| creado_en | TIMESTAMP | Fecha de inserción |

**Índices creados:**
- `idx_precios_marca_modelo` — búsquedas por marca y modelo
- `idx_precios_anio` — filtros por año
- `idx_precios_km` — filtros por kilometraje

---

## 8. API REST — Endpoints

**Base URL:** https://autospremiumcostarica.com/api

| Método | Endpoint | Descripción |
|---|---|---|
| GET | /anuncios | Listar anuncios (con filtros) |
| GET | /anuncios/:id | Obtener un anuncio por ID |
| POST | /anuncios | Crear nuevo anuncio |
| PATCH | /anuncios/:id/estado | Cambiar estado (aprobar/rechazar) |
| DELETE | /anuncios/:id | Eliminar anuncio |
| GET | /anuncios/precios-referencia/comparables | Comparables para el valuador ← NUEVO |
| POST | /auth/registro | Registrar usuario |
| POST | /auth/login | Iniciar sesión |
| POST | /auth/admin/login | Login del panel admin |
| GET | /auth/admin/verify | Verificar token admin |
| POST | /otp/enviar | Enviar código OTP por WhatsApp |
| POST | /otp/verificar | Verificar código OTP |
| GET | /config | Retorna API key de Anthropic |
| GET | /health | Verificar que la API está activa |

### Filtros para GET /anuncios/precios-referencia/comparables
```
?marca=Toyota&modelo=Corolla&anio=2019&km=50000
```
Retorna los 15 comparables más cercanos en año y km.

---

## 9. Funcionalidades de IA

### Valuador de Autos
- **URL:** /valuador.html
- **Modelo:** Claude Haiku
- **Función:** El usuario ingresa marca, modelo, año y km. La IA devuelve precio estimado, rango, veredicto y recomendaciones en el contexto del mercado costarricense.
- **Estado:** En mejora — se está conectando con datos reales de `precios_referencia`
- **Data source:** Publicaciones del grupo de Facebook (últimos 12 meses, abr 2025 - mar 2026)

### Chat Asistente
- **Archivo:** /chat.js
- **Modelo:** Claude Haiku
- **Función:** Widget flotante en todas las páginas. El usuario escribe en lenguaje natural y la IA busca vehículos en la base de datos real.

---

## 10. Notificaciones WhatsApp (Twilio)

### Flujo de notificaciones
1. Vendedor llena formulario → recibe código OTP para verificar número
2. Vendedor publica anuncio → admin recibe WhatsApp con detalles
3. Admin aprueba o rechaza → vendedor recibe WhatsApp con resultado

### Estado actual
- Cuenta Twilio upgradeada a paid (1 abril 2026)
- Ticket de soporte abierto para remover restricción de compra de números
- Pendiente: comprar número y activar WhatsApp Sender
- Pendiente: pasar de sandbox a producción

---

## 11. Gestión del Servidor
```bash
# Ver estado del servidor
pm2 status

# Reiniciar el servidor
pm2 restart autospremiumcr --update-env

# Ver logs del servidor
pm2 logs autospremiumcr

# Reiniciar Nginx
systemctl restart nginx

# Ver logs de Nginx
tail -f /var/log/nginx/error.log

# Subir archivo desde Mac
scp archivo.html root@134.122.15.241:/var/www/autospremiumcr/public/

# Limpiar caché de Cloudflare
# Ir a cloudflare.com → sitio → Caching → Purge Everything
```

---

## 12. Bot de Facebook

### bot.py — Posts nuevos
Captura posts nuevos del grupo cada 30 minutos y los guarda en `anuncios`.

```bash
# Ejecutar manualmente
cd /var/www/bot && python3 bot.py

# Programar cada 30 minutos
crontab -e
*/30 * * * * cd /var/www/bot && python3 bot.py >> /var/log/bot.log 2>&1

# Ver logs
tail -f /var/log/bot.log
```

### scraper_historico.py — Carga histórica
Procesa el CSV exportado de Facebook y puebla `precios_referencia` con datos históricos.

```bash
cd /var/www/bot && python3 scraper_historico.py
```

### Estado actual
- Bot desarrollado y listo
- Grupo público desde 1 abril 2026
- Cuenta secundaria de Facebook bloqueada temporalmente por detección de bot
- CSV de publicaciones destacadas (abr 2025 - mar 2026) descargado y listo para procesar
- Pendiente: crear cuenta secundaria nueva y retomar el bot

---

## 13. SEO
- Google Search Console verificado
- Sitemap: https://autospremiumcostarica.com/sitemap.xml
- Robots.txt: https://autospremiumcostarica.com/robots.txt
- Meta tags en todas las páginas
- Open Graph tags para preview en redes sociales

---

## 14. Contacto y Redes Sociales
| Canal | Valor |
|---|---|
| WhatsApp | +506 8312-5939 |
| Correo | autospremiumcostarica5@gmail.com |
| Facebook | facebook.com/autospremiumcostarica |
| Instagram | instagram.com/autospremiumcostarica |
| Grupo Facebook | facebook.com/groups/502023107278029 |

---

## 15. Tareas Pendientes
- [ ] Twilio: esperar respuesta de soporte para comprar número y activar WhatsApp Sender
- [ ] Valuador: procesar CSV de Facebook y poblar `precios_referencia`
- [ ] Valuador: actualizar `valuador.html` para usar datos reales de `precios_referencia`
- [ ] Bot Facebook: crear cuenta secundaria nueva y reactivar
- [ ] Activar cron del bot cada 30 minutos
- [ ] Estrategia de facturación (anuncios destacados, planes para agencias)
- [ ] Estrategia de marketing y posicionamiento
- [ ] Verificación de identidad del vendedor (cédula + selfie)
- [ ] Sistema de reputación vendedor/comprador
- [ ] dbt sobre los datos de la plataforma

---

## 16. Costos Mensuales
| Servicio | Costo |
|---|---|
| VPS DigitalOcean | $6/mes |
| Dominio Namecheap | ~$1/mes (pago anual $11.48) |
| SSL Let's Encrypt | Gratis |
| Cloudflare | Gratis |
| Twilio WhatsApp | ~$7.50/mes (estimado, pendiente activación) |
| Anthropic Claude | ~$4.50/mes (50 valuaciones/día) |
| **Total estimado** | **~$19/mes** |

---

*Documento actualizado el 1 de abril de 2026. Actualizar cada vez que se hagan cambios importantes.*