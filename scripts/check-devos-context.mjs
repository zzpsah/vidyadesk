import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const requiredFiles = [
  '.ai/manifest.yaml', '.ai/PROJECT.md', '.ai/CURRENT-STATE.md',
  '.ai/ARCHITECTURE.md', '.ai/DECISIONS.md', '.ai/TASKS.md',
  '.ai/CHANGELOG.md', '.ai/STATE-INDEX.md', '.ai/AGENT-ROLES.md',
  '.ai/MCP-TOOL-BOUNDARIES.md', 'brain/README.md',
  'brain/PROJECT.md', 'brain/CURRENT_STATE.md', 'brain/ARCHITECTURE.md',
  'brain/DECISIONS.md', 'brain/TASKS.md', 'brain/TESTS.md',
  'brain/SECURITY.md', 'brain/HANDOFF.md', 'brain/ENHANCEMENT-STANDARD.md',
];
const failures = [];
for (const file of requiredFiles) {
  try {
    if (!(await stat(path.join(root, file))).isFile()) failures.push(file + ': expected a file');
  } catch {
    failures.push(file + ': missing');
  }
}
let manifest = '';
try { manifest = await readFile(path.join(root, '.ai/manifest.yaml'), 'utf8'); } catch {}
const manifestChecks = [
  ['managed_by', /^managed_by:\s*development-os\s*$/m],
  ['canonical_repository', /^canonical_repository:\s*zzpsah\/vidyadesk\s*$/m],
  ['devos_repository', /^devos_repository:\s*zzpsah\/chatgpt-development-os\s*$/m],
  ['secrets_policy', /^secrets_policy:\s*never-store-secrets\s*$/m],
];
for (const [label, pattern] of manifestChecks) {
  if (!pattern.test(manifest)) failures.push('.ai/manifest.yaml: missing or invalid ' + label);
}
const skillsRoot = path.join(root, '.agents/skills');
let skillDirs = [];
try {
  skillDirs = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch { failures.push('.agents/skills: missing'); }
if (skillDirs.length === 0) failures.push('.agents/skills: no skills found');
const seenNames = new Set();
for (const dir of skillDirs) {
  const rel = '.agents/skills/' + dir + '/SKILL.md';
  let content = '';
  try { content = await readFile(path.join(root, rel), 'utf8'); }
  catch { failures.push(rel + ': missing'); continue; }
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) { failures.push(rel + ': YAML frontmatter missing'); continue; }
  const name = frontmatter[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  const description = frontmatter[1].match(/^description:\s*(.+)\s*$/m)?.[1];
  if (!name) failures.push(rel + ': valid name field missing');
  if (!description || description.length < 30) failures.push(rel + ': useful description field missing');
  if (name && name !== dir) failures.push(rel + ': name must match directory (' + dir + ')');
  if (name && seenNames.has(name)) failures.push(rel + ': duplicate skill name ' + name);
  if (name) seenNames.add(name);
  if (!content.includes('# ')) failures.push(rel + ': skill instructions missing');
}
if (failures.length) {
  console.error('DevOS context check: FAIL');
  for (const failure of failures) console.error('- ' + failure);
  process.exitCode = 1;
} else {
  console.log('DevOS context check: PASS (' + requiredFiles.length + ' required files, ' + skillDirs.length + ' skills)');
}
