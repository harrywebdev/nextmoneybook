import type { Page } from "puppeteer";
import downloadCsv from "./download_csv";

export default async function downloadCurrentAccountCsv(
  page: Page,
  sendMessage: (message: string) => void
): Promise<Page> {
  return await downloadCsv(page, "rb_ca_", sendMessage);
}
