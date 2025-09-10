import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SyllabusUploadProps {
  selectedInstitution: {
    university: string;
    course: string;
    semester: string;
  };
  onUploadComplete: (parsedData: any) => void;
  onBack: () => void;
}

const SyllabusUpload: React.FC<SyllabusUploadProps> = ({ 
  selectedInstitution, 
  onUploadComplete, 
  onBack 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['.pdf', '.docx', '.jpg', '.png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please select a PDF, DOCX, JPG, or PNG file.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    // Simulate file upload and AI parsing
    setTimeout(() => {
      // Mock parsed data - in real implementation, this would come from the backend
      const mockParsedData = {
        university: selectedInstitution.university,
        course: selectedInstitution.course,
        semester: selectedInstitution.semester,
        subjects: [
          {
            name: 'Data Structures and Algorithms',
            code: 'CS301',
            credits: 3,
            instructor: 'Dr. Smith',
          },
          {
            name: 'Database Systems',
            code: 'CS302',
            credits: 3,
            instructor: 'Dr. Johnson',
          },
          {
            name: 'Software Engineering',
            code: 'CS303',
            credits: 4,
            instructor: 'Dr. Williams',
          },
        ],
        timetable: [
          {
            subject: 'Data Structures and Algorithms',
            day: 'Monday',
            startTime: '09:00',
            endTime: '10:30',
            location: 'Room A101',
          },
          {
            subject: 'Database Systems',
            day: 'Wednesday',
            startTime: '11:00',
            endTime: '12:30',
            location: 'Room B205',
          },
          {
            subject: 'Software Engineering',
            day: 'Friday',
            startTime: '14:00',
            endTime: '15:30',
            location: 'Room C301',
          },
        ],
        examCalendar: [
          {
            subject: 'Data Structures and Algorithms',
            type: 'Midterm',
            date: '2024-11-15',
            duration: 120,
            location: 'Hall A',
          },
          {
            subject: 'Database Systems',
            type: 'Final',
            date: '2024-12-20',
            duration: 180,
            location: 'Hall B',
          },
        ],
      };

      setUploading(false);
      onUploadComplete(mockParsedData);
    }, 3000);
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (['jpg', 'png'].includes(extension || '')) return <Image className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4"
            data-testid="button-back-to-selector"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Syllabus
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {selectedInstitution.university} - {selectedInstitution.course}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedInstitution.semester}
            </p>
          </div>

          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload your syllabus document. Our AI will automatically extract course information, 
              timetables, and exam schedules for you.
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Syllabus Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                data-testid="dropzone-syllabus-upload"
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      {getFileIcon(selectedFile)}
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-4 justify-center">
                      <Button
                        onClick={() => setSelectedFile(null)}
                        variant="outline"
                        data-testid="button-remove-file"
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="bg-gradient-to-r from-purple-500 to-blue-500"
                        data-testid="button-upload-file"
                      >
                        {uploading ? 'Processing...' : 'Upload & Parse'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Drop your syllabus here
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        or click to browse files
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {allowedTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                        >
                          {type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      data-testid="button-browse-files"
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>• Maximum file size: 10MB</p>
                <p>• Supported formats: PDF, DOCX, JPG, PNG</p>
                <p>• AI will extract subjects, timetables, and exam schedules</p>
              </div>
            </CardContent>
          </Card>

          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>AI is parsing your syllabus...</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SyllabusUpload;