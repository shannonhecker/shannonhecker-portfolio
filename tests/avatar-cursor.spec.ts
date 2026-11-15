import {test,expect} from '@playwright/test';

test('avatar cursor follows the pointer, changes outfit by page and yields to native controls',async({page})=>{
 await page.goto('/fx');
 await page.mouse.move(700,400);
 await expect(page.locator('.avatar-cursor')).toBeAttached();
 await page.mouse.move(780,450,{steps:5});
 await expect(page.locator('.avatar-cursor')).toHaveAttribute('data-visible','true');
 await expect(page.locator('.avatar-cursor')).toHaveAttribute('data-outfit','desk');
 await expect(page.locator('html')).toHaveClass(/avatar-cursor-active/);
 await page.keyboard.press('Tab');
 await expect(page.locator('html')).not.toHaveClass(/avatar-cursor-active/);
 await page.goto('/fusion');
 const consent=page.getByRole('button',{name:'No thanks'});if(await consent.isVisible())await consent.click();
 await page.mouse.move(700,400);
 await expect(page.locator('.avatar-cursor')).toHaveAttribute('data-outfit','tower');
 await page.mouse.move(780,450);
 await page.locator('[data-avatar-cursor-toggle]').click();
 await expect(page.locator('html')).not.toHaveClass(/avatar-cursor-active/);
 await page.reload();await page.mouse.move(600,300);
 await expect(page.locator('[data-avatar-cursor-toggle]')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('.avatar-cursor')).toHaveCount(0);
});

test('reduced motion keeps native cursors and skips route choreography',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/panel');
 await page.mouse.move(600,300);await page.mouse.move(700,400);
 await expect(page.locator('.avatar-cursor')).toHaveCount(0);
 await expect(page.locator('[data-avatar-cursor-toggle]')).toBeHidden();
 await page.getByRole('link',{name:'FX',exact:true}).click();
 await expect(page).toHaveURL(/\/fx$/);
 await expect(page.locator('h1')).toBeVisible();
 await expect(page.locator('html')).not.toHaveClass(/page-departing/);
});

test('page transitions finish and browser back restores usable content',async({page})=>{
 await page.goto('/panel');
 await page.getByRole('link',{name:'FX',exact:true}).click();
 await expect(page).toHaveURL(/\/fx$/);
 await page.waitForFunction(()=>!document.documentElement.matches(':active-view-transition'));
 await expect(page.locator('h1')).toHaveCSS('opacity','1');
 await page.goBack();
 await expect(page).toHaveURL(/\/panel$/);
 await page.waitForFunction(()=>!document.documentElement.matches(':active-view-transition'));
 await expect(page.locator('html')).not.toHaveClass(/page-departing/);
 await expect(page.locator('h1')).toBeVisible();
});

test('landing greeting uses registered poses and stops immediately when paused',async({page})=>{
 await page.goto('/panel');
 const companion=page.locator('.landing-companion');
 await expect(companion).toHaveAttribute('data-pose','wave');
 await expect(page.locator('.greeting-wave')).toBeVisible();
 await expect(page.locator('.idle-open')).toBeHidden();
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 await expect(companion).not.toHaveAttribute('data-intro','true');
 await expect(page.locator('.idle-open')).toBeVisible();
 await expect(page.locator('.greeting-wave')).toBeHidden();
 await page.getByRole('button',{name:'Resume motion',exact:true}).click();
 await expect(companion).not.toHaveAttribute('data-intro','true');
});

test('avatar repeats her greeting while visible and responds to a fresh pointer visit',async({page})=>{
 await page.goto('/panel');
 const companion=page.locator('.landing-companion');
 await expect(companion).toHaveAttribute('data-pose','wave',{timeout:8000});
 await expect(page.locator('.greeting-hand')).toHaveCSS('animation-name','companion-wave');
 await expect(companion).not.toHaveAttribute('data-pose','wave',{timeout:8000});
 await expect(companion).toHaveAttribute('data-pose','wave',{timeout:14000});
 await expect(companion).not.toHaveAttribute('data-intro','true');
 await expect(companion).not.toHaveAttribute('data-pose',/.+/,{timeout:8000});
 const bounds=(await page.locator('.companion-stage').boundingBox())!;
 await page.mouse.move(0,0);await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
 await expect(companion).toHaveAttribute('data-pose','wave');
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 await expect(page.locator('.greeting-hand')).toBeHidden();
});

test('landing copy finishes before the scene appears, followed by the avatar',async({page})=>{
 await page.goto('/panel');
 const stages=await page.evaluate(()=>new Promise<string[]>(resolve=>{
  const seen:string[]=[];const started=performance.now();
  const sample=()=>{
   const copy=document.querySelector('.explore-work')!;
   const scene=document.querySelector('.companion-stage')!;
   const avatar=document.querySelector('.companion-avatar')!;
   if(Number(getComputedStyle(copy).opacity)>.99&&!seen.includes('copy'))seen.push('copy');
   if(Number(getComputedStyle(scene,'::before').opacity)>.05&&!seen.includes('scene'))seen.push('scene');
   if(Number(getComputedStyle(avatar).opacity)>.05&&!seen.includes('avatar'))seen.push('avatar');
   if(seen.length===3||performance.now()-started>6000)resolve(seen);else requestAnimationFrame(sample);
  };sample();
 }));
 expect(stages).toEqual(['copy','scene','avatar']);
});
