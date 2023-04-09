import puppeteer from 'puppeteer';

const bankUpdate = async (onLogin: () => void, onFinish: () => void) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

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
    // await page.screenshot({path: 'example.png'});

    await page.click('.login-element form button');

    onLogin();

    // // Wait and click on first result
    // const searchResultSelector = '.search-box__link';
    // await page.waitForSelector(searchResultSelector);
    // await page.click(searchResultSelector);
    //
    // // Locate the full title with a unique string
    // const textSelector = await page.waitForSelector(
    //     'text/Customize and automate'
    // );
    //
    // if (textSelector) {
    //
    //     const fullTitle = await textSelector.evaluate(el => el.textContent);
    //
    //     // Print the full title
    //     console.log('The title of this blog post is "%s".', fullTitle);
    // }

    onFinish();

    // await page.waitForTimeout(5000);
    // await page.screenshot({path: 'example.png'});

    await browser.close();
};

export default bankUpdate;