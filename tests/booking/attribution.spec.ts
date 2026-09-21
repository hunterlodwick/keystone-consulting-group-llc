import { test, expect } from '@playwright/test';

for (const scenario of [
  { path: '/services/automations', variant: 'modal', label: 'Book a Call', referrer: 'https://google.com/search?q=kcg', utm: '?utm_source=google&utm_campaign=fall&unrelated=discard' },
  { path: '/services/automations', variant: 'modal', label: 'Synthetic arbitrary CTA', referrer: '', utm: '' },
  { path: '/work', variant: 'modal', label: 'Book a Call', referrer: '', utm: '' },
  { path: '/', variant: 'inline', label: 'Pick a time with Seth', referrer: 'https://linkedin.com/feed', utm: '?utm_medium=social' },
] as const) {
  test(`attribution ${scenario.path} ${scenario.variant} ${scenario.label}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const day = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const slot = { start: `${day}T15:00:00-06:00`, end: `${day}T15:30:00-06:00` };
    await page.route('**/api/booking/slots**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'x-booking-mode': 'dry-run' }, body: JSON.stringify({ tz: 'America/Denver', days: [{ date: day, slots: [slot] }] }) }));
    let posted: Record<string, string> | undefined;
    await page.route('**/api/booking/book', async route => {
      posted = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'x-booking-mode': 'dry-run' }, body: JSON.stringify({ ok: true, ...slot }) });
    });
    await page.goto(scenario.path + scenario.utm, scenario.referrer ? { referer: scenario.referrer } : {});
    if (scenario.variant === 'modal') {
      const trigger = page.locator('header').getByRole('button', { name: 'Book a Call', exact: true });
      // Synthetic label fixture proves capture does not rely on a hardcoded CTA list.
      if (scenario.label === 'Synthetic arbitrary CTA') {
        await trigger.evaluate((button, label) => { button.textContent = label; }, scenario.label);
        await page.locator('header').getByRole('button', { name: scenario.label }).click();
      } else {
        await trigger.focus();
        await page.keyboard.press('Enter');
      }
    }
    const widget = scenario.variant === 'modal' ? page.getByRole('dialog') : page.locator('#book-a-call');
    await widget.getByRole('radio').first().click();
    await widget.getByRole('button', { name: 'Continue', exact: true }).click();
    await widget.getByLabel('Name', { exact: true }).fill('Attribution Browser Test');
    await widget.getByLabel('Email', { exact: true }).fill('attribution@example.com');
    await widget.getByRole('button', { name: 'Book this time', exact: true }).click();
    await expect.poll(() => posted).toBeTruthy();
    expect(posted).toMatchObject({ kcgPage: scenario.path, kcgCta: scenario.label, kcgReferrer: scenario.referrer ? new URL(scenario.referrer).hostname : 'direct', kcgWidget: scenario.variant });
    const utm = [...new URLSearchParams(scenario.utm)].filter(([key]) => key.startsWith('utm_'));
    expect(posted?.kcgUtm).toBe(utm.length ? new URLSearchParams(utm).toString() : undefined);
    expect(posted?.kcgBookedAt).toBeUndefined();
    expect(posted?.kcgSource).toBeUndefined();
  });
}
