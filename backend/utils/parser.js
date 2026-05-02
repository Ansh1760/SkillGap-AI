import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export const parseFile = async (fileBuffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const data = await mammoth.extractRawText({ buffer: fileBuffer });
      return data.value;
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
  } catch (error) {
    throw new Error(`Error parsing file: ${error.message}`);
  }
};
