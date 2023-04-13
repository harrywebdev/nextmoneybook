import { Telegraf } from "telegraf";
import parser from "./import_transactions";

require("dotenv").config();
const schedule = require("node-schedule");

export default function scheduler(bot: Telegraf) {
  const BANK_SCHEDULE = "* * 12 * *";
  // const BANK_SCHEDULE = '* */1 * * *'

  schedule.scheduleJob(BANK_SCHEDULE, function () {
    void triggerBankUpdate();
  });

  const IMPORT_SCHEDULE = "* * */1 * *";
  schedule.scheduleJob(IMPORT_SCHEDULE, function () {
    // void parser(bot)
  });

  void parser((message: string) => {
    const chatId = Number(process.env.BOT_OWNER_CHAT_ID || 0);

    if (!chatId) {
      console.error("Missing chat ID.");
      return;
    }

    return bot.telegram.sendMessage(chatId, message);
  });

  process.on("SIGINT", function () {
    schedule.gracefulShutdown().then(() => process.exit(0));
  });

  async function triggerBankUpdate() {
    try {
      const chatId = Number(process.env.BOT_OWNER_CHAT_ID || 0);

      if (!chatId) {
        console.error("Missing chat ID.");
        return;
      }
      console.log(`Scheduled job for chat ID: ${chatId}`);
      await bot.telegram.sendMessage(
        chatId,
        "About to commence an update... 🍓 Should I proceed?",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Go on", callback_data: "trigger_update" }],
            ],
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}
