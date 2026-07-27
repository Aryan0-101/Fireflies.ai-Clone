from pathlib import Path
import json
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "verification"
OUT.mkdir(exist_ok=True)


def box(locator):
    value = locator.bounding_box()
    return None if value is None else {key: round(value[key], 2) for key in ("x", "y", "width", "height")}


with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    )
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))
    page.on("console", lambda message: errors.append(f"console: {message.text}") if message.type == "error" else None)
    page.goto("http://127.0.0.1:3000", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(1500)

    result = {
        "initial": {
            "sidebar": box(page.locator(".icon-rail")),
            "topbar": box(page.locator(".topbar")),
            "search": box(page.locator(".global-search")),
            "search_input": box(page.locator(".global-search input")),
            "upgrade": box(page.locator(".upgrade-button")),
            "capture": box(page.locator(".capture-button")),
            "capture_more": box(page.locator(".capture-more")),
            "profile": box(page.locator(".avatar-button")),
            "welcome": box(page.locator(".welcome-panel")),
            "quick_buttons": [box(item) for item in page.locator(".quick-start .quick").all()],
            "rail_icons": [box(item) for item in page.locator(".rail-link > svg").all()],
            "store_buttons": [box(item) for item in page.locator(".store-buttons button").all()],
        }
    }

    page.get_by_role("button", name="Expand sidebar").click()
    page.wait_for_timeout(300)
    result["expanded"] = {
        "sidebar": box(page.locator(".icon-rail")),
        "wordmark_visible": page.locator(".rail-wordmark").is_visible(),
        "home": box(page.locator(".rail-nav .rail-link").first),
    }

    page.get_by_role("button", name="Profile").click()
    result["profile"] = {
        "menu": box(page.locator(".profile-menu")),
        "text": " ".join(page.locator(".profile-menu").inner_text().split()),
    }
    page.keyboard.press("Escape")

    page.get_by_role("button", name="Schedule Meeting", exact=True).click()
    result["schedule"] = {
        "dialog": box(page.locator(".schedule-dialog")),
        "google": box(page.get_by_role("link", name="Google Calendar")),
        "outlook": box(page.get_by_role("link", name="Microsoft Outlook")),
    }
    page.keyboard.press("Escape")

    page.locator(".capture-button").click()
    result["capture"] = {
        "dialog": box(page.locator(".capture-dialog")),
        "name": box(page.locator(".capture-dialog input").nth(0)),
        "link": box(page.locator(".capture-dialog input").nth(1)),
        "language": box(page.locator(".capture-dialog select")),
        "cancel": box(page.get_by_role("button", name="Cancel")),
        "start": box(page.get_by_role("button", name="Start Capturing")),
    }
    page.get_by_role("button", name="Start Capturing").click()
    result["capture"]["empty_submit_stays_open"] = page.locator(".capture-dialog").is_visible()
    page.locator(".capture-dialog input").nth(1).fill("https://meet.google.com/abc-defg-hij")
    page.get_by_role("button", name="Start Capturing").click()
    page.wait_for_url("**/meetings?**")
    result["capture"]["submitted_url"] = page.url

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto("http://127.0.0.1:3000", wait_until="domcontentloaded", timeout=30000)
    mobile.wait_for_timeout(1500)
    result["mobile"] = {
        "body_width": mobile.evaluate("document.body.scrollWidth"),
        "viewport_width": mobile.evaluate("innerWidth"),
        "sidebar": box(mobile.locator(".icon-rail")),
        "welcome": box(mobile.locator(".welcome-panel")),
    }
    mobile.get_by_role("button", name="Profile").click()
    result["mobile"]["profile"] = box(mobile.locator(".profile-menu"))
    result["errors"] = list(dict.fromkeys(errors))
    (OUT / "ui-states.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    browser.close()
