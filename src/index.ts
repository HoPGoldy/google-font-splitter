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
        .option('-r, --root <path>', 'set the root directory of the CSS file', '')
        .option('-d, --dist <savePath>', 'set the directory where the CSS file will be downloaded', './font-result')
        .option('-n, --name <fileName>', 'name of the result file', '')
        .option('-c, --concurrent <number>', 'set the number of concurrent download', '30')
        .argument('<url>', 'Google font link to download')
        .action(downloadFont)

    await program.parseAsync(process.argv);
}

main()