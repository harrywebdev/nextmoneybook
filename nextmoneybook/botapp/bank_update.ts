import puppeteer from 'puppeteer';
import downloadCreditCardCsv from "./bank_update/download_credit_card_csv";
import loginToInternetBanking from "./bank_update/login_to_internet_banking";
import downloadCurrentAccountCsv from "./bank_update/download_current_account_csv";

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