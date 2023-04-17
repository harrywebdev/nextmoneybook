import type { Page } from "puppeteer";

export default async function loginToInternetBanking(
  page: Page,
  sendMessage: (message: string) => void
): Promise<Page> {
  await page.goto("https://www.rb.cz/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // await page.screenshot({ path: "debug0.png" });

  // first, wait for cookie-wall and accept it
  console.log('pptr: waitForSelector: "text/Souhlasím a pokračovat"');
  const cookieButtonSelector = "text/Souhlasím a pokračovat";
  const element = await page.waitForSelector(cookieButtonSelector);

  if (!element) {
    throw new Error("Could not find cookie button");
  }

  // await page.screenshot({ path: "debug1.png" });

  console.log('pptr: click: "text/Souhlasím a pokračovat"');
  await element.click();

  // await page.screenshot({ path: "debug2.png" });

  console.log('pptr: waitForSelector: ".login-element a"');
  await page.waitForSelector(".login-element a");
  console.log('pptr: click: ".login-element a"');
  await page.click(".login-element a");

  const usernameInputSelector =
    ".login-element .form-field.form-field-text input";

  console.log(`pptr: waitForSelector: "${usernameInputSelector}"`);
  await page.waitForSelector(usernameInputSelector);

  // Type into search box
  console.log(`pptr: typing login`);
  await page.type(
    usernameInputSelector,
    process.env.BOT_OWNER_BANK_LOGIN_USERNAME || ""
  );

  // await page.screenshot({ path: "debug3.png" });

  // trigger 2fa
  const submitUsernameSelector = ".login-element form button";
  console.log(`pptr: waitForSelector: "${submitUsernameSelector}"`);
  await page.waitForSelector(submitUsernameSelector);

  // await page.screenshot({ path: "debug4.png" });

  console.log(`pptr: click: "${submitUsernameSelector}"`);
  // await page.$eval(submitUsernameSelector, (element: HTMLButtonElement) =>
  //     element.click()
  // );
  await page.click(submitUsernameSelector);

  // await page.screenshot({ path: "debug5.png" });

  sendMessage("I've triggered a login to your intern et banking 💰");

  // wait on the 2fa screen
  await page.waitForSelector("#method");

  // await page.screenshot({ path: "debug6.png" });

  // wait for the dashboard screen
  const transactionsHistorySelector = "button[xid=transactionsLink]";
  await page.waitForSelector(transactionsHistorySelector);

  // wait until the page fully loads
  await new Promise((r) => setTimeout(r, 500));

  // // await page.screenshot({path: 'debug3.png'});

  sendMessage("I've logged in 🤓");

  // click to get to History on current account
  await page.click(transactionsHistorySelector);

  return page;
}
