// Test script to inspect pdf-parse dynamic import shape
async function test() {
  try {
    const pdfParseModule = await import("pdf-parse");
    console.log("pdfParseModule type:", typeof pdfParseModule);
    console.log("pdfParseModule keys:", Object.keys(pdfParseModule));
    console.log("pdfParseModule default:", typeof pdfParseModule.default);
    console.log("pdfParseModule content:", pdfParseModule);
  } catch (err) {
    console.error("Import error:", err);
  }
}
test();
