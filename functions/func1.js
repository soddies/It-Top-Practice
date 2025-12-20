const { Markup } = require('telegraf');

module.exports = async (ctx) => {
    ctx.session.isInFunctionMenu = false;
    
    await ctx.reply('Вы выбрали: 1');
    await ctx.reply("Пожалуйста, загрузите файл в формате XLS/XLSX", 
        Markup.keyboard([
            ['Вернуться в меню']
        ])
        .oneTime()
        .resize()
    );
};
