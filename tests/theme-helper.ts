import type {Page} from '@playwright/test';

// Use the same appearance control a visitor uses, including the mobile drawer.
export async function setTheme(page:Page,dark:boolean){
 const menu=page.getByRole('button',{name:'Menu',exact:true});
 const opened=await menu.isVisible();
 if(opened)await menu.click();
 await page.getByRole('switch',{name:'Dark mode'}).setChecked(dark);
 if(opened)await page.getByRole('button',{name:'Close menu',exact:true}).click();
}
