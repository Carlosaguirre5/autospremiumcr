import asyncio, aiohttp, json, os, re
import psycopg2
from datetime import datetime
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv("/var/www/bot/.env")

GROUP_ID      = os.environ.get("GROUP_ID", "502023107278029")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_KEY", "")
FB_EMAIL      = os.environ.get("FB_EMAIL", "")
FB_PASSWORD   = os.environ.get("FB_PASSWORD", "")
PROCESSED     = "/var/www/bot/processed_historico.json"

# Conexión directa a la DB (sin pasar por la API)
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "autospremiumcr",
    "user":     "apcruser",
    "password": os.environ.get("DB_PASSWORD", "")
}

# ── Cuántos scrolls hacer (cada scroll carga ~5 posts más)
# 100 scrolls ≈ 500 posts por sesión. Aumentar para más historial.
SCROLL_COUNT = 100

def load_processed():
    if os.path.exists(PROCESSED):
        with open(PROCESSED) as f: return set(json.load(f))
    return set()

def save_processed(ids):
    with open(PROCESSED, "w") as f: json.dump(list(ids), f)

async def parse_with_ai(text):
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 300,
                    "messages": [{
                        "role": "user",
                        "content": f"""Extraé los datos de este anuncio de venta de vehículo en Costa Rica.
Respondé SOLO con JSON válido, sin texto adicional ni backticks:
{{
  "marca": "string o null",
  "modelo": "string o null",
  "anio": numero o null,
  "precio": numero en colones o null,
  "km": numero o null,
  "combustible": "Gasolina/Diésel/Híbrido/Eléctrico o null",
  "transmision": "Automático/Manual/CVT o null",
  "provincia": "string o null"
}}

Si no es un anuncio de venta de vehículo, respondé: {{"marca": null}}

Anuncio:
{text[:800]}"""
                    }]
                }
            ) as r:
                data = await r.json()
                content = data["content"][0]["text"].strip()
                return json.loads(content)
    except Exception as e:
        print(f"⚠️ Error IA: {e}")
        return {}

def save_to_db(parsed, post_id, text, fecha):
    # Ignorar si no tiene marca (no es anuncio de auto)
    if not parsed.get("marca"):
        return False
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur  = conn.cursor()
        cur.execute("""
            INSERT INTO precios_referencia
              (marca, modelo, anio, km, precio, combustible, transmision,
               provincia, fuente, facebook_post_id, fecha_post, texto_original)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'facebook',%s,%s,%s)
            ON CONFLICT DO NOTHING
        """, (
            parsed.get("marca"),
            parsed.get("modelo"),
            parsed.get("anio"),
            parsed.get("km"),
            parsed.get("precio"),
            parsed.get("combustible"),
            parsed.get("transmision"),
            parsed.get("provincia"),
            post_id,
            fecha,
            text[:2000]
        ))
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Error DB: {e}")
        return False

async def run():
    processed = load_processed()
    saved_count = 0
    skipped_count = 0

    print(f"🤖 Scraper histórico iniciado — {datetime.now().strftime('%H:%M:%S')}")
    print(f"📋 Posts ya procesados: {len(processed)}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox",
                  "--disable-dev-shm-usage", "--disable-gpu"]
        )
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = await ctx.new_page()

        # Cargar cookies de sesión
        cookies_path = "/var/www/bot/fb_cookies.json"
        if not os.path.exists(cookies_path):
            print(f"❌ No se encontró fb_cookies.json en {cookies_path}")
            await browser.close()
            return

        import json as _json
        with open(cookies_path) as f:
            cookies = _json.load(f)
        await ctx.add_cookies(cookies)
        print(f"✅ Sesión cargada desde cookies")

        # Navegar al grupo
        print(f"📖 Cargando grupo...")
        await page.goto(
            f"https://www.facebook.com/groups/{GROUP_ID}",
            wait_until="domcontentloaded"
        )
        await asyncio.sleep(6)

        # Scroll agresivo para cargar historial
        print(f"⏬ Haciendo {SCROLL_COUNT} scrolls para cargar historial...")
        for i in range(SCROLL_COUNT):
            await page.keyboard.press("End")
            await asyncio.sleep(1.5)
            if i % 20 == 0 and i > 0:
                print(f"   Scroll {i}/{SCROLL_COUNT}...")

        # Extraer posts del DOM
        posts = await page.evaluate("""() => {
            const results = [];
            const articles = document.querySelectorAll('[role="article"]');
            articles.forEach(a => {
                const textEl = a.querySelector('[data-ad-comet-preview="message"]') ||
                               a.querySelector('[dir="auto"]');
                const text = textEl ? textEl.innerText.trim() : '';
                if (text.length < 30) return;

                const linkEl = a.querySelector('a[href*="/groups/"][href*="/posts/"]');
                const postId = linkEl
                    ? (linkEl.href.match(/posts\\/([^/?]+)/) || [])[1]
                    : null;

                const timeEl = a.querySelector('abbr, time');
                const fecha  = timeEl ? (timeEl.getAttribute('data-utime') || timeEl.getAttribute('datetime') || null) : null;

                if (postId) results.push({ postId, text, fecha });
            });
            return results;
        }""")

        print(f"📦 {len(posts)} publicaciones encontradas en el DOM")

        for post in posts:
            pid   = post.get("postId")
            text  = post.get("text", "")
            fecha = post.get("fecha")

            if not pid or pid in processed:
                skipped_count += 1
                continue

            print(f"🔍 {text[:70]}...")

            parsed = await parse_with_ai(text) if ANTHROPIC_KEY else {}

            if save_to_db(parsed, pid, text, fecha):
                print(f"   ✅ Guardado: {parsed.get('marca')} {parsed.get('modelo')} {parsed.get('anio')} — ₡{parsed.get('precio'):,}" if parsed.get('precio') else f"   ✅ Guardado (sin precio)")
                saved_count += 1
            else:
                print(f"   ⏭️  Ignorado (no es anuncio de auto)")

            processed.add(pid)
            await asyncio.sleep(1.5)  # Respetar rate limit de Claude

        save_processed(processed)
        await browser.close()

    print(f"\n{'='*50}")
    print(f"✅ Sesión completa — {datetime.now().strftime('%H:%M:%S')}")
    print(f"   Guardados en precios_referencia: {saved_count}")
    print(f"   Saltados (ya procesados): {skipped_count}")
    print(f"   Total procesados histórico: {len(processed)}")

if __name__ == "__main__":
    asyncio.run(run())