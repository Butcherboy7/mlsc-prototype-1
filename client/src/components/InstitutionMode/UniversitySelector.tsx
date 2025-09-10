import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Building, BookOpen, Calendar } from 'lucide-react';

interface UniversitySelectorProps {
  onSelectionComplete: (selection: { university: string; course: string; semester: string }) => void;
  onBack: () => void;
}

const UniversitySelector: React.FC<UniversitySelectorProps> = ({ onSelectionComplete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Mock data - in real implementation, this would come from the database
  const universities = [
    'Harvard University',
    'MIT',
    'Stanford University',
    'University of California, Berkeley',
    'Carnegie Mellon University',
    'University of Oxford',
    'University of Cambridge',
    'ETH Zurich',
  ];

  const courses = [
    'Computer Science',
    'Engineering',
    'Mathematics',
    'Physics',
    'Business Administration',
    'Medicine',
    'Law',
    'Economics',
  ];

  const semesters = [
    'Fall 2024',
    'Spring 2025',
    'Summer 2024',
    'Winter 2024',
  ];

  const filteredUniversities = universities.filter(uni =>
    uni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canProceed = selectedUniversity && selectedCourse && selectedSemester;

  const handleProceed = () => {
    if (canProceed) {
      onSelectionComplete({
        university: selectedUniversity,
        course: selectedCourse,
        semester: selectedSemester,
      });
    }
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
            data-testid="button-back-to-mode-selector"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mode Selection
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Select Your Institution
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose your university, course, and semester to get started
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* University Selection */}
              <div>
                <Label htmlFor="university-search" className="text-base font-medium">
                  University
                </Label>
                <div className="mt-2">
                  <Input
                    id="university-search"
                    placeholder="Search for your university..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3"
                    data-testid="input-university-search"
                  />
                  <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                    <SelectTrigger data-testid="select-university">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <Label htmlFor="course-select" className="text-base font-medium flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Course/Program
                </Label>
                <div className="mt-2">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Semester Selection */}
              <div>
                <Label htmlFor="semester-select" className="text-base font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Semester
                </Label>
                <div className="mt-2">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger data-testid="select-semester">
                      <SelectValue placeholder="Select your semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          {(selectedUniversity || selectedCourse || selectedSemester) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-lg">Your Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedUniversity && (
                      <p><span className="font-medium">University:</span> {selectedUniversity}</p>
                    )}
                    {selectedCourse && (
                      <p><span className="font-medium">Course:</span> {selectedCourse}</p>
                    )}
                    {selectedSemester && (
                      <p><span className="font-medium">Semester:</span> {selectedSemester}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleProceed}
              disabled={!canProceed}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
              data-testid="button-continue-to-upload"
            >
              Continue to Syllabus Setup
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UniversitySelector;