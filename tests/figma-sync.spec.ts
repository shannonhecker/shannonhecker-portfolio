import {setTheme} from './theme-helper';
import { test, expect } from '@playwright/test';

test('all fifteen personas retain the approved card hierarchy across screen sizes',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [route,count] of [['/fx',3],['/fusion',3],['/uoaui',2],['/winking-star',3],['/deal-model',4]] as const){
    await page.goto(route);
    await setTheme(page,false);
    const cards=page.locator('.persona-card');
    await expect(cards).toHaveCount(count);
    const portraits=cards.locator('.persona-art img');
    await expect(portraits).toHaveCount(count);
    await portraits.evaluateAll(async nodes=>{
      await Promise.all(nodes.map(async node=>{
        const image=node as HTMLImageElement;
        image.loading='eager';
        await image.decode();
      }));
    });
    for(const width of [320,390,820,1440]){
      await page.setViewportSize({width,height:900});
      const rendered=await cards.evaluateAll(nodes=>nodes.map(card=>{
        const identity=card.querySelector('.persona-identity')!;
        const content=card.querySelector('.persona-content')!;
        const frame=card.querySelector('.persona-art')!;
        const image=frame.querySelector('img')!;
        const panel=card.querySelector('.persona-response')!;
        const bounds=card.getBoundingClientRect();
        const rect=(el:Element)=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
        const text=Array.from(card.querySelectorAll('h4,h5,p,li'));
        const clipped=text.filter(el=>{
          const range=document.createRange();range.selectNodeContents(el);
          return Array.from(range.getClientRects()).some(r=>r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1);
        }).map(el=>el.textContent);
        return {
          card:rect(card),innerWidth:card.clientWidth,identity:rect(identity),content:rect(content),frame:rect(frame),image:rect(image),
          loaded:image.complete&&image.naturalWidth>0&&image.naturalHeight>0,
          fit:getComputedStyle(image).objectFit,surface:getComputedStyle(card).backgroundColor,
          portraitSurface:getComputedStyle(frame).backgroundColor,identitySurface:getComputedStyle(identity).backgroundColor,
          accent:getComputedStyle(panel).backgroundColor,
          heading:getComputedStyle(card.querySelector('h4')!).color,
          context:getComputedStyle(card.querySelector('.persona-context h5')!).color,
          quote:getComputedStyle(card.querySelector('blockquote>span')!).color,
          panelText:getComputedStyle(panel).color,clipped,
        };
      }));
      for(const card of rendered){
        expect(card.loaded,`${route}: portrait decoded at ${width}px`).toBe(true);
        expect(card.fit).toBe('contain');
        expect(card.frame.width).toBeGreaterThanOrEqual(100);
        expect(card.frame.height).toBeGreaterThanOrEqual(150);
        expect(card.image.width).toBeLessThanOrEqual(card.frame.width+1);
        expect(card.image.height).toBeLessThanOrEqual(card.frame.height+1);
        expect(card.surface).toBe('rgb(255, 255, 255)');
        expect(card.portraitSurface).toBe(card.accent);
        expect(card.identitySurface).toBe(card.surface);
        expect(card.accent).not.toBe(card.surface);
        expect(card.heading).toBe(card.accent);
        expect(card.context).toBe(card.accent);
        expect(card.quote).toBe(card.accent);
        expect(card.panelText).toBe('rgb(255, 255, 255)');
        expect(card.clipped,`${route}: text remains inside the visible card at ${width}px`).toEqual([]);
        expect(card.card.x).toBeGreaterThanOrEqual(0);
        expect(card.card.right).toBeLessThanOrEqual(width+1);
        if(width<=390){
          expect(card.content.y).toBeGreaterThanOrEqual(card.identity.bottom-1);
          expect(Math.abs(card.content.width-card.innerWidth)).toBeLessThanOrEqual(1);
        }else{
          expect(card.content.x).toBeGreaterThanOrEqual(card.identity.right-1);
          expect(card.content.width).toBeGreaterThan(card.identity.width);
        }
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    const before=await cards.evaluateAll(nodes=>nodes.map(card=>getComputedStyle(card).backgroundColor));
    await setTheme(page,await page.locator('html').getAttribute('data-theme')!=='dark');
    const dark=await cards.evaluateAll(nodes=>nodes.map(card=>({
      surface:getComputedStyle(card).backgroundColor,
      portrait:getComputedStyle(card.querySelector('.persona-art')!).backgroundColor,
      panel:getComputedStyle(card.querySelector('.persona-response')!).backgroundColor,
      heading:getComputedStyle(card.querySelector('h4')!).color,
      filter:getComputedStyle(card.querySelector('img')!).filter,
    })));
    expect(new Set(dark.map(card=>card.panel)).size).toBe(count);
    dark.forEach((card,index)=>{
      expect(card.surface).not.toBe(before[index]);
      expect(card.portrait).toBe(card.panel);
      expect(card.heading).toBe(card.panel);
      expect(card.filter).toBe('none');
    });
    await setTheme(page,await page.locator('html').getAttribute('data-theme')!=='dark');
  }
});

