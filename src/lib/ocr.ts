
import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  detectedType: 'math' | 'code' | 'business' | 'legal' | 'literature' | 'general';
}

export const extractTextFromImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log(m)
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    // Detect content type based on patterns
    const detectedType = detectContentType(text);

    return {
      text,
      confidence,
      detectedType
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

const detectContentType = (text: string): OCRResult['detectedType'] => {
  const lowerText = text.toLowerCase();
  
  // Math patterns
  if (/[+\-*/=∫∑∏√∆θπ]|equation|solve|calculate|derivative|integral/i.test(text)) {
    return 'math';
  }
  
  // Code patterns
  if (/function|class|import|export|console|print|def |for |while |if |else|return|var |let |const/i.test(text)) {
    return 'code';
  }
  
  // Business patterns
  if (/revenue|profit|market|strategy|customer|sales|roi|kpi|business|startup/i.test(lowerText)) {
    return 'business';
  }
  
  // Legal patterns
  if (/contract|law|legal|clause|defendant|plaintiff|court|jurisdiction|statute/i.test(lowerText)) {
    return 'legal';
  }
  
  // Literature patterns
  if (/chapter|verse|poem|story|novel|author|character|plot|theme|metaphor/i.test(lowerText)) {
    return 'literature';
  }
  
  return 'general';
};
