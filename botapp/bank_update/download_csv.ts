import type { HTTPRequest, HTTPResponse, Page } from "puppeteer";
import path from "path";
import { checkExistsWithTimeout, moveFile } from "./pptr_helpers";
import convertStatementEncoding from "./convert_statement_encoding";

export default async function downloadCsv(
  page: Page,
  filePrefix: string,
  sendMessage: (message: string) => void
) {
  let csvFilename = "";

  // intercept the response to get the actual filename
  await page.setRequestInterception(true);

  // passthru
  const requestHandler = (request: HTTPRequest) => {
    if (request.isInterceptResolutionHandled()) {
      return;
    }

    request.continue();
  };

  const responseHandler = (interceptedResponse: HTTPResponse) => {
    const interceptedRequest = interceptedResponse.request();
    const url = interceptedRequest.url();

    if (url.indexOf("download") > 0 && url.endsWith("content")) {
      const headers = interceptedRequest.response()?.headers();

      // e.g. content-disposition: attachment;filename=Pohyby_0488226002_202304131625.csv
      if (headers && headers["content-disposition"]) {
        const contentDisposition = headers["content-disposition"];
        const filename = contentDisposition.split("filename=")[1];

        sendMessage(`I've got a CSV file: ${filename}. 📥`);

        csvFilename = path.join(__dirname, "../../storage/", filename);
      }
    }
  };

  page.on("request", requestHandler);
  page.on("response", responseHandler);

  // wait for transactions screen
  const transactionsSelector = "a[xid=exportToCSVButton]";
  await page.waitForSelector(transactionsSelector, { timeout: 5000 });

  const cdpsession = await page.target().createCDPSession();
  await cdpsession.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.join(__dirname, "../../storage/"),
  });

  // click the download CSV button - click it twice to go through the popup
  await page.click(transactionsSelector);

  // wait for the response to get the filename
  await page.waitForResponse(
    (response) =>
      response.url().indexOf("download") > 0 &&
      response.url().endsWith("content")
  );

  await new Promise((r) => setTimeout(r, 50));

  if (csvFilename) {
    // wait for the file to appear
    await checkExistsWithTimeout(csvFilename, 5000);

    // fix encoding (convert to utf-8)
    csvFilename = convertStatementEncoding(csvFilename);

    // move the file and name it properly
    await moveFile(
      csvFilename,
      path.join(
        __dirname,
        "../../storage/",
        `${filePrefix}_${new Date().toISOString()}.csv`
      )
    );
  } else {
    sendMessage(`Could not get CSV filename. 🚫`);
  }

  // turn off request interceiption
  await page.setRequestInterception(false);

  // all should be done now
  page.off("request", requestHandler);
  page.off("response", responseHandler);

  // cleanup
  return page;
}

// async function downloadCsvViaResponseWithBadEncoding(
//   page: Page,
//   filePrefix: string,
//   sendMessage: (message: string) => void
// ) {
//   // intercept the CSV
//   // downloads something like
//   // https://online.rb.cz/ibs/download/r-G2zcEH1EBhbwCZxBNOCg==/content
//   await page.setRequestInterception(true);
//
//   // passthru
//   const requestHandler = (request: HTTPRequest) => {
//     if (request.isInterceptResolutionHandled()) {
//       return;
//     }
//
//     request.continue();
//   };
//
//   // get the CSV data from the response body
//   const responseHandler = (interceptedResponse: HTTPResponse) => {
//     const interceptedRequest = interceptedResponse.request();
//     const url = interceptedRequest.url();
//
//     if (url.indexOf("download") > 0 && url.endsWith("content")) {
//       interceptedRequest
//         .response()
//         ?.text()
//         .then((text) => {
//           try {
//             const filename = `${filePrefix}_${new Date().toISOString()}.csv`;
//
//             // save text to file
//             fs.writeFileSync(
//               path.join(__dirname, "../../storage", filename),
//               text,
//               "utf-8"
//             );
//
//             sendMessage(`I've downloaded CSV file: ${filename}. 📥`);
//           } catch (error) {
//             if (error instanceof Error) {
//               sendMessage(`Error downloading CSV file: ${error.message}. 🚫`);
//             }
//             console.error(error);
//           }
//         });
//     }
//   };
//
//   page.on("request", requestHandler);
//   page.on("response", responseHandler);
//
//   await new Promise((r) => setTimeout(r, 500));
//
//   // wait for transactions screen
//   const transactionsSelector = "a[xid=exportToCSVButton]";
//   await page.waitForSelector(transactionsSelector, { timeout: 5000 });
//
//   // await new Promise(r => setTimeout(r, 100));
//   // await page.screenshot({path: 'debug4.png'});
//
//   // click the download CSV button - click it twice to go through the popup
//   await page.click(transactionsSelector);
//
//   await page.waitForResponse(
//     (response) =>
//       response.url().indexOf("download") > 0 &&
//       response.url().endsWith("content")
//   );
//
//   // wait for processing - to be safe
//   await new Promise((r) => setTimeout(r, 500));
//
//   // turn off request interceiption
//   await page.setRequestInterception(false);
//
//   // all should be done now
//   page.off("request", requestHandler);
//   page.off("response", responseHandler);
//
//   // cleanup
//   return page;
// }
