# Estado del Proyecto — Autos Premium CR
Última actualización: 31 de marzo 2026

## Stack
- Servidor: DigitalOcean VPS $6/mes — IP 134.122.15.241
- Dominio: autospremiumcostarica.com (Namecheap)
- SSL: Let's Encrypt (vence 27 junio 2026)
- CDN: Cloudflare (activo)
- Backend: Node.js + Express corriendo con PM2
- Base de datos: PostgreSQL
- Repo: github.com/Carlosaguirre5/autospremiumcr

## Páginas funcionando
- index.html — Homepage con buscador
- resultados.html — Listado con filtros
- detalle.html — Detalle de anuncio
- publicar.html — Formulario con OTP WhatsApp
- valuador.html — Valuador IA con Claude
- blog.html — Blog con 5 artículos
- contacto.html — Contacto con WhatsApp
- admin.html — Panel admin (requiere login)
- admin-login.html — Login del admin

## Funcionalidades activas
- Publicación de anuncios con fotos
- Verificación OTP por WhatsApp (Twilio sandbox)
- Notificación WhatsApp al admin cuando llega anuncio nuevo
- Notificación WhatsApp al vendedor cuando aprueban/rechazan
- Valuador de autos con IA (Claude Haiku)
- Chat asistente IA en todas las páginas
- Login seguro para admin
- SEO + Google Search Console verificado
- Sitemap.xml y robots.txt
- Open Graph tags (miniatura al compartir links)
- Responsive móvil en todas las páginas
- Hamburger menu en todas las páginas

## Pendiente
- Bot de Facebook (grupo se vuelve público mañana 1 abril)
- Twilio pasar de sandbox a producción
- Optimizar Valuador con datos reales de la DB
- Estrategia de facturación
- Estrategia de marketing
- Verificación de identidad vendedor (cédula + selfie)
- Sistema de reputación vendedor/comprador
- dbt sobre los datos de la plataforma

## Credenciales importantes (NO subir a GitHub)
- Admin panel: ver .env en servidor
- Twilio: ver .env en servidor
- Anthropic API key: ver .env en servidor
- DB: ver .env en servidor

## Comandos útiles
- Conectar al servidor: ssh root@134.122.15.241
- Ver estado API: pm2 status
- Ver logs: pm2 logs autospremiumcr
- Reiniciar API: pm2 restart autospremiumcr --update-env
- Subir archivo: scp archivo.html root@134.122.15.241:/var/www/autospremiumcr/public/
