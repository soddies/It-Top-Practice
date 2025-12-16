const {
    Telegraf 
} = require('telegraf')

const bot = new Telegraf('8404536921:AAF93gBUmUhkwy0DIu6i-M-MX-C4jAha_yY')
bot.start((ctx) => ctx.reply('Привет. Я - бот-помощник для учебной части IT-Top колледжа. Нажмите "Продолжить" чтобы перейти к функциям, которые я выполняю.'))
bot.help((ctx) => ctx.reply('Помощь'))
bot.command('about', (ctx) => ctx.reply('Создателя зовут Екатерина Пчелкина, студенка IT-Top колледжа, группа 9/3-РПО-23/2.' +
    ' Данный бот сделан в рамках учебной/производственной практики от колледжа.'))
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))