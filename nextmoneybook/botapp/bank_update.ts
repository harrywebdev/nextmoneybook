import puppeteer, {Page} from 'puppeteer';
import * as fs from "fs";
import path from "path";

async function loginToInternetBanking(
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
    await new Promise(r => setTimeout(r, 1500));

    // await page.screenshot({path: 'debug3.png'});

    sendMessage('I\'ve logged in 🤓');

    // click to get to History on current account
    await page.click(transactionsHistorySelector);

    return page;
}

async function downloadCurrentAccountCsv(
    page: Page,
    sendMessage: (message: string) => void
): Promise<Page> {
    // wait for transactions screen
    const transactionsSelector = 'a[xid=exportToCSVButton]'
    await page.waitForSelector(transactionsSelector);

    // await page.screenshot({path: 'debug4.png'});

    await new Promise(r => setTimeout(r, 100));

    // intercept the CSV
    // downloads something like
    // https://online.rb.cz/ibs/download/r-G2zcEH1EBhbwCZxBNOCg==/content
    await page.setRequestInterception(true);

    // passthru
    page.on('request', request => {
        if (request.isInterceptResolutionHandled()) {
            return;
        }

        request.continue()
    })

    // get the CSV data from the response body
    page.on('response', (interceptedResponse) => {
        const interceptedRequest = interceptedResponse.request();
        const url = interceptedRequest.url();

        if (url.indexOf('download') > 0 && url.endsWith('content')) {
            interceptedRequest.response()?.text().then((text) => {
                const filename = `rb_ca_${new Date().toISOString()}.csv`;

                // save text to file
                fs.writeFileSync(path.join(__dirname, '../storage', filename), text, 'utf-8');

                sendMessage(`I've downloaded CSV file: ${filename}. 📥`);
            })
        }
    });

    // click the download CSV button - click it twice to go through the popup
    await page.click(transactionsSelector);

    await page.waitForResponse(response =>
        response.url().indexOf('download') > 0 && response.url().endsWith('content')
    );

    // wait for processing
    await new Promise(r => setTimeout(r, 500));

    // await page.screenshot({path: 'debug5.png'});

    return page;
}

async function downloadCreditCardCsv(
    page: Page,
    sendMessage: (message: string) => void
): Promise<Page> {
    // go to cards dashboard
    await page.click('a[xid=menuCards]')

    // wait for list of cards screen
    const cardDetailSelector = 'button[creditCard-ZTFlYWVkYTFhOTQ2MzlhMDc1NTRlNGM0YWVmMGRiYzU2YjM5ZTYyNjFmMDc3MTg5NGM2ZTQyNDc1OWVlNTlkZC41MzE1MzNYWFhYWFg4MTczLkMuOTk5NTA4-detail]'
    await page.waitForSelector(cardDetailSelector);

    // await new Promise(r => setTimeout(r, 100));
    await page.click(cardDetailSelector);

    // wait for list of cards screen
    const cardHistorySelector = 'a[xid=toCardTransactionsLinkCredit]'
    await page.waitForSelector(cardHistorySelector);

    // await new Promise(r => setTimeout(r, 100));
    await page.click(cardHistorySelector);

    // await page.screenshot({path: 'debug4.png'});

    await new Promise(r => setTimeout(r, 1000));

    // wait for transactions screen
    const transactionsSelector = 'a[xid=exportToCSVButton]'
    await page.waitForSelector(transactionsSelector);

    // intercept the CSV
    // downloads something like
    // https://online.rb.cz/ibs/download/r-G2zcEH1EBhbwCZxBNOCg==/content
    await page.setRequestInterception(true);

    // passthru
    page.on('request', request => {
        if (request.isInterceptResolutionHandled()) {
            return;
        }

        request.continue()
    })

    // get the CSV data from the response body
    page.on('response', (interceptedResponse) => {
        const interceptedRequest = interceptedResponse.request();
        const url = interceptedRequest.url();

        if (url.indexOf('download') > 0 && url.endsWith('content')) {
            interceptedRequest.response()?.text().then((text) => {
                try {
                    const filename = `rb_cc_${new Date().toISOString()}.csv`;

                    // save text to file
                    fs.writeFileSync(path.join(__dirname, '../storage', filename), text, 'utf-8');

                    sendMessage(`I've downloaded CSV file: ${filename}. 📥`);
                } catch (error) {
                    if (error instanceof Error) {
                        sendMessage(`Error downloading CSV file: ${error.message}. 🚫`);
                    }
                    console.error(error)
                }
            })
        }
    });

    // click the download CSV button - click it twice to go through the popup
    await page.click(transactionsSelector);

    await page.waitForResponse(response =>
        response.url().indexOf('download') > 0 && response.url().endsWith('content')
    );

    // wait for processing
    await new Promise(r => setTimeout(r, 500));

    // await page.screenshot({path: 'debug5.png'});

    return page;
}

const bankUpdate = async (
    sendMessage: (message: string) => void
) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await loginToInternetBanking(page, sendMessage);

        // needs a break to work
        await new Promise(r => setTimeout(r, 1000));

        // download CSV for Current Account
        await downloadCurrentAccountCsv(page, sendMessage);

        // download CSV for Credit Card
        await downloadCreditCardCsv(page, sendMessage);

        sendMessage(`Download succeeded. Logging out of the bank. 🏦`);

        await page.click('[xid=logoutMenuItem]');

        await browser.close();
    } catch (error) {
        sendMessage('Oops, something gone wrong 🚫. Exiting');

        await browser.close();
    }
};

export default bankUpdate;