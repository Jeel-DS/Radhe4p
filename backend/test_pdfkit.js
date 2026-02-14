const PDFDocument = require('pdfkit');
const fs = require('fs');

try {
    console.log('Creating DOC');
    const doc = new PDFDocument();
    console.log('DOC Created');

    doc.pipe(fs.createWriteStream('output.pdf'));

    doc.fontSize(25).text('Some text with an embedded font!', 100, 100);
    doc.end();
    console.log('DOC Ended');
} catch (e) {
    console.error('Error:', e);
}
