import {setTheme} from './theme-helper';
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { artworkKey, backdrops, themeArtwork } from '../src/lib/adaptive-art';
import sharp from 'sharp';
import { themedNames, explicitThemeArtwork } from '../src/lib/themed-art';

test('project heroes use the available phone width without overflow', async ({ page }) => {
  // Twenty navigations; WebKit runs out of the default 30s when the machine is busy.
  test.setTimeout(process.env.CI ? 300_000 : 90_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 430, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/fx', '/fusion', '/uoaui', '/winking-star', '/deal-model']) {
      await page.goto(route);
      const widths = await page.locator('.project-overview').evaluate(el => ({
        available: el.getBoundingClientRect().width - parseFloat(getComputedStyle(el).paddingLeft) - parseFloat(getComputedStyle(el).paddingRight),
        hero: el.querySelector('.overview-art')!.getBoundingClientRect().width,
      }));
      expect(widths.hero, `${route} at ${width}`).toBeGreaterThanOrEqual(widths.available - 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});

test('transparent images preserve every original byte apart from audited backdrop fills', () => {
  for (const name of themedNames) {
    const original=readFileSync(`public/art/${name}.svg`,'utf8');
    for (const theme of ['light','dark'] as const) {
      const svg=explicitThemeArtwork(original,name,theme);
      expect(svg.replace(/<style>[\s\S]*?<\/style>/,'')).toBe(original);
    }
  }
  for (const directory of ['', 'case-responsive/', 'fusion-responsive/', 'home-responsive/']) {
    for (const file of readdirSync(`public/art/${directory}`)) {
      if (!file.endsWith('.svg') || !backdrops[artworkKey(directory + file)]) continue;
      const original = readFileSync(`public/art/${directory}${file}`, 'utf8');
      const themed = themeArtwork(original, artworkKey(directory + file));
      expect(themed).not.toContain('prefers-color-scheme');
      expect(themed.replace(/data-presentation-backdrop="([^"]+)" fill="none"/g, 'fill="$1"')).toBe(original);
    }
  }
});

test('image surround follows site theme even when the SVG receives a light colour scheme', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.emulateMedia({ reducedMotion:'reduce', colorScheme:'light' });
  await page.goto('/winking-star');
  const consent = page.getByRole('button', { name:'No thanks' });
  if (await consent.isVisible()) await consent.click();
  await setTheme(page,true);
  // Reproduce an embedded browser that does not propagate the document theme to SVG images.
  await page.addStyleTag({ content: '.overview-art{color-scheme:light!important}' });
  const img = page.locator('.overview-art img');
  await img.evaluate(el => (el as HTMLImageElement).decode());
  const dark = await sharp(await img.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
  await setTheme(page,false);
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  const light = await sharp(await img.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const pixel = (r:typeof dark, x:number,y:number) => [...r.data.subarray((y*r.info.width+x)*3,(y*r.info.width+x)*3+3)];
  expect(pixel(dark,1,1)).toEqual([23,27,34]);
  expect(pixel(light,1,1)).toEqual([255,255,255]);
  // Interior of first phone: the screenshot is not recoloured by the site theme.
  const x=Math.round(dark.info.width*.18), y=Math.round(dark.info.height*.3);
  expect(pixel(dark,x,y)).toEqual(pixel(light,x,y));
});

test('next-project previews fill their media column and retain native proportions',async({page})=>{
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/fusion','/winking-star','/fx','/deal-model','/uoaui']){
   await page.goto(route);
   const row=page.locator('.next-case .row');
   const preview=row.locator('.home-artwork');
   const image=preview.locator('img');
   const bounds=(await preview.boundingBox())!;
   const parent=(await row.boundingBox())!;
   expect(bounds.width).toBeGreaterThan(width<=760?parent.width*.95:parent.width*.25);
   const size=await image.evaluate(async(img:HTMLImageElement)=>{img.loading='eager';await img.decode();return {width:img.clientWidth,height:img.clientHeight,nw:img.naturalWidth,nh:img.naturalHeight};});
   expect(Math.abs(size.width-bounds.width)).toBeLessThanOrEqual(1);
   expect(Math.abs(size.width/size.height-size.nw/size.nh)).toBeLessThan(.02);
   if(width<=760){const meta=(await row.locator('.meta').boundingBox())!;expect(bounds.y).toBeGreaterThan(meta.y+meta.height);}
  }
 }
});

test('FX offers an NDA overview and a contact link', async ({ page }) => {
  await page.goto('/fx');
  const article = page.locator('main article');
  await expect(article.getByRole('heading', { name: 'This work is under NDA.' })).toBeVisible();
  await expect(article.getByRole('link', { name: 'on a call' })).toHaveAttribute('href', /^mailto:/);
  await expect(article.getByRole('img')).toHaveCount(1);
  await expect(article.locator('dialog, a[target="_blank"]')).toHaveCount(0);
  await expect(page.locator('a[href*="fx-execution-analytics"]')).toHaveCount(0);
  for (const asset of ['/art/fx-hero-overview.svg', '/media/fx-current.webm', '/art/themes/dark/fx-data-layers.svg']) {
    expect((await page.request.get(asset)).status()).toBe(404);
  }
});
