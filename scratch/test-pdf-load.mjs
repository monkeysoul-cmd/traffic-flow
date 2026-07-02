import { PDFParse } from "pdf-parse";
import * as fs from "fs";

async function run() {
  try {
    const pdfParser = new PDFParse();
    const pdfBuffer = fs.readFileSync("D:\\downloads\\UNIT 1.pdf");
    
    console.log("Loading PDF...");
    await pdfParser.load(pdfBuffer);
    
    console.log("Getting Info...");
    const info = await pdfParser.getInfo();
    console.log("PDF Info:", info);
    
    console.log("Extracting Text...");
    const text = await pdfParser.getText();
    console.log("Extracted Text Length:", text.length);
    console.log("Extracted Text Snippet:", text.substring(0, 500));
    
    pdfParser.destroy();
  } catch (err) {
    console.error("Error running parser:", err);
  }
}
run();
