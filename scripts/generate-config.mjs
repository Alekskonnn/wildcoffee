import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(appDir, '../../../..');
const sourcePath = resolve(
	rootDir,
	'math-sdk/games/0_0_wildcoffee/library/configs/config_fe_0_0_wildcoffee.json',
);
const targetPath = resolve(appDir, '../src/game/config.ts');

const raw = await readFile(sourcePath, 'utf8');
const config = JSON.parse(raw);

await mkdir(dirname(targetPath), { recursive: true });
await writeFile(targetPath, `export default ${JSON.stringify(config, null, '\t')};\n`);

console.log(`Generated ${targetPath}`);
