import {Page} from "puppeteer";
import downloadCsv from "./download_csv";

export default async function downloadCreditCardCsv(
    page: Page,
    sendMessage: (message: string) => void
): Promise<Page> {
    // go to dashboard
    await page.goto('https://online.rb.cz/web/#/home');

    await new Promise(r => setTimeout(r, 100));

    // await new Promise(r => setTimeout(r, 100));
    // await page.screenshot({path: 'debug2.png'});
    // await new Promise(r => setTimeout(r, 1000));
    // await page.screenshot({path: 'debug2a.png'});

    // go to card history
    const cardDetailSelector = '[xid=cardsWidget] button.submit'
    await page.waitForSelector(cardDetailSelector);

    // await new Promise(r => setTimeout(r, 100));
    // await page.screenshot({path: 'debug3.png'});

    await page.click(cardDetailSelector);

    // await new Promise(r => setTimeout(r, 100));
    // await page.screenshot({path: 'debug6.png'});

    await new Promise(r => setTimeout(r, 100));

    return await downloadCsv(page, 'rb_cc_', sendMessage);
}
