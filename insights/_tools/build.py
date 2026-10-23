#!/usr/bin/env python3
"""Build the bunillc.com Insights section.

Reads every insights/_posts/*.md (front matter + Markdown), skips any with
`draft: true`, and writes:
  insights/<slug>/index.html   one page per article
  insights/index.html          the listing page (newest first)
  sitemap.xml                  the block between the INSIGHTS markers
Run from anywhere:  python3 insights/_tools/build.py
Needs: pip install markdown
"""
import html, json, re, sys, datetime, pathlib
import markdown

ROOT = pathlib.Path(__file__).resolve().parents[2]
INS = ROOT / "insights"
SITE = "https://bunillc.com"
IMG = "/insights/images/"

def esc(s): return html.escape(s, quote=True)

def parse(path):
    text = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m: sys.exit(f"{path}: missing front matter")
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    for k in ("title", "slug", "date", "description", "keywords", "cover", "cover_alt"):
        if not meta.get(k): sys.exit(f"{path}: front matter needs '{k}'")
    meta.setdefault("author", "Amy Sullivan")
    meta["body"] = m.group(2)
    return meta

def img_url(name): return name if name.startswith(("/", "http")) else IMG + name

def render_body(md):
    md = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)",
                lambda m: f"![{m.group(1)}]({img_url(m.group(2))})", md)
    out = markdown.markdown(md, extensions=["extra", "sane_lists"])
    out = out.replace("<img ", '<img loading="lazy" decoding="async" ')
    out = re.sub(r'<a href="(https?://(?!bunillc\.com)[^"]+)"',
                 r'<a href="\1" target="_blank" rel="noopener"', out)
    return out

def nice_date(d): return datetime.date.fromisoformat(d).strftime("%B %-d, %Y")

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
{keywords}<link rel="canonical" href="{url}">
<meta property="og:type" content="{ogtype}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Buni LLC">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="{iw}">
<meta property="og:image:height" content="{ih}">
<meta property="og:image:alt" content="{imgalt}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ogtitle}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{image}">
<meta name="twitter:image:alt" content="{imgalt}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Source+Serif+4:opsz,wght@8..60,600&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&amp;text=BUNI&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css?v=20261023-insights">
<link rel="stylesheet" href="/insights/insights.css?v=1">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=4">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#14332f">
<script type="application/ld+json">
{jsonld}
</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
"""

HEADER = (ROOT / "insights/_template/header.html").read_text()
FOOTER = (ROOT / "insights/_template/footer.html").read_text()

def page(meta_head, main):
    return HEAD.format(**meta_head) + HEADER + "\n<main id=\"main\">\n" + main + "\n</main>\n\n" + FOOTER

def build():
    posts = [p for p in (parse(f) for f in sorted((INS / "_posts").glob("*.md")))
             if p.get("draft", "").lower() != "true"]
    posts.sort(key=lambda p: p["date"], reverse=True)
    for p in posts:
        url = f"{SITE}/insights/{p['slug']}/"
        image = SITE + img_url(p["cover"])
        ld = {
            "@context": "https://schema.org", "@type": "Article",
            "headline": p["title"], "description": p["description"],
            "image": [image], "datePublished": p["date"],
            "dateModified": p.get("updated", p["date"]),
            "mainEntityOfPage": {"@type": "WebPage", "@id": url},
            "keywords": p["keywords"],
            "author": {"@type": "Person", "name": p["author"],
                       "worksFor": {"@type": "Organization", "name": "Buni LLC"}},
            "publisher": {"@type": "Organization", "name": "Buni LLC", "url": SITE + "/",
                          "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png"}},
        }
        crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Insights", "item": SITE + "/insights/"},
            {"@type": "ListItem", "position": 3, "name": p["title"], "item": url}]}
        head = dict(title=esc(p["title"] + " | Buni LLC Insights"), desc=esc(p["description"]),
                    keywords=f'<meta name="keywords" content="{esc(p["keywords"])}">\n',
                    url=url, ogtype="article", ogtitle=esc(p["title"]), image=image,
                    iw=p.get("cover_w", "1200"), ih=p.get("cover_h", "675"), imgalt=esc(p["cover_alt"]),
                    jsonld=json.dumps([ld, crumbs], indent=2, ensure_ascii=False).replace("</", "<\\/"))
        main = f"""<article class="post">
  <div class="wrap post-wrap">
    <p class="post-crumbs"><a href="/insights/">Insights</a></p>
    <h1>{esc(p['title'])}</h1>
    <p class="post-meta">By {esc(p['author'])}, Buni LLC · <time datetime="{p['date']}">{nice_date(p['date'])}</time></p>
    <figure class="post-cover"><img src="{img_url(p['cover'])}" width="1200" height="675" alt="{esc(p['cover_alt'])}"></figure>
    <div class="post-body">
{render_body(p['body'])}
    </div>
    <p class="post-back"><a href="/insights/">← All insights</a></p>
  </div>
