import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  GraduationCap,
  Bell,
  TrendingUp 
} from 'lucide-react';

interface InstitutionDashboardProps {
  selectedInstitution: {
    university: string;
    course: string;
    semester: string;
  };
  syllabusData: any;
  onBack: () => void;
}

const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ 
  selectedInstitution, 
  syllabusData, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });

  // Get today's classes
  const todaysClasses = syllabusData?.timetable?.filter((entry: any) => 
    entry.day === todayDay
  ) || [];

  // Get upcoming exams (next 30 days)
  const upcomingExams = syllabusData?.examCalendar?.filter((exam: any) => {
    const examDate = new Date(exam.date);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-testid="button-back-to-preview"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Preview
          </Button>
          
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedInstitution.university}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedInstitution.course} • {selectedInstitution.semester}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Institution Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your academic schedule and progress
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {syllabusData?.subjects?.length || 0}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Classes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {todaysClasses.length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Exams</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {upcomingExams.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Credits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {syllabusData?.subjects?.reduce((sum: number, subject: any) => sum + (subject.credits || 0), 0) || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Today's Classes ({todayDay})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysClasses.length > 0 ? (
                      <div className="space-y-3">
                        {todaysClasses.map((entry: any, index: number) => (
                          <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-medium">{entry.subject}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.startTime} - {entry.endTime} • {entry.location}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No classes today</p>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Exams */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Upcoming Exams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingExams.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingExams.slice(0, 3).map((exam: any, index: number) => (
                          <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{exam.subject}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(exam.date).toLocaleDateString()} • {exam.type}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {Math.ceil((new Date(exam.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No upcoming exams</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Weekly Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const dayClasses = syllabusData?.timetable?.filter((entry: any) => entry.day === day) || [];
                      return (
                        <div key={day} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">{day}</h3>
                          {dayClasses.length > 0 ? (
                            <div className="space-y-2">
                              {dayClasses.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <div>
                                    <span className="font-medium">{entry.subject}</span>
                                    <span className="text-sm text-gray-500 ml-2">{entry.location}</span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {entry.startTime} - {entry.endTime}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No classes</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    All Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {syllabusData?.subjects?.map((subject: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{subject.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Code: {subject.code} • Instructor: {subject.instructor}
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

            <TabsContent value="exams">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Exam Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {syllabusData?.examCalendar?.map((exam: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{exam.subject}</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {new Date(exam.date).toLocaleDateString()} • Duration: {exam.duration} minutes
                            </p>
                            <p className="text-sm text-gray-500">
                              Location: {exam.location}
                            </p>
                          </div>
                          <Badge 
                            variant={exam.type === 'Final' ? 'destructive' : exam.type === 'Midterm' ? 'default' : 'secondary'}
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
        </motion.div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;