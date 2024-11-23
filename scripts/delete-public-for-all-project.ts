// import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';

// function traverseDirectory(directory: string, fileCallback: (filePath: string) => void) {
//   const files = readdirSync(directory);
//   for (const file of files) {
//     const filePath = `${directory}/${file}`;
//     const stat = statSync(filePath);
//     if (stat.isDirectory()) {
//       traverseDirectory(filePath, fileCallback);
//     } else if (file.endsWith('.component.ts') || file.endsWith('.service.ts')) {
//       fileCallback(filePath);
//     }
//   }
// }

// function removePublicModifier(filePath: string) {
//   let fileContent = readFileSync(filePath, 'utf-8');
//   fileContent = fileContent.replace(/^\s{2}public\s+/gm, '  ');

//   writeFileSync(filePath, fileContent, 'utf-8');
// }

// function removePublicModifierInComponents() {
//   traverseDirectory('../', removePublicModifier);
// }

// removePublicModifierInComponents();
