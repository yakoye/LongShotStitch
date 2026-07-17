#!/usr/bin/env python3
import json
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / 'tests' / 'artifacts'
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE = ARTIFACT_DIR / 'mobile-test-base.png'
SCREENSHOT = ARTIFACT_DIR / 'mobile-annotation-v1.47.0.png'
PROPERTY_SCREENSHOT = ARTIFACT_DIR / 'mobile-properties-v1.47.0.png'

img = Image.new('RGB', (900, 640), 'white')
d = ImageDraw.Draw(img)
for y in range(40, 620, 52):
    d.line((35, y, 865, y), fill=(220, 225, 232), width=2)
d.rectangle((80, 90, 820, 540), outline=(110, 130, 160), width=3)
d.text((120, 125), 'LongShotStitch mobile annotation test', fill=(30, 40, 55))
img.save(SAMPLE)


def assert_true(value, message):
    if not value:
        raise AssertionError(message)


with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/usr/bin/chromium',
        args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--allow-file-access-from-files'],
    )
    context = browser.new_context(
        viewport={'width': 390, 'height': 844},
        device_scale_factor=1,
        has_touch=True,
        is_mobile=True,
    )
    page = context.new_page()
    page.set_content((ROOT / 'LongShotStitch.html').read_text(encoding='utf-8'), wait_until='load')
    page.locator('#fileInput').set_input_files(str(SAMPLE))
    page.wait_for_function("document.querySelector('#dropHint').style.display === 'none'", timeout=10000)
    page.locator('[data-mobile-section="annotate"]').click()
    page.wait_for_timeout(250)

    order = page.locator('#mobileAnnotationTools [data-tool-group]').evaluate_all(
        "els => els.map(el => el.dataset.toolGroup)"
    )
    expected = ['select','marquee','shape','pen','arrow','text','badge','mosaic','eraser','watermark']
    assert_true(order == expected, f'mobile tool order mismatch: {order}')

    for group in expected[1:]:
        btn = page.locator(f'#mobileAnnotationTools [data-tool-group="{group}"]')
        btn.click()
        btn.click()
        page.wait_for_timeout(80)
        pop = page.locator('#toolPopover')
        assert_true(pop.is_visible(), f'{group} property popover did not open')
        rect = pop.bounding_box()
        assert_true(rect is not None, f'{group} popover has no bounds')
        assert_true(rect['x'] >= -1 and rect['x'] + rect['width'] <= 391, f'{group} popover overflows horizontally: {rect}')
        assert_true(rect['y'] >= 0 and rect['y'] + rect['height'] <= 844, f'{group} popover overflows vertically: {rect}')
        assert_true(rect['height'] <= 236, f'{group} popover too tall: {rect}')
        btn.click()

    stage = page.locator('#stageWrap').bounding_box()
    assert_true(stage is not None, 'stage missing')
    tx = stage['x'] + stage['width'] * 0.31
    ty = stage['y'] + stage['height'] * 0.50

    page.locator('#mobileAnnotationTools [data-tool-group="text"]').click()
    page.mouse.click(tx, ty)
    editor = page.locator('#inlineTextEditor')
    editor.wait_for(state='visible', timeout=3000)
    editor_rect = editor.bounding_box()
    assert_true(editor_rect is not None, 'text editor bounds missing')
    assert_true(editor_rect['width'] < 220, f'text editor too wide: {editor_rect}')
    assert_true(editor_rect['height'] < 90, f'text editor too tall: {editor_rect}')
    style = editor.evaluate("el => ({position:getComputedStyle(el).position, boxSizing:getComputedStyle(el).boxSizing})")
    assert_true(style['position'] == 'absolute', f'text editor must be absolute: {style}')
    assert_true(style['boxSizing'] == 'border-box', f'text editor box sizing mismatch: {style}')
    text_x = editor_rect['x'] + editor_rect['width'] / 2
    text_y = editor_rect['y'] + editor_rect['height'] / 2
    editor.fill('输入文字')
    editor.press('Control+Enter')
    page.wait_for_timeout(180)
    assert_true(not editor.is_visible(), 'text editor did not close after commit')

    page.locator('#mobileAnnotationTools [data-tool-group="select"]').click()
    blank_x = stage['x'] + stage['width'] * 0.8
    blank_y = stage['y'] + stage['height'] * 0.75
    page.mouse.click(blank_x, blank_y)
    page.wait_for_timeout(80)
    page.mouse.click(text_x, text_y)
    page.wait_for_timeout(100)
    assert_true(not page.locator('#toolPopover').is_visible(), 'first tap must not cover the object with properties')
    page.mouse.click(text_x, text_y)
    page.wait_for_timeout(140)
    assert_true(page.locator('#toolPopover').is_visible(), 'second tap must open selected-object properties')
    text_pop = page.locator('#toolPopover').inner_text()
    assert_true('层' in text_pop, 'selected text did not show its matching properties')
    assert_true(page.locator('#toolPopover [data-edit-text]').count() == 1, 'explicit text edit action missing')
    page.screenshot(path=str(PROPERTY_SCREENSHOT), full_page=True)

    page.locator('#hideToolPopoverBtnFloat').click()
    page.mouse.dblclick(text_x, text_y, delay=100)
    editor.wait_for(state='visible', timeout=3000)
    editor_rect2 = editor.bounding_box()
    assert_true(editor_rect2 and editor_rect2['width'] < 240 and editor_rect2['height'] < 100,
                f'double-click text editor is not compact: {editor_rect2}')
    editor.press('Escape')

    layout = page.evaluate("({sw:document.documentElement.scrollWidth, iw:innerWidth, buttons:[...document.querySelectorAll('#mobileAnnotationTools .mobile-tool-group')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))})")
    assert_true(layout['sw'] <= layout['iw'], f'page horizontal overflow: {layout}')
    assert_true(all(b['w'] >= 44 and b['h'] >= 44 for b in layout['buttons']), f'mobile touch targets too small: {layout}')

    page.screenshot(path=str(SCREENSHOT), full_page=True)
    browser.close()

print('browser_mobile_annotation_check ok')
print(json.dumps({'screenshot': str(SCREENSHOT), 'sample': str(SAMPLE)}, ensure_ascii=False))
