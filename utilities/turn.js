import { readFile } from 'fs/promises';
import fs from 'fs-extra';
import { exec } from 'child_process';
import TurndownService from 'turndown';
const turndownService = new TurndownService();

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("\x1b[31m", "You gotta say which thing to check", "\x1b[0m");
}

const file = `copywriting/${args[0] !== '' ? args[0] : `home`}.md`;
console.log(file);
const spell = exec(`spellchecker -f '${file}' -l en-CA --no-gitignore -d dictionary.txt`);
const prose = exec(`proselint ${file}`);

const readTheFiles = async () => {
	const red = await readFile(`public/${args[0] !== '' ? args[0] + '/' : ``}/index.html`, 'utf8');
	return red;
};

const redFiles = await readTheFiles();

turndownService.remove('script');
const markdown = turndownService.turndown(redFiles)

async function testFile (f, md) {
  try {
    await fs.outputFile(f, md)
  } catch (err) {
    console.error(err)
  }
}

testFile(`copywriting/${args[0] !== '' ? args[0] : `home`}.md`, markdown)
	.then(prose.stdout.pipe(process.stdout))
	.then(spell.stdout.pipe(process.stdout));