import {Page} from "puppeteer";

export default async function loginToInternetBanking(
    page: Page,
    sendMessage: (message: string) => void
): Promise<Page> {
    await page.goto('https://www.rb.cz/');
    await page.setCookie(...[{
        name: 'rwc',
        value: '%7B%22data%22%3A%5B%7B%22code%22%3A%22analytics%22%2C%22permissions%22%3A%5B%5D%7D%2C%7B%22code%22%3A%22marketing%22%2C%22permissions%22%3A%5B%5D%7D%5D%2C%22common%22%3A%7B%22accepted%22%3A1681058879458%7D%7D'
    }])

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    await page.click('.login-element a')

    const usernameInputSelector = '.login-element .form-field.form-field-text input'
    await page.waitForSelector(usernameInputSelector);

    // Type into search box
    await page.type(usernameInputSelector, process.env.BOT_OWNER_BANK_LOGIN_USERNAME || "");

    // trigger 2fa
    const submitUsernameSelector = '.login-element form button'
    await page.waitForSelector(submitUsernameSelector);
    await page.click(submitUsernameSelector);

    sendMessage('I\'ve triggered a login to your internet banking 💰');

    // await page.screenshot({path: 'debug1.png'});

    // wait on the 2fa screen
    await page.waitForSelector('#method');

    // await page.screenshot({path: 'debug2.png'});

    // wait for the dashboard screen
    const transactionsHistorySelector = 'button[xid=transactionsLink]'
    await page.waitForSelector(transactionsHistorySelector);

    // wait until the page fully loads
    await new Promise(r => setTimeout(r, 500));

    // await page.screenshot({path: 'debug3.png'});

    sendMessage('I\'ve logged in 🤓');

    // click to get to History on current account
    await page.click(transactionsHistorySelector);

    return page;
}