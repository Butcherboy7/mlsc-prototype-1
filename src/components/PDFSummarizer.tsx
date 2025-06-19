
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
import { openAIService } from '@/lib/openai';
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
        openAIService.summarizePDF(extractedContent, 'short'),
        openAIService.summarizePDF(extractedContent, 'detailed')
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
    if ((window as any).addNoteFromAIChat && summaryData) {
      const title = `${type === 'short' ? 'Quick' : 'Detailed'} Summary: ${summaryData.fileName}`;
      (window as any).addNoteFromAIChat(title, summary, ['PDF Summary', 'AI Generated']);
    }
  };

  const downloadSummary = (summary: string, type: 'short' | 'detailed') => {
    if (summaryData) {
      const filename = `${summaryData.fileName.replace('.pdf', '')}-${type}-summary.pdf`;
      exportToPDF(summary, filename);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold">PDF Summarizer</h1>
          <p className="text-muted-foreground">Upload any PDF and get AI-powered summaries</p>
        </div>
        <div></div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Upload PDF Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Upload your PDF file</p>
            <p className="text-muted-foreground mb-4">
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
              <p className="text-lg font-medium">Analyzing your PDF...</p>
              <p className="text-muted-foreground">This may take a few moments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Options */}
      {summaryData && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {summaryData.fileName}
              </div>
              <Badge variant="secondary">Ready</Badge>
            </CardTitle>
            <p className="text-muted-foreground">Choose your summary type:</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSummaryType('short')}
                className="h-auto p-6 flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">🔹 Quick Summary</div>
                <div className="text-sm text-muted-foreground text-center">
                  Compress content into ~200 words with key bullet points
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSummaryType('detailed')}
                className="h-auto p-6 flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">🔸 Detailed Summary</div>
                <div className="text-sm text-muted-foreground text-center">
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
            <CardTitle className="flex items-center justify-between">
              <div>
                {summaryType === 'short' ? '🔹 Quick Summary' : '🔸 Detailed Summary'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSummaryType(null)}
                >
                  Back to Options
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={() => saveToNotes(
                  summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary,
                  summaryType
                )}
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
