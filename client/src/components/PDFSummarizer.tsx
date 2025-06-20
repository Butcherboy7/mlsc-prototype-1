
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Save, 
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { extractTextFromPDF, exportToPDF } from '@/lib/pdf';

interface PDFSummarizerProps {
  onBack: () => void;
}

interface PDFSummaryData {
  fileName: string;
  shortSummary: string;
  detailedSummary: string;
}

const PDFSummarizer: React.FC<PDFSummarizerProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<PDFSummaryData | null>(null);
  const [summaryType, setSummaryType] = useState<'short' | 'detailed' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSummaryData(null);

    try {
      const extractedContent = await extractTextFromPDF(file);
      
      const [shortSummary, detailedSummary] = await Promise.all([
        geminiService.summarizePDF(extractedContent, 'short'),
        geminiService.summarizePDF(extractedContent, 'detailed')
      ]);

      setSummaryData({
        fileName: file.name,
        shortSummary,
        detailedSummary
      });
    } catch (error) {
      console.error('PDF processing error:', error);
    } finally {
      setIsLoading(false);
    }

    event.target.value = '';
  };

  const saveToNotes = (summary: string, type: 'short' | 'detailed') => {
    if (summaryData) {
      const title = `${type === 'short' ? 'Quick' : 'Detailed'} Summary: ${summaryData.fileName}`;
      const existingNotes = JSON.parse(localStorage.getItem('mentora_notes') || '[]');
      const newNote = {
        id: crypto.randomUUID(),
        title,
        content: summary,
        tags: ['PDF Summary', 'AI Generated'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      existingNotes.unshift(newNote);
      localStorage.setItem('mentora_notes', JSON.stringify(existingNotes));
      alert('Summary saved to Notes!');
    }
  };

  const downloadSummary = (summary: string, type: 'short' | 'detailed') => {
    if (summaryData) {
      const filename = `${summaryData.fileName.replace('.pdf', '')}-${type}-summary.pdf`;
      exportToPDF(summary, filename);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="self-start">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">PDF Summarizer</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Upload any PDF and get AI-powered summaries</p>
        </div>
        <div className="hidden sm:block w-24"></div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <FileText className="w-5 h-5 mr-2" />
            Upload PDF Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8 text-center">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-base sm:text-lg font-medium mb-2">Upload your PDF file</p>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base px-2">
              Supports documents up to 10MB. Get intelligent summaries powered by AI.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose PDF File
                </>
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p className="text-base sm:text-lg font-medium">Analyzing your PDF...</p>
              <p className="text-muted-foreground text-sm sm:text-base">This may take a few moments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Options */}
      {summaryData && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                <span className="break-all">{summaryData.fileName}</span>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </CardTitle>
            <p className="text-muted-foreground">Choose your summary type:</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSummaryType('short')}
                className="h-auto p-4 sm:p-6 flex flex-col items-center space-y-2 text-center"
              >
                <div className="text-base sm:text-lg font-semibold">🔹 Quick Summary</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Compress content into ~200 words with key bullet points
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSummaryType('detailed')}
                className="h-auto p-4 sm:p-6 flex flex-col items-center space-y-2 text-center"
              >
                <div className="text-base sm:text-lg font-semibold">🔸 Detailed Summary</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Comprehensive paragraph-by-paragraph analysis
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Display */}
      {summaryData && summaryType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-base sm:text-lg">
                {summaryType === 'short' ? '🔹 Quick Summary' : '🔸 Detailed Summary'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSummaryType(null)}
              >
                Back to Options
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none prose-sm sm:prose-base dark:prose-invert">
              <div className="whitespace-pre-line leading-relaxed">
                {summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={() => saveToNotes(
                  summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary,
                  summaryType
                )}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save to Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadSummary(
                  summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary,
                  summaryType
                )}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFSummarizer;
