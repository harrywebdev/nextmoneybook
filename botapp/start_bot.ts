import scheduler from "./scheduler";
import type { Context } from "telegraf";
import updateCommand from "./commands/update";

require("dotenv").config();

const { Telegraf } = require("telegraf");

const authCheck = (fromId: number | undefined, cb: () => void) => {
  if (
    typeof fromId !== "undefined" &&
    fromId === Number(process.env.BOT_OWNER_ID)
  ) {
    cb();
  }
};

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx: Context) => {
  authCheck(ctx.from?.id, () => {
    ctx.reply("Welcome");
  });
});

bot.help((ctx: Context) => {
  authCheck(ctx.from?.id, () => {
    const commands = ["/status", "/update"];
    ctx.reply("Available commands:\n " + commands.join("\n"));
  });
});

updateCommand(bot, authCheck);

bot
  .launch({})
  .then(() => {
    console.log("Bot started");
  })
  .catch((err: Error) => console.error(err));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// turn the scheduler on
scheduler(bot);

export default bot;
