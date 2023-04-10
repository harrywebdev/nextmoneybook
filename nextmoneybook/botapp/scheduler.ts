import {Telegraf} from "telegraf";

require('dotenv').config()
const schedule = require('node-schedule');

export default function scheduler(bot: Telegraf,) {
    // const SCHEDULE = '* * 12 * *'
    const SCHEDULE = '* */1 * * *'

    schedule.scheduleJob(SCHEDULE, function () {
        void scheduledJob()
    });

    process.on('SIGINT', function () {
        schedule.gracefulShutdown().then(() => process.exit(0))
    });

    async function scheduledJob() {
        try {
            const chatId = Number(process.env.BOT_OWNER_CHAT_ID || 0)

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
}
