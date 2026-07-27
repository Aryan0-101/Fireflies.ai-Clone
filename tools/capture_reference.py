from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "reference_capture"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
ROUTES = {
    "home": "https://app.fireflies.ai/",
    "meetings": "https://app.fireflies.ai/notebook/mine-shared",
    "ask-fred": "https://app.fireflies.ai/ask-fred",
}


def normalize_cookie(cookie: dict) -> dict:
    same_site = cookie.get("sameSite")
    if same_site:
        same_site = {
            "lax": "Lax",
            "strict": "Strict",
            "no_restriction": "None",
        }.get(same_site.lower(), same_site)

    normalized = {
        "name": cookie["name"],
        "value": cookie["value"],
        "domain": cookie["domain"],
        "path": cookie.get("path", "/"),
        "secure": cookie.get("secure", False),
        "httpOnly": cookie.get("httpOnly", False),
    }
    if same_site:
        normalized["sameSite"] = same_site
    if cookie.get("expirationDate"):
        normalized["expires"] = cookie["expirationDate"]
    return normalized


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    cookies = json.loads((ROOT / "cookies.json").read_text(encoding="utf-8"))

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=str(CHROME),
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        context.add_cookies([normalize_cookie(cookie) for cookie in cookies])
        page = context.new_page()

        results = {}
        for name, url in ROUTES.items():
            page.goto(url, wait_until="domcontentloaded", timeout=90_000)
            page.wait_for_timeout(12_000)
            page.screenshot(path=str(OUTPUT / f"{name}.png"), full_page=True)
            (OUTPUT / f"{name}.html").write_text(page.content(), encoding="utf-8")
            results[name] = {
                "requested_url": url,
                "final_url": page.url,
                "title": page.title(),
                "viewport": page.viewport_size,
            }

        (OUTPUT / "manifest.json").write_text(
            json.dumps(results, indent=2), encoding="utf-8"
        )
        browser.close()

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
