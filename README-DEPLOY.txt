VAHAN360 WEBSITE (multi-page) — DEPLOY TO GODADDY
=================================================
Domain: vahan360.co.in  ·  Company: CORE LINK COMMUNICATION PVT LTD

Static multi-page site (HTML/CSS/JS). No build step.

PAGES: index (Home), services, safety, drivers, about (Company), contact,
       privacy-policy, terms-and-conditions.

DEPLOY:
1. GoDaddy > Web Hosting > Manage > cPanel > File Manager > public_html
   (if vahan360.co.in is an add-on domain, use ITS document root instead).
2. Upload EVERYTHING INSIDE this folder (all .html, robots.txt, sitemap.xml,
   /css, /js, /assets) into public_html, keeping the structure.
3. Visit https://vahan360.co.in/

SOCIAL LINKS: placeholders are set to instagram.com/vahan360, facebook.com/vahan360,
linkedin.com/company/vahan360, x.com/vahan360, youtube.com/@vahan360 and
wa.me/919900339335. Replace the URLs in /build_vahan.py (SOCIAL dict) and re-run,
OR edit them directly in each .html, with your real handles.

FORMS: the contact form opens the visitor's email app (mailto). Connect a form
service (Formspree etc.) or your API to auto-collect — see TODO in /js/main.js.

REBUILD: to regenerate all pages after editing content, run:  python3 build_vahan.py
