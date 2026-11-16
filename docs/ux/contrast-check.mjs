// Reproducible WCAG 2.x contrast check for the warm-cream tokens. Run: node docs/ux/contrast-check.mjs
const L = (h) => { const c = [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255).map(v => v<=0.03928? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
const cr = (a,b) => { const x=L(a), y=L(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
export const light = { bg:'#F5F1E8', surface:'#FBF9F4', sidebar:'#F0EAE0', fg:'#252A30', muted:'#535A5D', mutedLight:'#6B6F6C', line:'#DCD5C8', lineStrong:'#8C8678',
  accent:'#2F5D46', accentHover:'#244A37', accentSubtle:'#E4EBDD', accentBorder:'#A9BFA9', onAccent:'#FBF9F4', success:'#2F6B3F', warning:'#8A5A00', danger:'#A32A2A', codeBg:'#2B2F33', codeFg:'#F1EEE6' };
export const dark = { bg:'#1E2323', surface:'#282E2D', sidebar:'#222827', fg:'#ECE9E1', muted:'#BBC3BF', mutedLight:'#9AA5A1', line:'#414A46', lineStrong:'#7D8A85',
  accent:'#9CC3A8', accentHover:'#B3D3BD', accentSubtle:'#2B3B34', accentBorder:'#4E6F5C', onAccent:'#14201A', success:'#8CC79B', warning:'#E0B35A', danger:'#EB9C9C', codeBg:'#171C1B', codeFg:'#ECE9E1' };
const pairs = (t) => [
 ['text on page bg','fg','bg',4.5],['text on reading surface','fg','surface',4.5],['text on sidebar','fg','sidebar',4.5],
 ['secondary text on bg','muted','bg',4.5],['secondary text on surface','muted','surface',4.5],['secondary text on sidebar','muted','sidebar',4.5],
 ['tertiary text (mutedLight) on surface','mutedLight','surface',4.5],['accent text on bg','accent','bg',4.5],['accent text on surface','accent','surface',4.5],
 ['accent text on accentSubtle','accent','accentSubtle',4.5],['button label on accent','onAccent','accent',4.5],['button label on accentHover','onAccent','accentHover',4.5],
 ['success text on surface','success','surface',4.5],['warning text on surface','warning','surface',4.5],['danger text on surface','danger','surface',4.5],
 ['code text on code bg','codeFg','codeBg',4.5],
 ['input/UI boundary (lineStrong) vs surface','lineStrong','surface',3],['focus ring (accent) vs bg','accent','bg',3],['focus ring (accent) vs surface','accent','surface',3],['focus ring vs sidebar','accent','sidebar',3],
].map(([n,a,b,min]) => { const r = cr(t[a],t[b]); return {n,a:t[a],b:t[b],r:+r.toFixed(2),min,ok:r>=min}; });
let bad = 0;
for (const [name,t] of [['LIGHT (warm cream)',light],['DARK (green-gray charcoal)',dark]]) {
  console.log('\n'+name);
  for (const p of pairs(t)) { console.log((p.ok?'PASS':'FAIL')+'  '+String(p.r).padStart(5)+' (min '+p.min+')  '+p.n+'  '+p.a+' on '+p.b); if(!p.ok) bad++; }
}
console.log('\nsubtle border (decorative, not required): '+cr(light.line,light.bg).toFixed(2)+':1 on bg — NOT relied upon for identifying controls');
console.log(bad? '\nFAILURES: '+bad : '\nAll required pairs pass');
process.exit(bad?1:0);
