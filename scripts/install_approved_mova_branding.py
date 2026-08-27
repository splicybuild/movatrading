from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Replace rejected bull favicon/touch-icon references.
text = re.sub(r'mova-icon-black-blue\.png(?:\?v=\d+)?', 'mova-approved-icon.png?v=156', text)

# Replace current header branding contents with the exact recovered asset pair.
match = re.search(r'(<div[^>]*class="brand"[^>]*id="brandHome"[^>]*>)', text, re.I)
if not match:
    match = re.search(r'(<div[^>]*id="brandHome"[^>]*class="brand"[^>]*>)', text, re.I)
if not match:
    raise SystemExit('brandHome container not found')

start = match.end()
end = text.find('</div>', start)
if end < 0:
    raise SystemExit('brandHome closing div not found')

assets = ('\n<img alt="MOVA icon" class="brand-app-icon" src="mova-approved-icon.png?v=156">'
          '\n<img alt="MOVA TRADING" class="brand-wordmark" src="mova-approved-wordmark.png?v=156">\n')
text = text[:start] + assets + text[end:]

# Mobile welcome/app branding uses icon only.
text = text.replace('const source=document.querySelector(".brand-wordmark");',
                    'const source=document.querySelector(".brand-app-icon");')

# Add final override after all legacy branding rules.
css = '''
<style id="v156-approved-branding">
header .brand{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;gap:10px!important;flex:0 0 auto!important}
header .brand-app-icon{display:block!important;width:58px!important;height:58px!important;flex:0 0 58px!important;object-fit:contain!important;border-radius:0!important;margin:0!important;box-shadow:none!important}
header .brand-wordmark{display:block!important;height:52px!important;width:auto!important;max-width:min(40vw,520px)!important;object-fit:contain!important;object-position:left center!important;margin:0!important}
header .mova-brand-copy{display:none!important}
@media(max-width:800px){
 header .brand{justify-content:center!important;width:auto!important;gap:0!important}
 header .brand-app-icon{display:block!important;width:54px!important;height:54px!important;flex:0 0 54px!important;object-fit:contain!important;margin:0!important}
 header .brand-wordmark{display:none!important}
 body.mova-mobile-welcome .mobile-auth-brand{display:flex!important;flex-direction:column!important;align-items:center!important}
 body.mova-mobile-welcome .mobile-auth-brand>.label{order:1!important;margin:0 0 10px!important}
 body.mova-mobile-welcome .mobile-auth-logo{order:2!important;display:block!important;width:min(34vw,128px)!important;max-width:128px!important;height:auto!important;object-fit:contain!important;border-radius:0!important;margin:0 auto 10px!important;box-shadow:none!important}
 body.mova-mobile-welcome .mobile-auth-full-brand{display:none!important}
 body.mova-mobile-welcome .mobile-auth-tagline{order:3!important}
}
</style>
'''
if 'id="v156-approved-branding"' not in text:
    text = text.replace('</head>', css + '\n</head>', 1)

text = re.sub(r'<!-- MOVA BUILD v\d+[^>]*-->', '<!-- MOVA BUILD v156 APPROVED BRAND ASSETS -->', text, count=1)
text = re.sub(r'data-mova-build="[^"]+"', 'data-mova-build="v156-approved-brand-assets"', text, count=1)

if 'mova-icon-black-blue.png' in text:
    raise SystemExit('Rejected bull asset is still referenced in index.html')
if 'mova-approved-icon.png?v=156' not in text:
    raise SystemExit('Approved icon reference missing')
if 'mova-approved-wordmark.png?v=156' not in text:
    raise SystemExit('Approved wordmark reference missing')
if 'const source=document.querySelector(".brand-app-icon");' not in text:
    raise SystemExit('Mobile logo source was not switched')

path.write_text(text, encoding='utf-8')
