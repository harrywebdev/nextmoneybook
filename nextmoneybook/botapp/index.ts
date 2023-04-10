require('dotenv').config()
import {Context} from "telegraf";
import bankUpdate from "./bank_update"

const schedule = require('node-schedule');
const {Telegraf} = require('telegraf');
const {message} = require('telegraf/filters');

const authCheck = (ctx: Context, cb: () => void) => {
    if (ctx.message?.from?.id === Number(process.env.BOT_OWNER_ID)) {
        cb();
    }
}

const bot = new Telegraf(process.env.BOT_TOKEN);
let BOT_OWNER_CHAT_ID: number | null = null

bot.start((ctx: Context) => {
    authCheck(ctx, () => {
        ctx.reply('Welcome')
    })
});

bot.help((ctx: Context) => {
    const commands = [
        "/status", "/update"
    ]
    ctx.reply("Available commands:\n " + commands.join("\n"))
});

bot.command('update', async (ctx: Context) => {
    if (!ctx.message?.chat.id) {
        void ctx.reply('Missing chat ID.')
        return;
    }

    BOT_OWNER_CHAT_ID = ctx.message.chat.id

    await scheduledJob(ctx.message.chat.id);
})

let IS_TRIGGERING_UPDATE = false
bot.action('trigger_update', async (ctx: Context) => {
    if (IS_TRIGGERING_UPDATE) {
        return
    }

    // first, remove the button from the message so user cannot trigger this again by accident
    if (ctx.callbackQuery?.message) {
        try {
            await bot.telegram.editMessageReplyMarkup(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                undefined,
                undefined
            );
        } catch (error) {
            // can ignore it probably
            console.error(error);
        }
    }

    IS_TRIGGERING_UPDATE = true
    await ctx.reply('Alright, I\'m on it! 🚀')

    await bankUpdate(
        (message) => {
            ctx.reply(message)
        },
    )

    // TODO: parse the stuff and give overall status
    ctx.reply('(4/4) TODO: status. ⚠️')
    IS_TRIGGERING_UPDATE = false
})

bot.launch({}).catch((err: Error) => console.error(err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

async function scheduledJob(chatId: number | null) {
    try {
        if (!chatId) {
            console.error('Missing chat ID.')
            return;
        }
        console.log(`Scheduled job for chat ID: ${chatId}`);
        await bot.telegram.sendMessage(chatId, "About to commence an update... 🍓 Should I proceed?", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: "Go on", callback_data: "trigger_update"},
                    ]
                ]
            }
        })
    } catch (error) {
        console.error(error);
    }
}

const SCHEDULE = '* * 12 * *'
// const SCHEDULE = '* */1 * * *'

schedule.scheduleJob(SCHEDULE, function () {
    void scheduledJob(BOT_OWNER_CHAT_ID)
});

process.on('SIGINT', function () {
    schedule.gracefulShutdown().then(() => process.exit(0))
});

export default bot