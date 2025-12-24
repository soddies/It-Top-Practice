const XLSX = require('xlsx');

function parseSchedule(filePath, targetGroup) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const subCount = {};
    let groupColIndex = -1;
    let dayIndices = [];
    let lastFoundGroup = "";

    const target = targetGroup.replace(/\s+/g, '').toLowerCase();

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

        let rawCellGroup = String(row[groupColIndex] || "").trim();
        if (rawCellGroup) {
            lastFoundGroup = rawCellGroup;
        }
        const normalizedFoundGroup = lastFoundGroup.replace(/\s+/g, '').toLowerCase();
        if (normalizedFoundGroup === target || normalizedFoundGroup.includes(target)) {
            dayIndices.forEach(idx => {
                const cellValue = String(row[idx] || "");
                
                const match = cellValue.match(/Предмет:\s*(.+)/i);
                
                if (match) {
                    let subject = match[1].split('\n')[0].trim();
                    if (subject) {
                        subCount[subject] = (subCount[subject] || 0) + 1;
                    }
                }
            });
        }
    }
    return subCount;
}

function formatReport(subjects, group) {
    let text = `*Отчет по расписанию*\n`;
    text += `Группа: \`${group}\`\n\n`;

    const entries = Object.entries(subjects);
    if (entries.length === 0) return null;

    entries.forEach(([subject, count]) => {
        text += `🔹 ${subject}: *${count}* пар(ы)\n`;
    });

    return text;
}

module.exports = async (ctx, filePath) => {
    const group = '9/3-РПО-23/2';
    
    try {
        const result = parseSchedule(filePath, group);

        if (!Object.keys(result).length) {
            return ctx.reply(`Занятия для группы ${group} не найдены.`);
        }

        const report = formatReport(result, group);
        await ctx.reply(report, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error('Ошибка в парсере:', err);
        await ctx.reply('Ошибка при чтении содержимого файла.');
    }
}
