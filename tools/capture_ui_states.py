from __future__ import annotations

import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "reference_capture" / "states"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
URL = "https://app.fireflies.ai/"


def normalize_cookie(cookie: dict) -> dict:
    same_site = cookie.get("sameSite")
    if same_site:
        same_site = {"lax": "Lax", "strict": "Strict", "no_restriction": "None"}.get(same_site.lower(), same_site)
    result = {"name": cookie["name"], "value": cookie["value"], "domain": cookie["domain"], "path": cookie.get("path", "/"), "secure": cookie.get("secure", False), "httpOnly": cookie.get("httpOnly", False)}
    if same_site:
        result["sameSite"] = same_site
    if cookie.get("expirationDate"):
        result["expires"] = cookie["expirationDate"]
    return result


def visible_controls(page):
    return page.locator("button, a, input").evaluate_all("""nodes => nodes.filter(node => {
      const r=node.getBoundingClientRect(), s=getComputedStyle(node); return r.width>0&&r.height>0&&s.visibility!=='hidden';
    }).map((node,index)=>{const r=node.getBoundingClientRect();return {index,tag:node.tagName,text:(node.innerText||node.value||'').trim().replace(/\\s+/g,' '),aria:node.getAttribute('aria-label'),title:node.getAttribute('title'),className:String(node.className||''),rect:{x:r.x,y:r.y,width:r.width,height:r.height}}})""")


def styles(locator):
    return locator.evaluate("""node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return {tag:node.tagName,text:(node.innerText||node.value||'').trim().replace(/\\s+/g,' '),rect:{x:r.x,y:r.y,width:r.width,height:r.height},fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,background:s.background,border:s.border,borderRadius:s.borderRadius,padding:s.padding,boxShadow:s.boxShadow}}""")


def ancestor_chain(locator):
    return locator.evaluate("""node=>{const out=[];let n=node;for(let i=0;n&&i<9;i++,n=n.parentElement){const r=n.getBoundingClientRect(),s=getComputedStyle(n);out.push({tag:n.tagName,className:String(n.className||''),rect:{x:r.x,y:r.y,width:r.width,height:r.height},display:s.display,position:s.position,background:s.background,border:s.border,borderRadius:s.borderRadius,padding:s.padding,gap:s.gap,boxShadow:s.boxShadow})}return out}""")


def click_first(page, candidates):
    for kind, value in candidates:
        try:
            locator = page.get_by_role("button", name=value, exact=False) if kind == "role" else page.get_by_text(value, exact=True) if kind == "text" else page.locator(value)
            if locator.count() and locator.first.is_visible():
                locator.first.click(); page.wait_for_timeout(1000); return value
        except Exception:
            pass
    return None


def surfaces(page):
    return page.locator("[role=dialog], [role=menu], [data-radix-popper-content-wrapper], aside").evaluate_all("""nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return r.width>0&&r.height>0&&s.visibility!=='hidden'}).map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {tag:n.tagName,role:n.getAttribute('role'),className:String(n.className||''),text:(n.innerText||'').trim().replace(/\\s+/g,' ').slice(0,1200),rect:{x:r.x,y:r.y,width:r.width,height:r.height},background:s.background,border:s.border,borderRadius:s.borderRadius,padding:s.padding,boxShadow:s.boxShadow}})""")


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    cookies = json.loads((ROOT / "cookies.json").read_text(encoding="utf-8"))
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=str(CHROME), args=["--disable-blink-features=AutomationControlled"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        normalized = [normalize_cookie(c) for c in cookies]
        saved_html = (ROOT / "reference_capture" / "home.html").read_text(encoding="utf-8")
        token_match = re.search(r'"AUTHORIZATION":"([^"]+)"', saved_html)
        if token_match:
            token = token_match.group(1)
            for cookie in normalized:
                if cookie["name"] == "authorization": cookie["value"] = "Bearer%20" + token
                elif cookie["name"] == "x-cache": cookie["value"] = token
        context.add_cookies(normalized)
        page = context.new_page()
        result = {}
        page.goto(URL, wait_until="domcontentloaded", timeout=90_000); page.wait_for_timeout(12_000)
        result["controls_initial"] = visible_controls(page)
        page.screenshot(path=str(OUTPUT / "initial.png"), full_page=True)

        probes = {"body": page.locator("body").first,"search": page.locator("input[placeholder*='Search']").first,"welcome_heading": page.get_by_text("Welcome Aboard", exact=False).first,"schedule": page.get_by_text("Schedule Meeting", exact=True).first,"capture_meeting": page.get_by_text("Capture Meeting", exact=True).first}
        result["styles"] = {name: styles(loc) for name,loc in probes.items() if loc.count() and loc.is_visible()}
        result["ancestor_chains"] = {name: ancestor_chain(loc) for name,loc in probes.items() if loc.count() and loc.is_visible()}

        states = {
            "sidebar": [("role","Expand sidebar")],
            "profile": [("css","header button[class*=DropdownMenu-styled__Trigger]")],
            "header_capture": [("role","Capture"),("text","Capture")],
            "schedule": [("role","Schedule Meeting"),("text","Schedule Meeting")],
            "capture_meeting": [("role","Capture Meeting"),("text","Capture Meeting")],
        }
        for state,candidates in states.items():
            clicked=click_first(page,candidates)
            result[state]={"clicked":clicked,"controls":visible_controls(page),"body_tail":page.locator("body").inner_text()[-5000:],"surfaces":surfaces(page)}
            page.screenshot(path=str(OUTPUT/f"{state}.png"),full_page=True)
            (OUTPUT/f"{state}.html").write_text(page.content(),encoding="utf-8")
            page.keyboard.press("Escape");page.wait_for_timeout(400)

        (OUTPUT/"inspection.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
        print(json.dumps({k:result[k].get("clicked") for k in states},indent=2))
        browser.close()

if __name__ == "__main__": main()
