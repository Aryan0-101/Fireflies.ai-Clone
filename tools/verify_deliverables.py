from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "verification"
OUT.mkdir(exist_ok=True)
report = {"dashboard": {}, "detail": {}, "sidebar": {}, "errors": []}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.on("pageerror", lambda error: report["errors"].append(f"pageerror: {error}"))
    page.on("console", lambda message: report["errors"].append(f"console: {message.text}") if message.type == "error" else None)

    page.goto("http://localhost:3000/meetings", wait_until="domcontentloaded")
    page.wait_for_timeout(1800)
    report["dashboard"]["meeting_rows"] = page.locator(".meeting-row").count()
    report["dashboard"]["columns"] = page.locator(".meeting-table-head span").all_inner_texts()
    search = page.get_by_placeholder("Search meetings")
    search.fill("Customer")
    page.wait_for_timeout(500)
    report["dashboard"]["search_rows"] = page.locator(".meeting-row").count()
    report["dashboard"]["search_result_text"] = " ".join(page.locator(".meeting-row").all_inner_texts())
    report["dashboard"]["filter_button"] = {"present": page.get_by_role("button", name="Filters").count() == 1, "changes_state": False}
    page.get_by_role("button", name="Filters").click()
    page.wait_for_timeout(200)
    report["dashboard"]["filter_button"]["changes_state"] = page.locator("[role=dialog], .filter-menu, .filter-popover").count() > 0

    page.goto("http://localhost:3000/meeting/1", wait_until="domcontentloaded")
    page.wait_for_timeout(1800)
    rows = page.locator(".transcript-row")
    report["detail"]["transcript_rows"] = rows.count()
    report["detail"]["summary_visible"] = page.locator(".summary-block").count() == 1
    report["detail"]["action_items"] = page.locator(".action-list button").count()
    report["detail"]["player_visible"] = page.locator(".meeting-player").count() == 1
    report["detail"]["seek_control"] = page.locator("audio, video, input[type=range], .player-controls input").count() > 0
    if rows.count() > 1:
        rows.nth(1).click()
        report["detail"]["transcript_click_activates"] = rows.nth(1).evaluate("node => node.classList.contains('active')")
    transcript_search = page.get_by_placeholder("Search transcript...")
    transcript_search.fill("auth")
    page.wait_for_timeout(200)
    report["detail"]["transcript_search_rows"] = rows.count()
    report["detail"]["highlight_marks"] = page.locator("mark").count()

    page.goto("http://localhost:3000", wait_until="domcontentloaded")
    page.wait_for_timeout(800)
    icon_rects = page.locator(".rail-link > svg, .rail-link > .ff-mark, .rail-link > .fred-mark").evaluate_all("nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return { width: r.width, height: r.height }; })")
    report["sidebar"]["icon_rects"] = icon_rects
    report["sidebar"]["all_20x20"] = all(round(item["width"]) == 20 and round(item["height"]) == 20 for item in icon_rects)

    (OUT / "deliverables.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    browser.close()