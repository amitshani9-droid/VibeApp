const fs = require('fs');
const path = require('path');
try {
    const base64Content = fs.readFileSync('Heebo-Base64.txt', 'utf8').trim();
    const outputPath = path.join('src', 'utils', 'heeboFont.js');
    const fileContent = `export const heeboBase64 = '${base64Content}';\n`;
    fs.writeFileSync(outputPath, fileContent);
    console.log('File created successfully at ' + outputPath);
} catch (err) {
    console.error('Error creating file:', err);
    process.exit(1);
}
