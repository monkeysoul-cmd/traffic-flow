// Test script to inspect PDFParse class properties and methods
import * as pdfParseModule from "pdf-parse";

console.log("pdfParseModule keys:", Object.keys(pdfParseModule));

if (pdfParseModule.PDFParse) {
  const PDFParse = pdfParseModule.PDFParse;
  console.log("PDFParse class structure:", PDFParse.toString());
  console.log("PDFParse static properties:", Object.getOwnPropertyNames(PDFParse));
  console.log("PDFParse prototype properties:", Object.getOwnPropertyNames(PDFParse.prototype));
}
