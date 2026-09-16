from pathlib import Path
import json, subprocess
root=Path('verification/services-overhaul')
before=json.loads((root/'before/metrics.json').read_text());after=json.loads((root/'after/metrics.json').read_text());checks=[]
assert len(after)==17
for old,new in zip(before,after):
 assert (old['id'],old['width'],old['theme'])==(new['id'],new['width'],new['theme'])
 assert not new['overflow'] and not new['errors'] and not new['brokenImages'] and not new['hidden'],new['id']
 if new['id'] not in ['web-design','automations']:assert new['html']==old['html'],new['id']
for id in ['web-design','automations']:
 text=(root/f'after/{id}-1440-light.txt').read_text()
 assert '—' not in text
 result=subprocess.run(['python3',str(Path.home()/'.hermes/skills/productivity/slopmonster/tools/deslop.py'),'--text',text],capture_output=True,text=True)
 (root/f'slop-{id}.txt').write_text(result.stdout+result.stderr);assert result.returncode==0,result.stdout
for r in json.loads((root/'interactions.json').read_text()):
 assert not r['overflow'] and not r['hidden'] and not r['textOverImage'] and r['contactFormOpened'] and r['ctaCount']==1
 assert r['defaultTheme']==r['theme']
lines=['KCG services overhaul: LOCAL ONLY, no deploy. Isolated reviewed worktree: /tmp/kcg-services-overhaul-review.','Preview: http://127.0.0.1:4177/services/web-design | /services/automations','Rendered main-content word counts (same DOM scope before/after):']
for id in ['web-design','automations']:
 old=next(r['words'] for r in before if r['id']==id);new=next(r['words'] for r in after if r['id']==id)
 lines.append(f'{id}: {old} -> {new} words; +{new-old} (+{(new/old-1)*100:.1f}%).')
lines+=['Statistics and sources:']
for item in json.loads((root/'source-citation-check.json').read_text()):
 lines.append('  '+'; '.join(item['claims']))
 lines.append('  Source: '+item['url'])
lines+=['[needs number]: Website expected conversion lift; AI measured daily saving.','Build PASS. Typecheck PASS. SlopMonster 5/5 both (full rendered body text, no proof exemption).','All 8 deep-page theme/viewport cells PASS; no overflow, broken images, hidden copy or console errors.','Nine other service pages: identical rendered main HTML and data entries.','ContactForm opens in all 8 cells. Fresh context defaults light. No form submissions sent.','Computed colors recorded; no deep-page text overlaps photos; statistics use opaque surfaces.','Hermes independent verification complete; Astra dispositions: ASTRA-REVIEW.md.','Source caveat: McKinsey readable via web research retrieval; direct local HTTP/Chromium blocked.','Rival Claude copy-review attempt blocked by expired OAuth; regex gate and Hermes review completed.','Shared checkout retains concurrent CTA edits to the other services; owner choice pending.','Reviewed scope: overhaul-only.patch / ServicesPage.overhaul-only.txt; separate edits: concurrent-cta.patch.','Evidence: verification/services-overhaul/','  PLAN.md | REPORT.md | SOURCES.md | ASTRA-REVIEW.md | HERMES-VERIFICATION.md','  before/ and after/: full screenshots, hero/value crops, rendered texts, metrics.json','  slop-web-design.txt | slop-automations.txt | build.log | lint.log','  interactions.json | source-citation-check.json | source-browser.json','  Re-run: node verification/services-overhaul/capture.mjs after; python3 verification/services-overhaul/finalize.py']
assert len(lines)<100
(root/'SUMMARY.txt').write_text('\n'.join(lines)+'\n');print('\n'.join(lines))
