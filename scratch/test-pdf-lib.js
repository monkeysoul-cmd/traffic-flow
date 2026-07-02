// Test importing internal pdf-parse file directly to bypass module.parent check
async function test() {
  try {
    const pdf = await import("pdf-parse/lib/pdf-parse.js");
    const pdfFunc = pdf.default || pdf;
    console.log("Success! Imported directly. pdfFunc is:", typeof pdfFunc);
  } catch (err) {
    console.error("Direct import error:", err);
  }
}
test();
