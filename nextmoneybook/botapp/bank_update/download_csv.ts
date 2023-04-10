import {HTTPRequest, HTTPResponse, Page} from "puppeteer";
import fs from "fs";
import path from "path";

export default async function downloadCsv(
    page: Page,
    filePrefix: string,
    sendMessage: (message: string) => void
) {
    // wait for transactions screen
    const transactionsSelector = 'a[xid=exportToCSVButton]'
    await page.waitForSelector(transactionsSelector);

    // await new Promise(r => setTimeout(r, 100));
    // await page.screenshot({path: 'debug7.png'});

    // intercept the CSV
    // downloads something like
    // https://online.rb.cz/ibs/download/r-G2zcEH1EBhbwCZxBNOCg==/content
    await page.setRequestInterception(true);

    // passthru
    const requestHandler = (request: HTTPRequest) => {
        if (request.isInterceptResolutionHandled()) {
            return;
        }

        request.continue()
    }

    // get the CSV data from the response body
    const responseHandler = (interceptedResponse: HTTPResponse) => {
        const interceptedRequest = interceptedResponse.request();
        const url = interceptedRequest.url();

        if (url.indexOf('download') > 0 && url.endsWith('content')) {
            interceptedRequest.response()?.text().then((text) => {
                try {
                    const filename = `${filePrefix}_${new Date().toISOString()}.csv`;

                    // save text to file
                    fs.writeFileSync(path.join(__dirname, '../../storage', filename), text, 'utf-8');

                    sendMessage(`I've downloaded CSV file: ${filename}. 📥`);
                } catch (error) {
                    if (error instanceof Error) {
                        sendMessage(`Error downloading CSV file: ${error.message}. 🚫`);
                    }
                    console.error(error)
                }
            })
        }
    }

    page.on('request', requestHandler)
    page.on('response', responseHandler);

    // click the download CSV button - click it twice to go through the popup
    await page.click(transactionsSelector);

    await page.waitForResponse(response =>
        response.url().indexOf('download') > 0 && response.url().endsWith('content')
    );

    // wait for processing - to be safe
    await new Promise(r => setTimeout(r, 500));

    // turn off request interceiption
    await page.setRequestInterception(false);

    // all should be done now
    page.off('request', requestHandler)
    page.off('response', responseHandler);

    // cleanup
    return page;
}