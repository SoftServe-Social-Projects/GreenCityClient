const { readdirSync, statSync, readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Функція для обробки тільки файлів, що потрапляють у коміт
function getStagedFiles() {
  // Отримати всі файли, що знаходяться в індексі для коміту
  const output = execSync('git diff --cached --name-only --diff-filter=ACM').toString();
  return output.split('\n').filter((filePath: string) => filePath.length > 0);
}

// Функція для обробки кожного файлу (з заміною "public" модифікатора)
function removePublicModifier(filePath: string) {
  if (filePath.endsWith('.component.ts') || filePath.endsWith('.service.ts')) {
    const fileContent = readFileSync(filePath, 'utf-8');
    const updatedContent = fileContent.replace(/^\s{2}public\s+/gm, '  ');

    if (updatedContent !== fileContent) {
      writeFileSync(filePath, updatedContent, 'utf-8');
      // Додати файл назад до індексу після змін
      execSync(`git add ${filePath}`);
      console.log(`"public" модифікатор видалено у файлі: ${filePath}`);
    }
  }
}

// Основна функція для обробки файлів з коміту
function processStagedFiles() {
  const stagedFiles = getStagedFiles();

  for (const filePath of stagedFiles) {
    // Приведення шляху до файлу до правильного формату, якщо потрібно
    const absolutePath = path.resolve(filePath);
    removePublicModifier(absolutePath);
  }
}

// Запуск обробки
processStagedFiles();
