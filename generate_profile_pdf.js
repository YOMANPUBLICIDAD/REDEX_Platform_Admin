const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Starting Company Profile PDF generation...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const filePath = `file://${path.join(__dirname, 'company_profile.html')}`;
  console.log('Loading page:', filePath);
  
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(__dirname, 'REDEX_Company_Profile_Internacional.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
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