</article>"""
        out = INS / p["slug"] / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(page(head, main))
        print("wrote", out.relative_to(ROOT))

    # index
    idx_desc = "Practical notes from Buni LLC on company data as an asset: bankruptcy and wind-down sales, privacy rules, and workflow automation."
    cards = "\n".join(f"""    <li class="insight-card">
      <a class="insight-thumb" href="/insights/{p['slug']}/"><img src="{img_url(p['cover']).replace('.jpg', '-thumb.jpg')}" width="480" height="270" alt="" loading="lazy"></a>
      <div>
        <p class="post-meta"><time datetime="{p['date']}">{nice_date(p['date'])}</time></p>
        <h2><a href="/insights/{p['slug']}/">{esc(p['title'])}</a></h2>
        <p>{esc(p['description'])}</p>
        <a class="insight-more" href="/insights/{p['slug']}/">Read the article →</a>
      </div>
    </li>""" for p in posts)
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Buni LLC Insights",
          "url": SITE + "/insights/", "description": idx_desc,
          "publisher": {"@type": "Organization", "name": "Buni LLC", "url": SITE + "/"},
          "blogPost": [{"@type": "BlogPosting", "headline": p["title"],
                        "url": f"{SITE}/insights/{p['slug']}/", "datePublished": p["date"],
                        "author": {"@type": "Person", "name": p["author"]}} for p in posts]}
    cover = SITE + img_url(posts[0]["cover"]) if posts else SITE + "/og-card.png"
    head = dict(title="Insights | Buni LLC", desc=esc(idx_desc), keywords="",
                url=SITE + "/insights/", ogtype="website", ogtitle="Buni LLC Insights",
                image=cover, iw="1200", ih="675" if posts else "630", imgalt="Buni LLC Insights",
                jsonld=json.dumps(ld, indent=2, ensure_ascii=False).replace("</", "<\\/"))
    main = f"""<section class="section insights-hero">
  <div class="wrap">
    <p class="eyebrow">Insights</p>
    <h1>Notes on data as an asset</h1>
    <p class="lede">{esc(idx_desc)}</p>
  </div>
</section>
<section class="insights-list-wrap">
  <div class="wrap">
  <ul class="insight-list">
{cards}
  </ul>
  </div>
</section>"""
    (INS / "index.html").write_text(page(head, main))
    print("wrote insights/index.html")

    # sitemap
    sm = ROOT / "sitemap.xml"
    s = sm.read_text()
    today = max([p.get("updated", p["date"]) for p in posts] or [datetime.date.today().isoformat()])
    entries = [f"  <url>\n    <loc>{SITE}/insights/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>"]
    entries += [f"  <url>\n    <loc>{SITE}/insights/{p['slug']}/</loc>\n    <lastmod>{p.get('updated', p['date'])}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>" for p in posts]
    block = "  <!-- INSIGHTS:START (generated by insights/_tools/build.py) -->\n" + "\n".join(entries) + "\n  <!-- INSIGHTS:END -->\n"
    if "INSIGHTS:START" in s:
        s = re.sub(r"  <!-- INSIGHTS:START.*?INSIGHTS:END -->\n", block, s, flags=re.S)
    else:
        s = s.replace("</urlset>", block + "</urlset>")
    sm.write_text(s)
    print("updated sitemap.xml")

if __name__ == "__main__":
    build()
