import { test, expect } from '@playwright/test';

test('case content keeps one column and screenshots stay within it', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const route of ['/fx','/fusion','/winking-star','/deal-model','/uoaui']) {
    await page.goto(route);
    for (const width of [390,1440,2560]) {
      await page.setViewportSize({width,height:1000});
      const layout=await page.locator('.beat .body').evaluateAll(bodies=>bodies.map(body=>{
        const rect=body.getBoundingClientRect();
        return {width:rect.width, children:[...body.children].filter(child=>child.getClientRects().length>0).map(child=>{
          const r=child.getBoundingClientRect();return {left:r.left-rect.left,right:r.right-rect.right};
        })};
      }));
      for(const body of layout) {
        expect(body.width).toBeLessThanOrEqual(1041);
        for(const child of body.children){expect(child.left).toBeGreaterThanOrEqual(-1);expect(child.right).toBeLessThanOrEqual(1);}
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await expect(page.getByText('View full size',{exact:true})).toHaveCount(0);
    await expect(page.getByText('Open live product',{exact:true})).toHaveCount(0);
  }
  await page.goto('/fx');
  await page.setViewportSize({width:1440,height:1000});
  const alignment=await page.locator('#fx-problem').evaluate(el=>({
    row:el.querySelector('.rows p')!.getBoundingClientRect().left,
    status:el.querySelector('.project-status p')!.getBoundingClientRect().left,
    rowWidth:el.querySelector('.rows')!.getBoundingClientRect().width,
    statusWidth:el.querySelector('.project-status')!.getBoundingClientRect().width,
  }));
  expect(Math.abs(alignment.row-alignment.status)).toBeLessThan(1);
  expect(Math.abs(alignment.rowWidth-alignment.statusWidth)).toBeLessThan(1);
});

test('Winking Star uses the shared case typography and content alignment', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:1000});
    for (const theme of ['light','dark']) {
      const styles = [];
      for (const route of ['/fusion','/winking-star']) {
        await page.goto(route);
        await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
        styles.push(await page.evaluate(()=>['.chapter-head h1','.beat .h-sub','.beat .rows b'].map(selector=>{
          const style=getComputedStyle(document.querySelector(selector)!);
          return {font:style.fontFamily,size:style.fontSize,weight:style.fontWeight,line:style.lineHeight,colour:style.color};
        })));
      }
      expect(styles[1]).toEqual(styles[0]);
      const positions=await page.evaluate(()=>{
        const reference=document.querySelector('#ws-problem .body')!.getBoundingClientRect();
        return [...document.querySelectorAll('#ws-hero .body > *,#ws-personas .body > .art-note')].map(el=>{
          const rect=el.getBoundingClientRect();return {left:rect.left-reference.left,right:rect.right-reference.right};
        });
      });
      for (const position of positions) {
        expect(Math.abs(position.left)).toBeLessThan(1);
        expect(position.right).toBeLessThanOrEqual(1);
      }
      await expect(page.locator('.chapter-head .meta a')).toHaveCount(2);
      await expect(page.locator('.wrap > .art-note')).toHaveCount(0);
    }
  }
});
