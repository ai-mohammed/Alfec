// Runs a PHP script with PHP_BIN, the portable build in .tools/ (docs/testing.md), or php from the PATH.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const local = resolve('.tools/php8.3/php.exe');
const bin = process.env.PHP_BIN ?? (existsSync(local) ? local : 'php');
const ini = !process.env.PHP_BIN && existsSync(resolve('.tools/php8.3/php.ini')) ? ['-c', resolve('.tools/php8.3/php.ini')] : [];
const result = spawnSync(bin, [...ini, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
