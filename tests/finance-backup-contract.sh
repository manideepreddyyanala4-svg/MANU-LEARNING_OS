#!/usr/bin/env bash
# Free CI contract test: mocks Supabase CLI, makes no internet or real DB calls.
set -euo pipefail
command -v pwsh >/dev/null || { echo "PowerShell 7 is required for backup contract test"; exit 1; }
root="$(mktemp -d)"
trap 'rm -rf "$root"' EXIT
mkdir -p "$root/bin"
cat > "$root/bin/supabase" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
cmd="${1:-}"; sub="${2:-}"
case "$cmd" in
 init|login|link) exit 0 ;;
 db)
   test "$sub" = dump || exit 40
   dest=""
   args=("$@")
   for ((i=0;i<${#args[@]};i++)); do
     if [[ "${args[i]}" == "-f" ]]; then dest="${args[i+1]}"; break; fi
   done
   [[ "$dest" && "$dest" == "$MOCK_OUTPUT_BASE"/* ]] || exit 41
   mkdir -p "$(dirname "$dest")"
   printf -- "-- mocked SQL backup fixture, NOT PRODUCTION DATA\nSELECT 1;\n" > "$dest"
   ;;
 storage)
   test "$sub" = cp || exit 42
   dest="${@: -1}"
   [[ "$dest" == "$MOCK_OUTPUT_BASE"/* ]] || exit 43
   mkdir -p "$dest"
   for ((i=1;i<=${MOCK_OBJECT_COUNT:-45};i++)); do
     printf 'mock private image %s\n' "$i" > "$dest/image-$i.jpg"
   done
   ;;
 *) echo "Unexpected mock Supabase operation: $*" >&2; exit 44 ;;
esac
SH
chmod +x "$root/bin/supabase"
export PATH="$root/bin:$PATH"
export MOCK_OUTPUT_BASE="$root"
export MOCK_OBJECT_COUNT=45
pwsh -NoProfile -NonInteractive -File scripts/finance-free-backup.ps1 -OutputRoot "$root/complete" > "$root/pass.log" 2>&1 || {
  cat "$root/pass.log"; echo "Expected successful mocked backup"; exit 1;
}
node - "$root/complete" <<'JS'
const fs=require('fs'),path=require('path');
const base=process.argv[2];
const folders=fs.readdirSync(base).map(x=>path.join(base,x));
if(folders.length!==1)throw Error('Expected one timestamped backup folder');
const dir=folders[0],m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
if(m.projectRef!=='awmfxkaunmithimfijsi')throw Error('Wrong Supabase target');
if(m.storageObjects!==45||m.sqlFiles!==4||m.files.length!==49)throw Error('Backup manifest incomplete');
for(const item of m.files){
 const f=path.join(dir,item.relativePath);
 if(!fs.existsSync(f)||fs.statSync(f).size!==item.bytes)throw Error('Missing backed-up file');
 const actual=require('crypto').createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 if(actual!==item.sha256)throw Error('Incorrect SHA-256 checksum');
}
console.log('MOCK BACKUP PASS: 4 SQL outputs, 45 private objects, 49 valid checksums');
JS
export MOCK_OBJECT_COUNT=44
if pwsh -NoProfile -NonInteractive -File scripts/finance-free-backup.ps1 -OutputRoot "$root/incomplete" > "$root/fail.log" 2>&1; then
  echo "Incomplete backup incorrectly reported success"; exit 1
fi
if find "$root/incomplete" -name manifest.json | grep -q .; then
  echo "Incomplete backup wrote a success manifest"; exit 1
fi
echo "MOCK BACKUP PASS: 44/45 private objects correctly rejected"
