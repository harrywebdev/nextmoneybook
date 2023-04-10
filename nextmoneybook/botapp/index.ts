import scheduler from "./scheduler";

require('dotenv').config()
import {Context} from "telegraf";
import bankUpdate from "./bank_update"
import updateCommand from "./commands/update";

const {Telegraf} = require('telegraf');
const {message} = require('telegraf/filters');

const authCheck = (ctx: Context, cb: () => void) => {
    if (ctx.message?.from?.id === Number(process.env.BOT_OWNER_ID)) {
        cb();
    }
}

const bot = new Telegraf(process.env.BOT_TOKEN);

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

updateCommand(bot);

bot.launch({}).catch((err: Error) => console.error(err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// turn the scheduler on
scheduler(bot)

export default bot