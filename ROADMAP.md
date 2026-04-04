# ROADMAP — Autos Premium CR

Última actualización: 1 de abril 2026

---

## Estado actual
La plataforma está live en https://autospremiumcostarica.com con las funcionalidades base funcionando:
HTML estático + Node.js API + PostgreSQL + Cloudflare + Claude Haiku (valuador + chat) + Twilio WhatsApp (sandbox).

---

## Fase 1 — Infraestructura y notificaciones ✅ (casi completa)

- [x] VPS DigitalOcean configurado
- [x] Nginx + SSL + Cloudflare
- [x] API REST con Node.js/Express
- [x] Base de datos PostgreSQL
- [x] Panel de administración
- [x] OTP por WhatsApp para verificar vendedores
- [x] Notificaciones WhatsApp (admin + vendedor)
- [x] Upgrade cuenta Twilio a paid
- [ ] Twilio: pasar de sandbox a producción
  - Esperando desbloqueo de cuenta por parte del equipo de compliance de Twilio
  - Ticket abierto con soporte

---

## Fase 2 — Valuador con datos reales 🔄 (en progreso)

El valuador actual responde solo con conocimiento general de Claude.
El objetivo es alimentarlo con precios reales del mercado costarricense.

### 2.1 — Crear tabla `precios_referencia`
- [ ] Diseñar schema de la tabla
- [ ] Crear tabla en PostgreSQL
- [ ] Crear endpoint `GET /api/precios-referencia` para el valuador

### 2.2 — Scraping histórico del grupo de Facebook
- [ ] Adaptar bot.py para recorrer historial del grupo (no solo posts nuevos)
- [ ] Usar Claude Haiku para parsear texto libre → datos estructurados
  - Extraer: marca, modelo, año, km, precio, provincia, fecha del post
- [ ] Pipeline: Playwright scrape → Claude extrae → guarda en `precios_referencia`
- [ ] Procesar ~90,000 posts históricos (2018-2026), costo estimado ~$9

### 2.3 — Valuador mejorado
- [ ] Modificar `valuador.html` para mostrar comparables reales
- [ ] Modificar API del valuador para buscar comps en `precios_referencia`
- [ ] Prompt mejorado: Claude recibe los 10-15 comparables más cercanos
- [ ] Output enriquecido: precio estimado + rango + comps reales + veredicto

---

## Fase 3 — Bot de Facebook 🔄 (pendiente activación)

- [x] Bot desarrollado con Playwright
- [x] Grupo de Facebook público desde 1 abril 2026
- [ ] Probar bot manualmente: `cd /var/www/bot && python3 bot.py`
- [ ] Revisar logs: `tail -f /var/log/bot.log`
- [ ] Programar cron cada 30 minutos
- [ ] Validar que los anuncios del grupo llegan correctamente a la DB

---

## Fase 4 — Monetización ⬜ (pendiente)

- [ ] Definir modelo de negocio:
  - Anuncios destacados (vendedores individuales)
  - Planes para agencias / dealers
- [ ] Implementar campo `destacado` en el flujo de publicación
- [ ] Integrar pasarela de pago (por definir)
- [ ] Estrategia de marketing y posicionamiento

---

## Fase 5 — Confianza y reputación ⬜ (pendiente)

- [ ] Verificación de identidad del vendedor (cédula + selfie)
- [ ] Sistema de reputación vendedor/comprador
- [ ] Reportes de anuncios fraudulentos

---

## Fase 6 — Analytics y datos ⬜ (pendiente)

- [ ] dbt sobre los datos de la plataforma
- [ ] Dashboard de métricas (anuncios publicados, visitas, conversiones)
- [ ] Exportación de datos para análisis

---

## Costos mensuales actuales
| Servicio | Costo |
|---|---|
| VPS DigitalOcean | $6/mes |
| Dominio Namecheap | ~$1/mes |
| Twilio WhatsApp | ~$7.50/mes |
| Anthropic Claude | ~$4.50/mes |
| **Total** | **~$19/mes** |

---

## Cómo usar este archivo
- Actualizar después de cada sesión de trabajo
- Marcar tareas completadas con `[x]`
- Agregar notas de bloqueos o decisiones importantes debajo de cada tarea