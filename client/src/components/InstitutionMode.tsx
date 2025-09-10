import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UniversitySelector from '@/components/InstitutionMode/UniversitySelector';
import SyllabusUpload from '@/components/InstitutionMode/SyllabusUpload';
import SyllabusPreview from '@/components/InstitutionMode/SyllabusPreview';
import InstitutionDashboard from '@/components/InstitutionMode/InstitutionDashboard';

interface InstitutionModeProps {
  onBack: () => void;
}

type InstitutionStep = 'selector' | 'upload' | 'preview' | 'dashboard';

interface SelectedInstitution {
  university: string;
  course: string;
  semester: string;
}

const InstitutionMode: React.FC<InstitutionModeProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<InstitutionStep>('selector');
  const [selectedInstitution, setSelectedInstitution] = useState<SelectedInstitution | null>(null);
  const [parsedSyllabus, setParsedSyllabus] = useState<any>(null);

  const handleSelectionComplete = (selection: SelectedInstitution) => {
    setSelectedInstitution(selection);
    // Check if syllabus exists in DB, for now go to upload
    setCurrentStep('upload');
  };

  const handleUploadComplete = (parsed: any) => {
    setParsedSyllabus(parsed);
    setCurrentStep('preview');
  };

  const handlePreviewConfirm = () => {
    setCurrentStep('dashboard');
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'upload':
        setCurrentStep('selector');
        break;
      case 'preview':
        setCurrentStep('upload');
        break;
      case 'dashboard':
        setCurrentStep('preview');
        break;
      default:
        onBack();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'selector':
        return (
          <UniversitySelector 
            onSelectionComplete={handleSelectionComplete}
            onBack={onBack}
          />
        );
      case 'upload':
        return (
          <SyllabusUpload 
            selectedInstitution={selectedInstitution!}
            onUploadComplete={handleUploadComplete}
            onBack={handleStepBack}
          />
        );
      case 'preview':
        return (
          <SyllabusPreview 
            selectedInstitution={selectedInstitution!}
            parsedData={parsedSyllabus}
            onConfirm={handlePreviewConfirm}
            onBack={handleStepBack}
          />
        );
      case 'dashboard':
        return (
          <InstitutionDashboard 
            selectedInstitution={selectedInstitution!}
            syllabusData={parsedSyllabus}
            onBack={handleStepBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InstitutionMode;