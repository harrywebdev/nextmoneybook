import {Page} from "puppeteer";
import downloadCsv from "./download_csv";

export default async function downloadCreditCardCsv(
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

    await new Promise(r => setTimeout(r, 100));

    return await downloadCsv(page, 'rb_cc_', sendMessage);
}
