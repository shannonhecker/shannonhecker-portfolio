import { test, expect } from '@playwright/test';
import { projectOverviews } from '../src/lib/project-overviews';

for (const [path, project] of Object.entries(projectOverviews)) {
  test(`${path} presents one concise project overview`, async ({ page }) => {
    await page.goto(path);
    const article = page.locator('main article');
    await expect(article.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(article).toContainText(project.contribution);
    await expect(article).toContainText(project.outcome);
    expect((await article.innerText()).trim().split(/\s+/).length).toBeLessThan(120);
    await expect(article.locator('.overview-art img').first()).toBeVisible();
    await expect(page.locator('.case-contents, .beat, .process-personas, .decision-map')).toHaveCount(0);
    for (const link of project.links) {
      await expect(article.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
    }
    await expect(article.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/work');
  });
}
