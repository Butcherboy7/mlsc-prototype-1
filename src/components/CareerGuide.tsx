
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, User, Target, TrendingUp, BookOpen, Users } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: { text: string; weights: Record<string, number> }[];
}

interface PersonalityType {
  type: string;
  name: string;
  description: string;
  careers: string[];
  strengths: string[];
}

const personalityTypes: Record<string, PersonalityType> = {
  INTJ: {
    type: "INTJ",
    name: "The Architect",
    description: "Strategic and analytical thinkers who excel at planning and implementing complex solutions.",
    careers: ["Software Engineer", "Data Scientist", "Research Scientist", "Investment Analyst", "Systems Engineer"],
    strengths: ["Strategic thinking", "Problem-solving", "Independent work", "Long-term planning"]
  },
  ENFP: {
    type: "ENFP",
    name: "The Campaigner",
    description: "Enthusiastic and creative individuals who inspire others and thrive in dynamic environments.",
    careers: ["Marketing Manager", "Teacher", "Counselor", "Journalist", "Event Coordinator"],
    strengths: ["Creativity", "Communication", "Adaptability", "Team motivation"]
  },
  ISTJ: {
    type: "ISTJ",
    name: "The Logistician",
    description: "Practical and fact-minded individuals who are reliable and responsible.",
    careers: ["Accountant", "Project Manager", "Administrator", "Engineer", "Financial Analyst"],
    strengths: ["Organization", "Attention to detail", "Reliability", "Systematic approach"]
  },
  ESFJ: {
    type: "ESFJ",
    name: "The Consul",
    description: "Warm-hearted and cooperative individuals who value harmony and helping others.",
    careers: ["Human Resources", "Social Worker", "Teacher", "Healthcare Professional", "Customer Service Manager"],
    strengths: ["Empathy", "Communication", "Team collaboration", "Service orientation"]
  },
  ISTP: {
    type: "ISTP",
    name: "The Virtuoso",
    description: "Bold and practical experimenters who are masters of tools and techniques.",
    careers: ["Mechanical Engineer", "Programmer", "Pilot", "Chef", "Emergency Responder"],
    strengths: ["Problem-solving", "Hands-on skills", "Adaptability", "Technical expertise"]
  },
  ENFJ: {
    type: "ENFJ",
    name: "The Protagonist",
    description: "Charismatic and inspiring leaders who are passionate about helping others reach their potential.",
    careers: ["Manager", "Teacher", "Consultant", "Life Coach", "Non-profit Leader"],
    strengths: ["Leadership", "Communication", "Mentoring", "Vision setting"]
  }
};

const questions: Question[] = [
  {
    id: 1,
    text: "How do you prefer to spend your free time?",
    options: [
      { text: "Reading or learning something new", weights: { INTJ: 3, ISTJ: 2, ISTP: 1 } },
      { text: "Socializing with friends", weights: { ENFP: 3, ESFJ: 3, ENFJ: 2 } },
      { text: "Working on projects or hobbies", weights: { INTJ: 2, ISTP: 3, ISTJ: 2 } },
      { text: "Helping others or volunteering", weights: { ESFJ: 3, ENFJ: 3, ENFP: 2 } }
    ]
  },
  {
    id: 2,
    text: "In group discussions, you tend to:",
    options: [
      { text: "Listen carefully and contribute thoughtfully", weights: { INTJ: 3, ISTJ: 2, ISTP: 2 } },
      { text: "Lead the conversation enthusiastically", weights: { ENFP: 3, ENFJ: 3 } },
      { text: "Focus on practical solutions", weights: { ISTJ: 3, ISTP: 2, INTJ: 2 } },
      { text: "Ensure everyone feels heard", weights: { ESFJ: 3, ENFJ: 2, ENFP: 1 } }
    ]
  },
  {
    id: 3,
    text: "When facing a complex problem, you:",
    options: [
      { text: "Analyze it systematically", weights: { INTJ: 3, ISTJ: 3 } },
      { text: "Brainstorm creative solutions", weights: { ENFP: 3, ENFJ: 2 } },
      { text: "Try different approaches hands-on", weights: { ISTP: 3, ENFP: 1 } },
      { text: "Seek input from others", weights: { ESFJ: 3, ENFJ: 2 } }
    ]
  },
  {
    id: 4,
    text: "Your ideal work environment is:",
    options: [
      { text: "Quiet and organized", weights: { INTJ: 3, ISTJ: 3, ISTP: 2 } },
      { text: "Dynamic and collaborative", weights: { ENFP: 3, ESFJ: 2, ENFJ: 3 } },
      { text: "Flexible with minimal supervision", weights: { INTJ: 2, ISTP: 3, ENFP: 2 } },
      { text: "Supportive and people-focused", weights: { ESFJ: 3, ENFJ: 2 } }
    ]
  },
  {
    id: 5,
    text: "You feel most energized when:",
    options: [
      { text: "Working on long-term strategic projects", weights: { INTJ: 3, ENFJ: 2 } },
      { text: "Interacting with diverse groups of people", weights: { ENFP: 3, ESFJ: 2, ENFJ: 3 } },
      { text: "Solving immediate, practical problems", weights: { ISTP: 3, ISTJ: 2 } },
      { text: "Following established procedures effectively", weights: { ISTJ: 3, ESFJ: 2 } }
    ]
  }
];

const CareerGuide: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const question = questions[currentQuestion];
    const option = question.options[optionIndex];
    
    const newAnswers = { ...answers };
    Object.entries(option.weights).forEach(([type, weight]) => {
      newAnswers[type] = (newAnswers[type] || 0) + weight;
    });
    
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const getPersonalityResult = (): PersonalityType => {
    const topType = Object.entries(answers).reduce((a, b) => 
      answers[a[0]] > answers[b[0]] ? a : b
    )[0];
    
    return personalityTypes[topType] || personalityTypes.INTJ;
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTestStarted(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!testStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Career Guide</CardTitle>
            <p className="text-muted-foreground">
              Discover your personality type and explore careers that match your strengths
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Personality Assessment</h3>
                <p className="text-sm text-muted-foreground">Quick MBTI-style test</p>
              </div>
              <div className="p-4">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Career Matching</h3>
                <p className="text-sm text-muted-foreground">Personalized recommendations</p>
              </div>
              <div className="p-4">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Growth Insights</h3>
                <p className="text-sm text-muted-foreground">Understand your strengths</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={() => setTestStarted(true)} size="lg">
                <BookOpen className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const result = getPersonalityResult();
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Badge variant="outline" className="mx-auto mb-4 text-lg px-4 py-2">
              {result.type}
            </Badge>
            <CardTitle className="text-2xl">{result.name}</CardTitle>
            <p className="text-muted-foreground">{result.description}</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Recommended Careers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.careers.map((career, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span className="font-medium">{career}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span className="text-green-800 font-medium">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Want to explore more about your personality type or retake the assessment?
            </p>
            <Button onClick={resetTest} variant="outline">
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-6">{question.text}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left justify-start p-4 h-auto"
                onClick={() => handleAnswer(index)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerGuide;
