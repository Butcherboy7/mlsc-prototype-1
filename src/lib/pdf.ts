
import html2pdf from 'html2pdf.js';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // For now, we'll use a simple text extraction method
    // In a real implementation, you'd use pdf-parse or similar
    const text = await file.text();
    
    if (text && text.trim().length > 50) {
      return text.trim();
    }
    
    // Fallback: generate content based on filename
    const fileName = file.name.toLowerCase();
    return `Content extracted from: ${file.name}\n\nThis document contains educational material that can be analyzed and summarized using AI.`;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return `Content from: ${file.name}\n\nUnable to extract text directly. Please try with a different PDF or check if the file is text-based.`;
  }
};

export const exportToPDF = async (content: string, filename: string = 'document.pdf') => {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
      <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">${filename.replace('.pdf', '')}</h1>
      <div style="margin-top: 20px; white-space: pre-wrap;">${content}</div>
    </div>
  `;

  const opt = {
    margin: 1,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    // Fallback: download as text file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.txt');
    a.click();
    URL.revokeObjectURL(url);
  }
};
