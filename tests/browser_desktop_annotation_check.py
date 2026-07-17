#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / 'tests' / 'artifacts'
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE = ARTIFACT_DIR / 'desktop-test-base.png'
SCREENSHOT = ARTIFACT_DIR / 'desktop-annotation-v1.47.0.png'

img = Image.new('RGB', (1000, 680), 'white')
d = ImageDraw.Draw(img)
for y in range(35, 660, 42):
    d.line((30, y, 970, y), fill=(224, 229, 236), width=2)
d.rectangle((70, 75, 930, 610), outline=(115, 132, 155), width=3)
d.text((110, 100), 'LongShotStitch desktop annotation test', fill=(32, 42, 58))
img.save(SAMPLE)


def check(value, message):
    if not value:
        raise AssertionError(message)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'])
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
    page = context.new_page()
    page.set_content((ROOT / 'LongShotStitch.html').read_text(encoding='utf-8'), wait_until='load')
    page.locator('#fileInput').set_input_files(str(SAMPLE))
    page.wait_for_function("document.querySelector('#dropHint').style.display === 'none'", timeout=10000)
    page.locator('.mode-btn[data-mode="tools"]').click()
    page.wait_for_timeout(200)

    expected = ['select','marquee','shape','pen','arrow','text','badge','mosaic','eraser','watermark']
    order = page.locator('#toolDock [data-tool-group]').evaluate_all("els => els.map(el => el.dataset.toolGroup)")
    check(order == expected, f'desktop tool order mismatch: {order}')

    stage = page.locator('#stageWrap').bounding_box()
    check(stage is not None, 'desktop stage missing')
    x1, y1 = stage['x'] + 310, stage['y'] + 255
    x2, y2 = x1 + 210, y1 + 115

    page.locator('#toolDock [data-tool-group="shape"]').click()
    page.mouse.move(x1, y1); page.mouse.down(); page.mouse.move(x2, y2, steps=8); page.mouse.up()
    page.wait_for_timeout(180)
    pop = page.locator('#toolPopover')
    check(pop.is_visible(), 'desktop selected shape properties missing')
    check(pop.locator('[data-ann="lineWidth"]').count() > 0, 'desktop selected shape has wrong properties')
    pop_rect = pop.bounding_box()
    check(pop_rect is not None and pop_rect['x'] + pop_rect['width'] <= stage['x'] + 2, f'desktop properties cover canvas: {pop_rect}, stage={stage}')

    # Text uses one matching inline box and does not render a second editable layer.
    page.locator('#toolDock [data-tool-group="text"]').click()
    tx, ty = stage['x'] + 460, stage['y'] + 430
    page.mouse.click(tx, ty)
    editor = page.locator('#inlineTextEditor')
    editor.wait_for(state='visible', timeout=3000)
    r = editor.bounding_box()
    check(r is not None and r['width'] < 200 and r['height'] < 80, f'desktop text editor mismatch: {r}')
    editor.fill('文字上下居中')
    editor.press('Control+Enter')
    page.wait_for_timeout(160)
    check(not editor.is_visible(), 'desktop text editor did not commit')

    controls = page.evaluate("[...document.querySelectorAll('#toolPopover button,#toolPopover input')].map(el=>({h:el.getBoundingClientRect().height,w:el.getBoundingClientRect().width}))")
    check(all(item['h'] <= 34 for item in controls if item['h']), f'desktop property controls are not compact: {controls}')

    page.screenshot(path=str(SCREENSHOT), full_page=True)
    browser.close()

print('browser_desktop_annotation_check ok')
