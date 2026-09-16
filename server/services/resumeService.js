import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse-new";
import mammoth from "mammoth";

export const extractResumeText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  const data = await pdfParse(dataBuffer);

  return data.text;
};

// Extracts text from either PDF or DOCX/DOC resumes based on file
// extension. Added for Milestone 3 (ATS Resume Analysis accepts
// PDF/DOCX). Falls back to the existing PDF extractor for .pdf files
// so previous behaviour is fully preserved.
export const extractResumeTextSmart = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".docx" || ext === ".doc") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  return extractResumeText(filePath);
};