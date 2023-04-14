import { Context, Telegraf } from "telegraf";
import triggerLogin from "../user_login/trigger_login";
import { fmt, link } from "telegraf/format";
import bcrypt from "bcryptjs";

export default function loginCommand(
  bot: Telegraf,
  authCheck: (fromId: number | undefined, cb: () => void) => void
) {
  // trigger update manually
  bot.command("login", async (ctx: Context) => {
    authCheck(ctx.from?.id, async () => {
      console.log("bot:login");

      // @ts-ignore
      const commandText = (ctx.message?.text || "/login").split(" ");

      if (!commandText[1]) {
        console.log("bot:login: missing password");
        // ignore this message
        return;
      }

      // delete the message first, so the password is not hanging in the chat
      await ctx.deleteMessage();

      const isValid = await bcrypt.compare(
        commandText[1],
        process.env.BOT_LOGIN_SECRET || ""
      );

      if (!isValid) {
        console.log("bot:login: incorrect password");
        await ctx.reply("Incorrect password. 🚫");
        return;
      }

      try {
        await triggerLogin((loginUrl: string) => {
          const chatId = Number(process.env.BOT_OWNER_CHAT_ID || 0);

          if (!chatId) {
            console.error("bot:login: Missing chat ID.");
            return;
          }

          return bot.telegram.sendMessage(
            chatId,
            fmt("Visit ", link("this link", loginUrl), " (expires in 1 minute)")
          );
        });
      } catch (error) {
        console.error("bot:login: error");

        if (error instanceof Error) {
          await ctx.reply("Error: " + error.message);
        }
      }
    });
  });
}
