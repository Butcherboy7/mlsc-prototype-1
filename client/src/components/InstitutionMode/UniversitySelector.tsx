import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Building, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface UniversitySelectorProps {
  onSelectionComplete: (selection: { university: string; course: string; semester: string }) => void;
  onBack: () => void;
}

const UniversitySelector: React.FC<UniversitySelectorProps> = ({ onSelectionComplete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);

  // Fetch universities from our backend (which uses the hipolabs API)
  const { data: universities = [], isLoading: universitiesLoading } = useQuery({
    queryKey: ['universities', selectedCountry],
    queryFn: async () => {
      const url = `/api/institutions/universities?country=${selectedCountry}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch universities');
      return response.json();
    }
  });

  // Fetch course data for selected university in the new format
  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courseData', selectedUniversityId, selectedUniversity],
    queryFn: async () => {
      if (!selectedUniversityId || !selectedUniversity) return null;
      const university = universities.find((uni: any) => uni.name === selectedUniversity);
      const location = university ? `${university.city}, ${university.state}` : 'Unknown';
      const response = await fetch(`/api/institutions/universities/${selectedUniversityId}/courses?name=${encodeURIComponent(selectedUniversity)}&location=${encodeURIComponent(location)}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !!selectedUniversityId && !!selectedUniversity
  });

  // Year-based semester options
  const semesters = [
    '1st Year 1st Semester',
    '1st Year 2nd Semester', 
    '2nd Year 1st Semester',
    '2nd Year 2nd Semester',
    '3rd Year 1st Semester',
    '3rd Year 2nd Semester',
    '4th Year 1st Semester',
    '4th Year 2nd Semester',
    '5th Year 1st Semester',
    '5th Year 2nd Semester',
  ];

  const countries = [
    'India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'China', 'Japan', 'Brazil'
  ];


  const filteredUniversities = universities.filter((uni: any) =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUniversityChange = (universityName: string) => {
    setSelectedUniversity(universityName);
    const university = universities.find((uni: any) => uni.name === universityName);
    if (university) {
      setSelectedUniversityId(university.id || Math.abs(university.name.split('').reduce((a: number, b: string) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)));
    }
    setSelectedCourse(''); // Reset course when university changes
  };

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
              {/* Country Selection */}
              <div>
                <Label htmlFor="country-select" className="text-base font-medium">
                  Country
                </Label>
                <div className="mt-2">
                  <Select value={selectedCountry} onValueChange={(value) => {
                    setSelectedCountry(value);
                    setSelectedUniversity('');
                    setSelectedCourse('');
                    setSelectedUniversityId(null);
                  }}>
                    <SelectTrigger data-testid="select-country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


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
                    disabled={universitiesLoading}
                  />
                  <Select value={selectedUniversity} onValueChange={handleUniversityChange} disabled={universitiesLoading}>
                    <SelectTrigger data-testid="select-university">
                      <SelectValue placeholder={universitiesLoading ? "Loading universities..." : "Select your university"} />
                    </SelectTrigger>
                    <SelectContent>
                      {universitiesLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        filteredUniversities.map((uni: any) => (
                          <SelectItem key={uni.name} value={uni.name}>
                            {uni.name}
                          </SelectItem>
                        ))
                      )}
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
                  <Select 
                    value={selectedCourse} 
                    onValueChange={setSelectedCourse}
                    disabled={!selectedUniversity || coursesLoading}
                  >
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder={
                        !selectedUniversity ? "Select university first" :
                        coursesLoading ? "Loading courses..." : 
                        "Select your course"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading courses...
                        </div>
                      ) : courseData?.courses?.length > 0 ? (
                        courseData.courses.map((course: any) => (
                          <SelectItem key={course.name} value={course.name}>
                            {course.name} ({course.degree})
                          </SelectItem>
                        ))
                      ) : selectedUniversity ? (
                        <div className="p-4 text-gray-500 text-center">
                          No courses available for this university
                        </div>
                      ) : null}
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