import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist/src/ui');
const outputDir = path.resolve(process.cwd(), 'dist/src/generated');
const outputFile = path.join(outputDir, 'htmlStrings.js');
const dtsFile = path.join(outputDir, 'htmlStrings.d.ts');

const files = ['flight-list.html', 'flight-detail.html', 'user-list.html', 'user-detail.html'];

let exports = '';
let content = '// Auto-generated - do not edit\n\n';
let dtsContent = '// Auto-generated - do not edit\n\n';

for (const file of files) {
  const html = fs.readFileSync(path.join(distDir, file), 'utf-8');
  const name = file.replace('.html', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const funcName = `get${name.charAt(0).toUpperCase() + name.slice(1)}HtmlString`;
  
  // Escape the HTML for JS string
  const escapedHtml = html
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  
  content += `function ${funcName}() {\n  return '${escapedHtml}';\n}\n`;
  exports += `export { ${funcName} };\n`;
  
  // Generate TypeScript declaration
  dtsContent += `export declare function ${funcName}(): string;\n`;
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, content + '\n' + exports);
fs.writeFileSync(dtsFile, dtsContent);

console.log('Generated htmlStrings.js and htmlStrings.d.ts');
