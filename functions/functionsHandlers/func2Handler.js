const XLSX = require('xlsx');

async function func2Handler(ctx, filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});

        const headers = rows[0];
        const dataRows = rows.slice(1);

        const topicIdx = headers.indexOf('Тема урока');

        if (topicIdx === -1) {
            throw new Error('Колонка "Тема урока" не найдена в таблице');
        }

        const incorrectTopics = [];

        dataRows.forEach((row, rowIdx) => {
            if (row[topicIdx]) {
                const topic = row[topicIdx].toString().trim();

                const patterns = [
                    /^Урок\s+№?\s*\d+[\.:]\s*(Тема:?\s*)?.*/i, 
                    /^Урок\s+№?\s*\d+\s+.*/i, 
                    /^Занятие\s+№?\s*\d+[\.:]\s*(Тема:?\s*)?.*/i, 
                    /^Занятие\s+№?\s*\d+\s+.*/i, 
                    /^Тема\s+№?\s*\d+[\.:]\s*.*/i, 
                    /^Урок\s+№?\s*\d+-\s*.*/i, 
                    /^КР\s+№?\s*\d+\s+.*/i, 
                    /^Практическая работа\s+№?\s*\d+.*/i
                ];

                const isValid = patterns.some(pattern => pattern.test(topic));

                if (!isValid && topic !== '/' && topic.length > 3) {
                    incorrectTopics.push({
                        row: rowIdx + 2,
                        topic: topic,
                        teacher: row[headers.indexOf('ФИО преподавателя')] || 'Не указан',
                        subject: row[headers.indexOf('Предмет')] || 'Не указан',
                        date: row[headers.indexOf('Date')] || 'Не указана'
                    });
                }
            }
        });

        if (incorrectTopics.length === 0) {
            await ctx.reply('Все темы уроков соответствуют формату!');
        } else {
            let report = `*Найдено ${incorrectTopics.length} некорректных тем из ${dataRows.length} всего:*\n\n`;

            const examples = incorrectTopics.slice(0, 50);
            
            examples.forEach((item, index) => {
                report += `${index + 1}. *Строка ${item.row}:* ${item.topic.substring(0, 80)}${item.topic.length > 80 ? '...' : ''}\n`;
            });

            if (incorrectTopics.length > 50) {
                report += `\n*... и еще ${incorrectTopics.length - 50} тем(ы)*\n`;
            }

            const percentage = ((incorrectTopics.length / dataRows.length) * 100).toFixed(1);
            report += `\n*Статистика:* ${percentage}% ошибок`;

            await ctx.reply(report, {parse_mode: "Markdown"});
            
            await ctx.reply(
                '*Примеры правильных форматов:*\n' +
                '• Урок №1. Тема: название\n' +
                '• Урок №1: название\n' +
                '• Урок 1: название\n' +
                '• Занятие 1. Тема: название\n' +
                '• Тема №1: название\n' +
                '• КР №1: название',
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        console.error('Ошибка в функции: ', error);
        await ctx.reply(`Ошибка: ${error.message}`);
    }
}

module.exports = func2Handler;
