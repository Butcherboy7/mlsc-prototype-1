import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background dark:bg-background"
    >
      <div className="px-4 py-6 md:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <Button variant="outline" onClick={onBack} className="self-start rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">PDF Summarizer</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">Upload any PDF and get AI-powered summaries</p>
          </div>
          <div className="hidden sm:block w-24"></div>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Upload PDF Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 dark:border-muted-foreground/20 rounded-xl p-8 sm:p-12 text-center transition-colors hover:border-primary/50">
                  <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-muted-foreground" />
                  <p className="text-lg sm:text-xl font-medium mb-3 text-foreground dark:text-foreground">Upload your PDF file</p>
                  <p className="text-muted-foreground mb-6 text-sm sm:text-base px-4 max-w-md mx-auto">
                    Supports documents up to 10MB. Get intelligent summaries powered by Gemini AI.
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
                    className="w-full sm:w-auto h-12 px-8 rounded-lg text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-3" />
                        Choose PDF File
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-center py-8 space-y-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-10 h-10 mx-auto text-primary" />
                      </motion.div>
                      <div>
                        <p className="text-lg font-medium text-foreground dark:text-foreground">Analyzing your PDF...</p>
                        <p className="text-muted-foreground text-sm mt-1">This may take a few moments</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary Options */}
          <AnimatePresence>
            {summaryData && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        <span className="break-all text-foreground dark:text-foreground">{summaryData.fileName}</span>
                      </div>
                      <Badge variant="secondary" className="rounded-md">Ready</Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">Choose your summary type:</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setSummaryType('short')}
                        className="h-auto p-6 flex flex-col items-center space-y-3 text-center rounded-xl border-2 hover:border-primary/50 transition-all"
                      >
                        <div className="text-lg font-semibold text-foreground dark:text-foreground">Quick Summary</div>
                        <div className="text-sm text-muted-foreground">
                          Compress content into ~200 words with key bullet points
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setSummaryType('detailed')}
                        className="h-auto p-6 flex flex-col items-center space-y-3 text-center rounded-xl border-2 hover:border-primary/50 transition-all"
                      >
                        <div className="text-lg font-semibold text-foreground dark:text-foreground">Detailed Summary</div>
                        <div className="text-sm text-muted-foreground">
                          Comprehensive paragraph-by-paragraph analysis
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Display */}
          <AnimatePresence>
            {summaryData && summaryType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-xl text-foreground dark:text-foreground">
                        {summaryType === 'short' ? 'Quick Summary' : 'Detailed Summary'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSummaryType(null)}
                        className="rounded-lg"
                      >
                        Back to Options
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line leading-relaxed text-foreground dark:text-foreground">
                        {summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border dark:border-border">
                      <Button
                        onClick={() => saveToNotes(
                          summaryType === 'short' ? summaryData.shortSummary : summaryData.detailedSummary,
                          summaryType
                        )}
                        className="w-full sm:w-auto h-11 rounded-lg"
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
                        className="w-full sm:w-auto h-11 rounded-lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download as PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFSummarizer;