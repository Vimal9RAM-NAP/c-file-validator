#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const inputFile = args[0];

// Help & Usage Menu
if (!inputFile || args.includes('--help') || args.includes('-h')) {
  console.log(`
  \x1b[36mc-file-validator-vimal\x1b[0m - Validate and test C source files

  \x1b[33mUsage:\x1b[0m
    $ npx c-file-validator-vimal <file.c>

  \x1b[33mExample:\x1b[0m
    $ npx c-file-validator-vimal main.c
  `);
  process.exit(0);
}

const resolveInput = path.resolve(process.cwd(), inputFile);
const tempBinary = path.resolve(process.cwd(), `__temp_build_${Date.now()}`);

// Check File Existence
if (!fs.existsSync(resolveInput)) {
  console.error(`\x1b[31mError:\x1b[0m File "${inputFile}" not found.`);
  process.exit(1);
}

// Check GCC Availability
try {
  execSync('gcc --version', { stdio: 'ignore' });
} catch (err) {
  console.error('\x1b[31mError:\x1b[0m GCC compiler is not installed or not in system PATH.');
  process.exit(1);
}

console.log(`\x1b[36m🔍 Inspecting ${path.basename(inputFile)}...\x1b[0m\n`);

// Strict Compilation Step (-Wall -Wextra -std=c11)
try {
  const compileCmd = `gcc -Wall -Wextra -std=c11 "${resolveInput}" -o "${tempBinary}"`;
  const warnings = execSync(compileCmd, { stdio: 'pipe' }).toString();

  if (warnings.length > 0) {
    console.log('\x1b[33m⚠️ Compilation succeeded with warnings:\x1b[0m\n');
    console.log(warnings);
  } else {
    console.log('\x1b[32m✔ Strict Compilation Passed:\x1b[0m Zero errors and zero warnings.');
  }

  console.log('\n\x1b[32m🎉 Ready for execution!\x1b[0m\n');
} catch (err) {
  console.error('\x1b[31m✖ Compilation Failed:\x1b[0m\n');
  if (err.stderr) {
    console.error(err.stderr.toString());
  } else {
    console.error(err.message);
  }
  cleanUp();
  process.exit(1);
}

cleanUp();

function cleanUp() {
  if (fs.existsSync(tempBinary)) {
    try {
      fs.unlinkSync(tempBinary);
    } catch (_) {}
  }
}