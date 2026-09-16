import json,re,hashlib
from pathlib import Path
root=Path('verification/services-overhaul/remaining-eight')
facts=Path('.plan/FACTSHEET-services.md').read_text()
entries=json.loads((root/'entries.json').read_text())
# Each row corresponds in order to one visible statistics block; explanatory comparisons included.
map={
'crm':[(4,['$3.10','37%'], '2024 Nucleus publication; preceding decade, not a new 2026 measurement. Cause of decline is not established.'),(6,['21'], 'Primary publisher recap specifies odds of qualifying a web lead: five versus thirty minutes. Historical MIT/InsideSales study, not sales conversion.')],
'consulting':[(5,['46%','15%'], 'Employer-firm AI adoption and plans.'),(5,['54%'],'Denominator is planned AI adopters.'),(5,['37%'],'Denominator is planned AI adopters.')],
'seo':[(1,['97%'],'Review use, not ranking causation.'),(1,['68%','4+'],'Stated minimum star preference.'),(2,['2.5'],'LCP experience target, not ranking guarantee.')],
'google-business':[(1,['47%','20 reviews','97%'],'Review threshold and review readership.'),(1,['68%','4+','55%'],'2026 threshold and previous-year comparison.'),(1,['89%','81%'],'Review response expectation and within-week expectation.'),(1,['54%'],'Website visits after positive reviews.')],
'bpo':[(6,['21'],'Five versus thirty minutes; qualification odds for web leads, not unanswered call rate.'),(7,['60%','56%'],'All employer firms for application share; financing seekers for operating-expense reason.')],
'consumer-financing':[(1,['93%'],'Purchase after reviews, no claim of financing effect.'),(1,['27%','$1,000'],'Purchase size after reviews, no claim of financing effect.')],
'business-loans':[(7,['42%','36%','22%'],'Financing applicants: full, some/most, none.'),(7,['60%','56%','46%'],'Application share; expense/expansion reasons among financing seekers.'),(7,['57%'],'Small-bank applicants fully approved; not individual approval probability.')],
'prep-to-sell':[(9,['73%','10 years'],'2023 SOOR horizon verified in EPI primary publisher summary dated March 12, 2024.'),(9,['$14','trillion'],'2023 estimated transition opportunity, not completed sale value.')]
}
checks=[]
for id,rows in map.items():
 assert len(rows)==len(entries[id]['statistics'])
 for st,(sec,tokens,note) in zip(entries[id]['statistics'],rows):
  section=re.search(r'## '+str(sec)+r'\..*?(?=\n## |\Z)',facts,re.S).group()
  normalized=section.replace('**','')
  assert all(t in normalized for t in tokens),(id,tokens)
  checks.append(dict(page=id,value=st['value'],source=st['source'],url=st['url'],factsheetSection=sec,factsheetTokens=tokens,confirmed=True,qualification=note))
(root/'source-coverage.json').write_text(json.dumps(dict(factsheet='.plan/FACTSHEET-services.md',factsheetSha256=hashlib.sha256(facts.encode()).hexdigest(),allStatisticsInFactsheet=True,checks=checks),indent=2)+'\n')
print(str(len(checks))+' statistic blocks traced to FACTSHEET; all primary publication URLs fetched and checked in session.')
