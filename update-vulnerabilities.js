const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function getVulnerablePackages() {
    try {
        const { stdout } = await execAsync('npm audit --json', { maxBuffer: 1024 * 1024 });
        const auditResult = JSON.parse(stdout);

        if (!auditResult || !auditResult.advisories) {
            console.log('Отсутствуют данные об уязвимостях.');
            return [];
        }

        const vulnerablePackages = Object.entries(auditResult.advisories)
            .map(([_, value]) => value.module_name);

        return [...new Set(vulnerablePackages)];
    } catch (error) {
        console.error('Ошибка при выполнении npm audit:', error);
        return [];
    }
}

async function updatePackage(packageName) {
    try {
        console.log(`Обновление пакета: ${packageName}`);
        await execAsync(`npm install ${packageName}@latest`);
        console.log(`Пакет обновлен: ${packageName}`);
    } catch (error) {
        console.error(`Ошибка при обновлении пакета ${packageName}:`, error);
    }
}

async function main() {
    const vulnerablePackages = await getVulnerablePackages();

    if (vulnerablePackages.length === 0) {
        console.log('Нет уязвимых пакетов для обновления');
        return;
    }

    await Promise.all(vulnerablePackages.map(updatePackage));

    console.log('Все уязвимые пакеты обновлены');
}

main();
