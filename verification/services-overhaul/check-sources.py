from pathlib import Path
import json, urllib.request, concurrent.futures
urls={
'https://developers.google.com/search/docs/appearance/core-web-vitals':['LCP within 2.5 seconds','INP under 200 milliseconds','CLS under 0.1'],
'https://www.thinkwithgoogle.com/_qs/documents/6522/TwG_AUNZ_Masters_of_Mobile_Report.pdf':['53% leave mobile pages loading longer than 3 seconds','20% conversion drop per extra second','Derived: 1 - 20/100 = 0.80 = 80% remaining'],
'https://cdn.openai.com/pdf/7ef17d82-96bf-4dd1-9df2-228f7f377a29/the-state-of-enterprise-ai_2025-report.pdf':['40–60 minutes saved per active day, self-reported','Derived, assuming 5 days: 40–60 × 5 = 200–300 minutes; ÷ 60 = 3h20m–5h/week'],
'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-promise-and-the-reality-of-gen-ai-agents-in-the-enterprise':['5,000 support agents','14% more issues resolved/hour','Derived: 1 + 14/100 = 1.14 × baseline issues/hour']}
def check(item):
 url,claims=item
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=40) as r:
   data=r.read();return dict(url=url,status=r.status,final_url=r.url,bytes=len(data),claims=claims)
 except Exception as e:return dict(url=url,error=str(e),claims=claims)
with concurrent.futures.ThreadPoolExecutor() as pool:r=list(pool.map(check,urls.items()))
Path('verification/services-overhaul/source-citation-check.json').write_text(json.dumps(r,indent=2,ensure_ascii=False));print(json.dumps(r,indent=2,ensure_ascii=False))
