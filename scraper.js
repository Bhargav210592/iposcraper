import { chromium } from "playwright";
import fs from "fs/promises";

async function main() {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  console.log("🌐 Navigating...");
  await page.goto("https://ipostatus.kfintech.com/", { waitUntil: "domcontentloaded" });

  console.log("📌 Clicking dropdown...");
  await page.click(".depository-select");

  console.log("⌛ Waiting for IPO list...");
  const ul = await page.waitForSelector("ul#mui-2", { timeout: 15000 });

  const items = await ul.evaluate(() =>
    Array.from(document.querySelectorAll("ul#mui-2 li")).map(li => li.textContent.trim())
  );

  console.log(`✅ Found ${items.length} IPOs`);
  await fs.mkdir("/output", { recursive: true });
  await fs.writeFile("/output/ipos.json", JSON.stringify(items, null, 2), "utf-8");

  await page.screenshot({ path: "/output/debug.png", fullPage: true });

  await browser.close();
  console.log("📂 Results saved to /output/ipos.json & /output/debug.png");
}

main().catch(err => {
  console.error("❌ Scraper failed:", err);
  process.exit(1);
});
