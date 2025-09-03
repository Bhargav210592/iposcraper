import express from "express";
import { chromium } from "playwright";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  try {
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({
      headless: true,
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

    await browser.close();

    console.log(`✅ Found ${items.length} IPOs`);
    res.json({
      status: "success",
      count: items.length,
      ipos: items
    });
  } catch (err) {
    console.error("❌ Scraper failed:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("✅ IPO Scraper API is running. Use /scrape to fetch IPO list.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
