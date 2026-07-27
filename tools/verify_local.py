from pathlib import Path
import json
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / "verification"
out.mkdir(exist_ok=True)
routes = {"home":"/", "meetings":"/meetings", "meeting":"/meeting/1", "ask-fred":"/ask-fred"}
viewports = {"desktop": {"width": 1440, "height": 1000}, "mobile": {"width": 390, "height": 844}}
report = {}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    for viewport_name, viewport in viewports.items():
        context = browser.new_context(viewport=viewport)
        page = context.new_page()
        errors = []
        page.on("console", lambda msg: errors.append(f"console: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
        page.on("response", lambda response: errors.append(f"HTTP {response.status} {response.url}") if response.status >= 400 else None)
        for name, path in routes.items():
            page.goto("http://127.0.0.1:3000" + path, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(1500)
            page.screenshot(path=str(out / f"{name}-{viewport_name}.png"), full_page=True)
            metrics = page.evaluate("""() => ({
              bodyScrollWidth: document.body.scrollWidth,
              viewportWidth: window.innerWidth,
              overflowing: [...document.querySelectorAll('button,a,h1,h2,h3,p,span')]
                .filter(el => el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'hidden')
                .slice(0, 12).map(el => ({tag: el.tagName, text: (el.textContent || '').trim().slice(0, 80), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth}))
            })""")
            report[f"{name}-{viewport_name}"] = {"url": page.url, "title": page.title(), "errors": list(dict.fromkeys(errors)), "metrics": metrics}
            errors.clear()
        context.close()
    browser.close()
(out / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))