const puppeteer = require('puppeteer');
const path = require('path');

async function generateCardPDF(browser, selector, outputName) {
  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 900,
    deviceScaleFactor: 4,
  });

  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  // Hide everything except the target card, center it on the page
  const otherSelector = selector === '.card-front' ? '.card-back' : '.card-front';
  await page.addStyleTag({
    content: `
      body {
        background: white !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 100vh !important;
        padding: 0 !important;
        gap: 0 !important;
      }
      h2 { display: none !important; }
      ${otherSelector} { display: none !important; }
      .card {
        box-shadow: none !important;
        border: none !important;
      }
    `
  });

  await page.pdf({
    path: path.resolve(__dirname, outputName),
    width: '3.75in',   // 3.5in card + 0.125in bleed each side
    height: '2.25in',  // 2in card + 0.125in bleed each side
    printBackground: true,
    margin: { top: '0.125in', bottom: '0.125in', left: '0.125in', right: '0.125in' },
  });

  await page.close();
  console.log(`${outputName} saved.`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
  });

  await generateCardPDF(browser, '.card-front', 'danielle-boggio-front.pdf');
  await generateCardPDF(browser, '.card-back', 'danielle-boggio-back.pdf');

  await browser.close();
  console.log('Done!');
})();
