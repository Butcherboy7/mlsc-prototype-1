import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Edit, BookOpen, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SyllabusPreviewProps {
  selectedInstitution: {
    university: string;
    course: string;
    semester: string;
  };
  parsedData: any;
  onConfirm: () => void;
  onBack: () => void;
}

const SyllabusPreview: React.FC<SyllabusPreviewProps> = ({ 
  selectedInstitution, 
  parsedData, 
  onConfirm, 
  onBack 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4"
            data-testid="button-back-to-upload"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-toggle-edit"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'View Mode' : 'Edit Mode'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Preview Parsed Syllabus
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {selectedInstitution.university} - {selectedInstitution.course}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedInstitution.semester}
            </p>
          </div>

          <Tabs defaultValue="subjects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
              <TabsTrigger value="exams">Exam Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Course Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {parsedData?.subjects?.map((subject: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{subject.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Code: {subject.code} • Credits: {subject.credits}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Instructor: {subject.instructor}
                            </p>
                          </div>
                          <Badge variant="secondary">{subject.credits} Credits</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timetable">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Class Timetable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {parsedData?.timetable?.map((entry: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{entry.subject}</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {entry.day} • {entry.startTime} - {entry.endTime}
                            </p>
                            <p className="text-sm text-gray-500">
                              Location: {entry.location}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {entry.day}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Exam Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {parsedData?.examCalendar?.map((exam: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{exam.subject}</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {exam.type} • {new Date(exam.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Duration: {exam.duration} minutes • Location: {exam.location}
                            </p>
                          </div>
                          <Badge 
                            variant={exam.type === 'Final' ? 'destructive' : 'default'}
                          >
                            {exam.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-8">
            <Button
              onClick={onConfirm}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              data-testid="button-confirm-syllabus"
            >
              <Check className="w-5 h-5 mr-2" />
              Confirm & Save Syllabus
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SyllabusPreview;