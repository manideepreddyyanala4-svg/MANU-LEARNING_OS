"""One-off codemod used for the warm-cream redesign (kept for reproducibility; do not re-run on already-converted files).
1. Removes decorative gradients: tinted gradients -> flat surface; dark gradients (a from/via/to shade >= 600 without opacity) -> flat deep green (sky-700 in the remapped palette).
2. Raises sub-12px text (text-[8px..11px]) to text-xs (12px).
3. Lowers heavy weights: font-black / font-extrabold -> font-bold.
Usage: python docs/ux/codemod-cream.py [--dry]"""
import re, sys, glob, os
dry = '--dry' in sys.argv
GRAD = re.compile(r'(?<![\w-])bg-gradient-to-\w+(?![\w-])')
STOP = re.compile(r'(?<![\w-])(?:[a-z]+:)*(?:from|via|to)-[\w\[\]#()/.%,-]+(?![\w-])')
DARK = re.compile(r'(?:from|via|to)-[a-z]+-(?:6|7|8|9)\d\d(?![\d/])')
stats = {'grad_light': 0, 'grad_dark': 0, 'tiny': 0, 'weight': 0, 'files': 0}
for path in sorted(glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)):
    src = open(path, encoding='utf-8').read(); out = []
    for line in src.split('\n'):
        if GRAD.search(line):
            toks = STOP.findall(line)
            dark = any(DARK.search(t) for t in toks)
            repl = 'bg-sky-700' if dark else 'bg-[var(--surface)]'
            first = [True]
            def sub(m):
                if first[0]: first[0] = False; return repl
                return ''
            if 'bg-clip-text' in line:
                line = GRAD.sub('', line); line = STOP.sub('', line); line = line.replace('bg-clip-text', '').replace('text-transparent', 'text-[var(--accent)]')
            else:
                line = GRAD.sub(sub, line); line = STOP.sub('', line)
                stats['grad_dark' if dark else 'grad_light'] += 1
            line = re.sub(r'  +', ' ', line.replace('" ', '" ')) if False else line
        out.append(line)
    new = '\n'.join(out)
    new, n1 = re.subn(r'text-\[(?:8|9|10|10\.5|11)px\]', 'text-xs', new); stats['tiny'] += n1
    new, n2 = re.subn(r'font-(?:black|extrabold)', 'font-bold', new); stats['weight'] += n2
    if new != src:
        stats['files'] += 1
        if not dry: open(path, 'w', encoding='utf-8').write(new)
print(stats)
