const {
    Telegraf, 
    Markup,
    session
} = require('telegraf')

const func1 = require('./functions/func1')
const func2 = require('./functions/func2')
const func3 = require('./functions/func3')
const func4 = require('./functions/func4')
const func5 = require('./functions/func5')
const func6 = require('./functions/func6')

const functions = {
    '1': func1,
    '2': func2,
    '3': func3,
    '4': func4,
    '5': func5,
    '6': func6,
}

const bot = new Telegraf('8404536921:AAF93gBUmUhkwy0DIu6i-M-MX-C4jAha_yY')

bot.use(session({
    defaultSession: () => ({
        isInFunctionMenu: false
    })
}))

bot.start((ctx) => {
    ctx.session.isInFunctionMenu = false;
    ctx.reply('Привет. Я - бот-помощник для учебной части IT-Top колледжа. Нажмите "Продолжить" чтобы перейти к функциям, которые я выполняю.',
    Markup.keyboard([
        ['Продолжить']
    ])
    .oneTime()
    .resize()
    )
})

bot.hears('Продолжить', (ctx) => {
    ctx.session.isInFunctionMenu = true;
    return showMainMenu(ctx);
})


function showMainMenu(ctx) {
    ctx.session.isInFunctionMenu = true;
    return ctx.reply(
        'Выберите функцию: \n' +
        '\n1. Отчет по выставленному расписанию' +
        '\n2. Отчет по темам занятия' +
        '\n3. Отчет по студентам' +
        '\n4. Отчет по посещаемости студентов' +
        '\n5. Отчет по проверенным ДЗ' +
        '\n6. Отчет по сданным ДЗ',

        Markup.keyboard([
            ['1', '2'],
            ['3', '4'],
            ['5', '6']
        ]).resize()
    );
}

bot.hears(['1', '2', '3', '4', '5', '6'], async (ctx) => {
    const btnNumber = ctx.message.text;
    ctx.session.isInFunctionMenu = false;
    
    if (functions[btnNumber]) {
        try {
            await functions[btnNumber](ctx);
        } catch (error) {
            console.error(error);
            ctx.reply('Извините. Произошла ошибка');
        }
    } else {
        ctx.reply('Функция не найдена');
    }
})

bot.hears('↩️ Вернуться в меню', (ctx) => {
    if (!ctx.session.isInFunctionMenu) {
        return showMainMenu(ctx);
    }
});

bot.help((ctx) => ctx.reply('/start - перзапуск бота\n' + 
    '/about - информация о создателе'))
bot.command('about', (ctx) => ctx.reply('Создателя зовут Екатерина Пчелкина, студенка IT-Top колледжа, группа 9/3-РПО-23/2.' +
    ' Данный бот сделан в рамках учебной/производственной практики от колледжа.'))
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
