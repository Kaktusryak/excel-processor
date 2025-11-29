const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');      // for reading .xls
const ExcelJS = require('exceljs'); // for formatting-preserved writes

const BARCODE_REGEX = /^\d{13} - \d{9}$/;

async function excelParser(filePath) {
    console.log('Processing Excel file:', filePath);

    try {
        const ext = path.extname(filePath).toLowerCase();
        let xlsxPath = filePath;

        if (ext === '.xls') {
            // Convert XLS → XLSX in-memory
            xlsxPath = await convertXlsToXlsx(filePath);
        }

        await processXlsx(xlsxPath);
    } catch (err) {
        console.error('Failed to process Excel:', err);
    }
}

// Convert .xls → .xlsx in-memory using XLSX
async function convertXlsToXlsx(filePath) {
    console.log('Converting .xls to .xlsx:', filePath);
    const workbook = XLSX.readFile(filePath); // read .xls
    const sheetNames = workbook.SheetNames;

    // Save as XLSX temporarily
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, '.xls');
    const tempFile = path.join(dir, `${baseName}_converted.xlsx`);

    XLSX.writeFile(workbook, tempFile, { bookType: 'xlsx' });
    console.log('Converted file:', tempFile);
    return tempFile;
}

// Process XLSX with ExcelJS to mark barcodes
async function processXlsx(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath); // preserves formatting
    const sheet = workbook.worksheets[0];

    const { barcodeCol, cartonsCol } = findColumns(sheet);

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const cell = row.getCell(barcodeCol);
        if (cell.value && typeof cell.value === 'string' && BARCODE_REGEX.test(cell.value.trim())) {
            row.getCell(cartonsCol).value = 'X';
        }
    });

    // Save as new file to preserve original
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const newFile = path.join(dir, `${baseName}_marked.xlsx`);

    await workbook.xlsx.writeFile(newFile);
    console.log('Marked Excel saved as:', newFile);
}

// Find BARCODE and CARTONS column numbers
function findColumns(sheet) {
    const headerRow = sheet.getRow(1);
    let barcodeCol = null;
    let cartonsCol = null;

    headerRow.eachCell((cell, colNumber) => {
        const value = String(cell.value || '').trim().toUpperCase();
        if (value === 'BARCODE') barcodeCol = colNumber;
        if (value === 'CARTONS') cartonsCol = colNumber;
    });

    if (!barcodeCol || !cartonsCol) {
        throw new Error('BARCODE or CARTONS column not found in sheet.');
    }

    return { barcodeCol, cartonsCol };
}


// flow:
// select config file
// process config file (get lore)
// select main file

// process main file
// save amin file

module.exports = { excelParser };