test('FX data layers preserve the four authored branches at every width',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/fx');
  await page.getByRole('button',{name:'No thanks'}).click();
  const diagram=page.locator('.fx-source-layers img:visible');
  await expect(diagram).toBeVisible();
  await expect(diagram).toHaveAttribute('src','/art/themes/dark/fx-data-layers.svg');
  await expect(page.locator('.fx-source-layers details')).toHaveCount(0);
  for(const width of [320,390,820,1440]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(diagram).toBeVisible();
  }
});

test('FX comparisons use the authored charts and stay readable on phones', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/fx');
  const charts=page.locator('#fx-decision-map .authored-image-link img');
  await expect(charts).toHaveCount(6);
  for (const width of [390,1440,1920]) {
    await page.setViewportSize({width,height:900});
    // A viewport change can replace srcset while decode is pending. Retry the
    // current source; permanently invalid images still fail the assertion.
    await expect.poll(()=>charts.evaluateAll(async images=>(await Promise.all(images.map(async el=>{const im=el as HTMLImageElement;im.loading='eager';try{await im.decode();return im.complete&&im.naturalWidth>0;}catch{return false;}}))).every(Boolean))).toBe(true);
    await expect.poll(()=>charts.evaluateAll(images=>images.every(el=>el.getBoundingClientRect().width>=300&&(el as HTMLImageElement).naturalWidth>0))).toBe(true);
    const sizes=await charts.evaluateAll(images=>images.map(el=>({width:el.getBoundingClientRect().width})));
    if(width>=1440){
      expect(sizes.every(s=>s.width<width*.36)).toBe(true);
      const chart=(await page.locator('#fx-decision-map .authored-choice-pair .authored-image-link').first().boundingBox())!;
      const explanation=(await page.locator('#fx-decision-map .authored-decision-reason').first().boundingBox())!;
      expect(Math.abs(chart.x-explanation.x)).toBeLessThan(1);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await expect(page.locator('#fx-decision-map .authored-decision-list>li')).toHaveCount(3);
  await expect(page.locator('#fx-decisions .dec')).toHaveCount(0);
});

test('Deal Model is reachable from selected work and retains its evidence on mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/panel');
  await page.getByRole('button', { name: 'No thanks' }).click();
  await page.locator('#work a[href="/deal-model"]').click();
  await expect(page.getByRole('heading', { name: 'Deal Model', exact: true })).toBeVisible();
  await expect(page.locator('.deal-screen-gallery figure')).toHaveCount(13);
  await expect(page.locator('#deal-outcome')).toContainText('not a measured study');
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.locator('.section-open').click();
    await page.getByRole('navigation', { name: 'Case study sections' }).getByRole('link', { name: 'Product screens', exact: true }).click();
    await expect(page.locator('#deal-screens')).toBeInViewport();
  }
});

test('updated authored evidence loads without clipping and mobile identities stay readable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/fx', '/fusion', '/uoaui', '/winking-star', '/deal-model']) {
    await page.goto(route);
    const consent=page.getByRole('button', { name: 'No thanks' });
    if(await consent.isVisible()) await consent.click();
    const images = page.locator('.authored-image-link img, .persona-art img, .fx-persona-portrait img');
    expect(await images.count()).toBeGreaterThan(0);
    await images.evaluateAll(async elements => {
      await Promise.all(elements.map(async el => { const image=el as HTMLImageElement; image.loading='eager'; await image.decode(); }));
    });
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const clipped = await page.locator('.persona-copy, .authored-persona-needs, .authored-decision-reason, .product-journey .journey-detail, .blueprint-system').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth+1).map(el => el.textContent?.slice(0,80)));
      expect(clipped).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width===390 || width===1440) {
        const persona=page.locator('.authored-persona, .fx-persona').first();
        await persona.evaluate(el=>el.scrollIntoView({block:"start"}));
        await testInfo.attach(`${route.slice(1)}-persona-${width}`, { body:await page.screenshot({path:testInfo.outputPath(`${route.slice(1)}-persona-${width}.png`)}),contentType:'image/png' });
      }
    }
  }
});


test('animated chapter jumps clear the sticky header', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/deal-model');
  await page.getByRole('button',{name:'No thanks'}).click();
  await page.locator('.section-open').click();
  await page.getByRole('navigation',{name:'Case study sections'}).getByRole('link',{name:'Decision map',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Decision map',exact:true})).toBeInViewport();
  await page.locator('#deal-decisions').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});
  const heading=(await page.getByRole('heading',{name:'Decision map',exact:true}).boundingBox())!;
  const nav=(await page.locator('.nav').boundingBox())!;
  expect(heading.y).toBeGreaterThanOrEqual(nav.y+nav.height);
  await expect(page.locator('.decision-index a')).toHaveCount(6);
  await expect(page.locator('#deal-decision-map')).toBeVisible();
});
