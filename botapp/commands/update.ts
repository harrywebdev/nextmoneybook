import type { Context, Telegraf } from "telegraf";
import bankUpdate from "../bank_update";

export default function updateCommand(
  bot: Telegraf,
  authCheck: (fromId: number | undefined, cb: () => void) => void
) {
  let IS_TRIGGERING_UPDATE = false;

  const updateFromBank = async (ctx: Context) => {
    if (IS_TRIGGERING_UPDATE) {
      return;
    }

    IS_TRIGGERING_UPDATE = true;
    await ctx.reply("Alright, I'm on it! 🚀");

    await bankUpdate((message) => {
      ctx.reply(message);
    });

    // TODO: parse the stuff and give overall status
    ctx.reply("TODO: status. ⚠️");
    IS_TRIGGERING_UPDATE = false;
  };

  // trigger update manually
  bot.command("update", async (ctx: Context) => {
    authCheck(ctx.from?.id, () => {
      console.log("bot:update");
      updateFromBank(ctx);
    });
  });

  // action triggered by scheduler
  bot.action("trigger_update", async (ctx: Context) => {
    authCheck(ctx.from?.id, async () => {
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

      await updateFromBank(ctx);
    });
  });

  // remove the buttons
  bot.action("cancel_update", async (ctx: Context) => {
    try {
      if (!ctx.callbackQuery?.message) {
        return;
      }

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
  });
}
