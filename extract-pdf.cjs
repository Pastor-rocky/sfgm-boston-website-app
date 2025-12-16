const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractPDFText(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return null;
  }
}

// Main execution
const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error('Please provide a PDF file path as an argument');
  console.error('Usage: node extract-pdf.cjs <path-to-pdf>');
  process.exit(1);
}

const fullPath = path.resolve(pdfPath);

if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

console.log(`Extracting text from: ${fullPath}\n`);
console.log('='.repeat(80));

extractPDFText(fullPath).then(result => {
  if (result && result.text) {
    console.log(result.text);
    console.log('\n' + '='.repeat(80));
    console.log(`\nExtraction complete!`);
    console.log(`Pages: ${result.numPages}`);
    console.log(`Total characters: ${result.text.length}`);
    
    // Save to file
    const outputPath = fullPath.replace('.pdf', '_extracted.txt');
    fs.writeFileSync(outputPath, result.text, 'utf8');
    console.log(`Text saved to: ${outputPath}`);
  } else {
    console.error('Failed to extract text from PDF');
    process.exit(1);
  }
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

