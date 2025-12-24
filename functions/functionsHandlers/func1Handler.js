const XLSX = require('xlsx');

function parseSchedule(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const allGroupsData = {};
    let groupColIndex = -1;
    let dayIndices = [];
    let lastFoundGroup = "";

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;


        if (groupColIndex === -1) {
            row.forEach((cell, idx) => {
                const val = String(cell || "").toLowerCase().trim();
                if (val.includes('группа')) groupColIndex = idx;
                if (['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'].some(day => val.includes(day))) {
                    dayIndices.push(idx);
                }
            });
            continue;
        }

        let currentGroup = String(row[groupColIndex] || "").trim();
        if (currentGroup) {
            lastFoundGroup = currentGroup;
        }

        if (lastFoundGroup) {
            if (!allGroupsData[lastFoundGroup]) {
                allGroupsData[lastFoundGroup] = {};
            }

            dayIndices.forEach(idx => {
                const cellValue = String(row[idx] || "");
                const match = cellValue.match(/Предмет:\s*(.+)/i);
                
                if (match) {
                    let subject = match[1].split('\n')[0].trim();
                    if (subject) {
                        const groupSubjects = allGroupsData[lastFoundGroup];
                        groupSubjects[subject] = (groupSubjects[subject] || 0) + 1;
                    }
                }
            });
        }
    }
    return allGroupsData;
}

module.exports = async (ctx, filePath) => {
    try {
        const allResults = parseSchedule(filePath);
        const groupsFound = Object.keys(allResults);

        if (groupsFound.length === 0) {
            return ctx.reply("В файле не найдено групп или занятий.");
        }

        let fullReport = "*Отчет по всем группам в файле:*\n\n";

        for (const groupName of groupsFound) {
            const subjects = allResults[groupName];
            if (Object.keys(subjects).length === 0) continue;

            fullReport += `*Группа:* \`${groupName}\`\n`;
            for (const [sub, count] of Object.entries(subjects)) {
                fullReport += `▫️ ${sub}: *${count} пар(ы)*\n`;
            }
            fullReport += `\n`;
        }

        await ctx.reply(fullReport, { parse_mode: 'Markdown' });

    } catch (err) {
        console.error(err);
        await ctx.reply('Произошла ошибка при обработке групп.');
    }
}
