#!/usr/bin/env python3
"""Real Chromium audit for every mobile annotation group.

The test intentionally uses only public UI interactions and rendered Canvas output.
It does not depend on internal application state.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import Page, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / 'tests' / 'artifacts'
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE = ARTIFACT_DIR / 'annotation-matrix-base.png'

img = Image.new('RGB', (900, 640), 'white')
d = ImageDraw.Draw(img)
for y in range(30, 620, 40):
    d.line((25, y, 875, y), fill=(226, 230, 236), width=2)
d.rectangle((55, 60, 845, 580), outline=(120, 135, 155), width=3)
d.text((90, 82), 'Annotation matrix', fill=(30, 40, 55))
img.save(SAMPLE)

HTML = (ROOT / 'LongShotStitch.html').read_text(encoding='utf-8')


def check(value: bool, message: str) -> None:
    if not value:
        raise AssertionError(message)


def digest_canvas(page: Page) -> str:
    data = page.locator('#editorCanvas').screenshot()
    return hashlib.sha256(data).hexdigest()


def boot(page: Page) -> dict[str, float]:
    page.set_content(HTML, wait_until='load')
    page.locator('#fileInput').set_input_files(str(SAMPLE))
    page.wait_for_function("document.querySelector('#dropHint').style.display === 'none'", timeout=10000)
    page.locator('[data-mobile-section="annotate"]').click()
    page.wait_for_timeout(180)
    stage = page.locator('#stageWrap').bounding_box()
    check(stage is not None, 'stage missing')
    return stage


def group(page: Page, name: str) -> None:
    page.locator(f'#mobileAnnotationTools [data-tool-group="{name}"]').click()
    page.wait_for_timeout(60)


def drag(page: Page, x1: float, y1: float, x2: float, y2: float) -> None:
    page.mouse.move(x1, y1)
    page.mouse.down()
    for i in range(1, 7):
        t = i / 6
        page.mouse.move(x1 + (x2-x1)*t, y1 + (y2-y1)*t)
    page.mouse.up()
    page.wait_for_timeout(180)


def open_selected_properties(page: Page, x: float, y: float, expected_selector: str, label: str) -> None:
    active = page.locator('#mobileAnnotationTools [data-tool-group="select"]').evaluate("el => el.classList.contains('active')")
    if not active:
        group(page, 'select')
    # Newly created objects remain selected. One stationary tap explicitly opens properties.
    page.mouse.click(x, y)
    page.wait_for_timeout(160)
    pop = page.locator('#toolPopover')
    check(pop.is_visible(), f'{label}: selected-object properties did not open')
    check(pop.locator(expected_selector).count() > 0, f'{label}: wrong or missing matching properties ({expected_selector})')
    check(pop.locator('#duplicateAnnotationBtnFloat').count() == 1, f'{label}: duplicate action missing')
    check(pop.locator('#deleteAnnotationBtnFloat').count() == 1, f'{label}: delete action missing')
    rect = pop.bounding_box()
    check(rect is not None and rect['x'] >= -1 and rect['x'] + rect['width'] <= 391, f'{label}: properties overflow viewport')


with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/usr/bin/chromium',
        args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    )
    context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, has_touch=True, is_mobile=True)
    page = context.new_page()

    # Shape
    boot(page); before = digest_canvas(page); group(page, 'shape'); drag(page, 80, 350, 225, 430)
    check(digest_canvas(page) != before, 'shape: drawing did not change Canvas')
    open_selected_properties(page, 150, 390, '[data-ann="lineWidth"]', 'shape')

    # Pen
    boot(page); before = digest_canvas(page); group(page, 'pen'); drag(page, 75, 390, 250, 475)
    check(digest_canvas(page) != before, 'pen: drawing did not change Canvas')
    open_selected_properties(page, 165, 433, '[data-ann="lineWidth"]', 'pen')

    # Arrow
    boot(page); before = digest_canvas(page); group(page, 'arrow'); drag(page, 85, 360, 260, 470)
    check(digest_canvas(page) != before, 'arrow: drawing did not change Canvas')
    open_selected_properties(page, 170, 415, '[data-ann="lineWidth"]', 'arrow')

    # Badge
    boot(page); before = digest_canvas(page); group(page, 'badge'); page.mouse.click(180, 420); page.wait_for_timeout(180)
    check(digest_canvas(page) != before, 'badge: creation did not change Canvas')
    open_selected_properties(page, 185, 425, '[data-ann="text"]', 'badge')

    # Mosaic
    boot(page); before = digest_canvas(page); group(page, 'mosaic'); drag(page, 95, 365, 245, 455)
    check(digest_canvas(page) != before, 'mosaic: drawing did not change Canvas')
    open_selected_properties(page, 170, 410, '[data-ann="gridSize"]', 'mosaic')

    # Watermark
    boot(page); before = digest_canvas(page); group(page, 'watermark'); page.mouse.click(165, 420); page.wait_for_timeout(180)
    check(digest_canvas(page) != before, 'watermark: creation did not change Canvas')
    open_selected_properties(page, 180, 425, '[data-ann="text"]', 'watermark')

    # Marquee selection -> editable patch object.
    boot(page); before = digest_canvas(page); group(page, 'marquee'); drag(page, 75, 355, 220, 435); page.wait_for_timeout(500)
    check(digest_canvas(page) != before, 'marquee: selection did not create a transformable patch')
    open_selected_properties(page, 145, 395, '[data-ann="opacity"]', 'marquee patch')

    # Local eraser changes an existing pen stroke instead of deleting the whole object on first contact.
    boot(page); group(page, 'pen'); drag(page, 70, 410, 270, 410); after_pen = digest_canvas(page)
    group(page, 'eraser'); drag(page, 160, 385, 160, 435); after_erase = digest_canvas(page)
    check(after_erase != after_pen, 'eraser: local stroke did not change Canvas')

    # Text is covered by the dedicated mobile interaction test; here verify the group remains available.
    boot(page); group(page, 'text'); page.mouse.click(150, 410)
    page.locator('#inlineTextEditor').wait_for(state='visible', timeout=3000)
    check(page.locator('#inlineTextEditor').bounding_box()['width'] < 240, 'text: editor is not compact')
    page.locator('#inlineTextEditor').press('Escape')

    browser.close()

print('browser_annotation_matrix_check ok')
