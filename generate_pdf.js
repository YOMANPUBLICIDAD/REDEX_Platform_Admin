const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Starting PDF generation...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const filePath = `file://${path.join(__dirname, 'dossier.html')}`;
  console.log('Loading page:', filePath);
  
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(__dirname, 'REDEX_Dossier_Corporativo.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });

  console.log('PDF generated successfully at:', pdfPath);
  await browser.close();
})();
