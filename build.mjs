import { readFile, mkdir, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const modules = ['data', 'stable', 'race', 'graphics', 'app'];
const code = (await Promise.all(modules.map(async name => {
  const source = await read(`src/${name}.js`);
  return `/* ${name}.js */\n` + source
    .replace(/^import .* from ['"].*['"];\r?\n/gm, '')
    .replace(/^export /gm, '');
}))).join('\n');
const css = await read("src/style.css");
const html = (await read('index.html'))
  .replace('<link rel="stylesheet" href="src/style.css">', () => `<style>\n${css}\n</style>`);
const output = html.replace('<script type="module" src="src/app.js"></script>',
  () => `<script>\n(() => {\n'use strict';\n${code.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>`);
await mkdir(new URL('dist/', import.meta.url), { recursive: true });
await writeFile(new URL('dist/Blood-and-Thunder.html', import.meta.url), output);
console.log('Built dist/Blood-and-Thunder.html');
