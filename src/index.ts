#!/usr/bin/env node  

import { Command } from "commander";
import fs from 'fs';
import path from 'path';
import { downloadFont } from './downloadFont';

const program = new Command();
const packageVersion = JSON.parse(fs.readFileSync(path.join(__dirname, '..', './package.json'), 'utf8')).version;

async function main() {
    program.version(packageVersion)
        .description('A simple CLI to download google font with splits')
        .option('-r, --root', 'set the root directory of the CSS file', '')
        .option('-d, --dist', 'set the directory where the CSS file will be downloaded', './font-result')
        .argument('<url>', 'Google font link to download')
        .action(downloadFont)

    await program.parseAsync(process.argv);
}

main()