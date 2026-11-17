import { test, expect } from '@playwright/test';

for (const project of ['winking', 'fusion', 'ai', 'deal']) {
  test(`${project} feedback loops meet dots and labels remain separate in both themes`, async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      await page.goto(`/art/themes/${theme}/${project}-approach.svg`);
      const geometry = await page.evaluate(() => {
        const points = [...document.querySelectorAll('circle')].map(c => ({
          x: c.cx.baseVal.value, y: c.cy.baseVal.value,
          radius: c.r.baseVal.value + parseFloat(c.getAttribute('stroke-width')!) / 2,
        }));
        const endpoints = ['Line_2','Line_4','Line_5','Line_7','Line_8','Line_10'].map((id, i) => {
          const path = document.getElementById(id) as unknown as SVGPathElement;
          const p = path.getPointAtLength(i % 2 ? path.getTotalLength() : 0);
          return { x: p.x, y: p.y };
        });
        const labels = [...document.querySelectorAll('g[id^="Label"]')].map(g => {
          const r = g.getBoundingClientRect();
          return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};
        });
        return { points, endpoints, labels };
      });
      for (const end of geometry.endpoints) {
        const dot = geometry.points.find(p => Math.abs(p.x-end.x)<.01);
        expect(dot, 'connector lands on a dot x coordinate').toBeDefined();
        expect(Math.abs(end.y-(dot!.y-dot!.radius))).toBeLessThan(.01);
      }
      expect(geometry.labels).toHaveLength(3);
      for (let i=0;i<3;i++) for(let j=i+1;j<3;j++) {
        const a=geometry.labels[i], b=geometry.labels[j];
        expect(a.right<=b.x || b.right<=a.x || a.bottom<=b.y || b.bottom<=a.y, 'labels never overlap').toBe(true);
      }
    }
  });
}
