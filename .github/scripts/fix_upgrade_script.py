from pathlib import Path
p=Path('.github/scripts/upgrade_mova_ai.py')
s=p.read_text(encoding='utf-8')
old="if 'id=\"movaAiModal\"' not in s:s=s.replace('</body>',modal+'\\n</body>',1)"
new="if 'id=\"movaAiModal\"' not in s:s=(s.replace('</html>',modal+'\\n</html>',1) if '</html>' in s else s+'\\n'+modal+'\\n')"
if old not in s:
    raise SystemExit('modal insertion line not found')
p.write_text(s.replace(old,new,1),encoding='utf-8')
