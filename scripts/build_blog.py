"""Build the blog index, sitemap.xml and llms.txt from the posts in public/blog/<slug>/index.html."""
import html, io, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
BLOG = os.path.join(PUB, "blog")
SITE = "https://elementalsai-labs.com"
ORDER = ["google-ads-statistics", "google-ads-audit-checklist", "common-google-ads-mistakes", "performance-max-vs-search",
         "best-ai-agents-for-marketing", "best-ai-tools-for-google-ads", "will-ai-replace-performance-marketing",
         "google-ads-management-cost", "best-ai-sdr-agents", "best-ai-agents-for-content-marketing"]

def meta(slug):
    s = io.open(os.path.join(BLOG, slug, "index.html"), encoding="utf-8").read()
    g = lambda pat: html.unescape(re.search(pat, s, re.S).group(1).strip())
    title = g(r"<title>(.*?)\s*\|\s*ElementalsAI Labs</title>")
    desc = g(r'<meta name="description" content="([^"]+)"')
    eyebrow = g(r'<div class="eyebrow">(.*?)</div>')
    mins = re.search(r"(\d+)\s*min read", s)
    return {"slug": slug, "title": title, "desc": desc, "eyebrow": eyebrow, "mins": mins.group(1) if mins else ""}

posts = [meta(s) for s in ORDER if os.path.exists(os.path.join(BLOG, s, "index.html"))]
items = "\n".join(
    f'    <li><a href="/blog/{p["slug"]}"><div class="meta">{html.escape(p["eyebrow"])} · {p["mins"]} min read</div>'
    f'<h2>{html.escape(p["title"])}</h2><p>{html.escape(p["desc"])}</p></a></li>' for p in posts)
index = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Blog: agentic GTM, ad waste and outbound | ElementalsAI Labs</title>
<meta name="description" content="Data-led guides on agentic GTM: where ad budgets leak, how to scale spend, safe AI automation and multi-channel outbound — from real audits.">
<link rel="canonical" href="{SITE}/blog">
<meta property="og:type" content="website"><meta property="og:site_name" content="ElementalsAI Labs">
<meta property="og:title" content="ElementalsAI Labs blog"><meta property="og:url" content="{SITE}/blog">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..800&family=Geist+Mono:wght@400..600&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="/blog/blog.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%23c6ff4a%22/%3E%3Crect x=%229%22 y=%229%22 width=%2214%22 height=%2214%22 rx=%223%22 fill=%22%2307080b%22/%3E%3C/svg%3E">
</head>
<body>
<header class="top"><div class="in">
  <a class="logo" href="/"><i></i>ElementalsAI Labs</a>
  <nav><a href="/#workflows">Workflows</a><a href="/#proof">Proof</a><a href="/blog">Blog</a><a class="cta" href="/#book">Free audit</a></nav>
</div></header>
<main class="wrap">
  <div class="eyebrow" style="margin-top:56px">The ElementalsAI Labs blog</div>
  <h1>Agentic GTM, <em>with the numbers.</em></h1>
  <p class="dek">What we find when agents audit real ad accounts, and how teams scale with agent workflows. Original data, plain answers.</p>
  <ul class="posts">
{items}
  </ul>
</main>
<footer><div class="in"><span>© 2026 ElementalsAI Labs · Forward-deployed AI engineering · Agentic GTM systems</span><span><a href="/">Home</a> · <a href="/blog">Blog</a></span></div></footer>
</body>
</html>
'''
io.open(os.path.join(BLOG, "index.html"), "w", encoding="utf-8").write(index)

urls = [f"{SITE}/", f"{SITE}/blog"] + [f"{SITE}/blog/{p['slug']}" for p in posts]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
     "\n".join(f"  <url><loc>{u}</loc><lastmod>2026-10-14</lastmod></url>" for u in urls) + "\n</urlset>\n"
io.open(os.path.join(PUB, "sitemap.xml"), "w", encoding="utf-8").write(sm)

llms = ["# ElementalsAI Labs", "",
        "> ElementalsAI Labs helps founders, CEOs, business owners and marketing heads grow revenue 3–4× in 90 days using a 24/7 AI-agent GTM system built specifically for their business, with proven strategies baked in, without hiring more people. The agents run ads, outbound (email, AI voice calls, LinkedIn, Instagram, Facebook, Reddit) and content; they catch wasted spend and failing campaigns, spot new opportunities and launch what is next.", "",
        "Key facts:",
        "- In one real audit of an Indian D2C store, 48% of a ₹71,800/month Google Ads budget sold nothing (₹34,400 a month).",
        "- Waste was found at three levels: campaign (₹17,500/month), asset (64–88% of images had no sale) and product (₹16,900/month; 792 of 1,027 products never sold through ads).",
        "- Ad spend grew 96% in a year while online revenue grew 31%.", "",
        "## Pages", f"- [Home: Agents run your GTM. You set the rules.]({SITE}/)"]
llms += [f"- [{p['title']}]({SITE}/blog/{p['slug']}): {p['desc']}" for p in posts]
io.open(os.path.join(PUB, "llms.txt"), "w", encoding="utf-8").write("\n".join(llms) + "\n")
print(f"{len(posts)} posts · index, sitemap.xml, llms.txt written")
