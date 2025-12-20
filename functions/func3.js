// отчет по студентам
const { Markup } = require('telegraf');

module.exports = async (ctx) => {
    ctx.session.isInFunctionMenu = false;
    
    await ctx.reply('Вы выбрали: 3');
    await ctx.reply("Пожалуйста, загрузите файл в формате XLS/XLSX", 
        Markup.keyboard([
            ['Вернуться в меню']
        ])
        .oneTime()
        .resize()
    );
};
