const fs = require('fs');
const { exec } = require('child_process');

// Чтение файла package.json
fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка при чтении файла package.json:', err);
        return;
    }

    try {
        // Парсинг содержимого файла
        const packageJson = JSON.parse(data);

        // Получение массивов зависимостей
        const dependencies = Object.keys(packageJson.dependencies || {});
        const devDependencies = Object.keys(packageJson.devDependencies || {});

        // Функция для установки зависимостей
        const installDependencies = (deps, isDev = false) => {
            if (deps.length === 0) return;

            const npmCommand = `npm install ${deps.join(' ')}${isDev ? ' --save-dev' : ''}`;
            exec(npmCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Ошибка при установке зависимостей: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Ошибка при установке зависимостей: ${stderr}`);
                    return;
                }
                console.log(`Установлены зависимости: ${stdout}`);
            });
        };

        // Установка зависимостей
        installDependencies(dependencies);
        installDependencies(devDependencies, true);

    } catch (error) {
        console.error('Ошибка при парсинге package.json:', error);
    }
});
