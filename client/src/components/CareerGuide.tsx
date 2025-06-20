import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, User, Target, TrendingUp, BookOpen, Users, Award, AlertTriangle, ArrowLeft } from 'lucide-react';

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
  weaknesses: string[];
}

const personalityTypes: Record<string, PersonalityType> = {
  INTJ: {
    type: "INTJ",
    name: "The Architect",
    description: "Strategic and analytical thinkers who excel at planning and implementing complex solutions.",
    careers: ["Software Engineer", "Data Scientist", "Research Scientist", "Investment Analyst", "Systems Engineer"],
    strengths: ["Strategic thinking", "Problem-solving", "Independent work", "Long-term planning"],
    weaknesses: ["Social situations", "Expressing emotions", "Dealing with interruptions"]
  },
  ENFP: {
    type: "ENFP",
    name: "The Campaigner",
    description: "Enthusiastic and creative individuals who inspire others and thrive in dynamic environments.",
    careers: ["Marketing Manager", "Teacher", "Counselor", "Journalist", "Event Coordinator"],
    strengths: ["Creativity", "Communication", "Adaptability", "Team motivation"],
    weaknesses: ["Attention to detail", "Following routines", "Administrative tasks"]
  },
  ISTJ: {
    type: "ISTJ",
    name: "The Logistician",
    description: "Practical and fact-minded individuals who are reliable and responsible.",
    careers: ["Accountant", "Project Manager", "Administrator", "Engineer", "Financial Analyst"],
    strengths: ["Organization", "Attention to detail", "Reliability", "Systematic approach"],
    weaknesses: ["Adapting to change", "Creative thinking", "Expressing emotions"]
  },
  ESFJ: {
    type: "ESFJ",
    name: "The Consul",
    description: "Warm-hearted and cooperative individuals who value harmony and helping others.",
    careers: ["Human Resources", "Social Worker", "Teacher", "Healthcare Professional", "Customer Service Manager"],
    strengths: ["Empathy", "Communication", "Team collaboration", "Service orientation"],
    weaknesses: ["Handling criticism", "Making tough decisions", "Self-advocacy"]
  },
  ISTP: {
    type: "ISTP",
    name: "The Virtuoso",
    description: "Bold and practical experimenters who are masters of tools and techniques.",
    careers: ["Mechanical Engineer", "Programmer", "Pilot", "Chef", "Emergency Responder"],
    strengths: ["Problem-solving", "Hands-on skills", "Adaptability", "Technical expertise"],
    weaknesses: ["Long-term planning", "Team communication", "Following rules"]
  },
  ENFJ: {
    type: "ENFJ",
    name: "The Protagonist",
    description: "Charismatic and inspiring leaders who are passionate about helping others reach their potential.",
    careers: ["Manager", "Teacher", "Consultant", "Life Coach", "Non-profit Leader"],
    strengths: ["Leadership", "Communication", "Mentoring", "Vision setting"],
    weaknesses: ["Overcommitting", "Taking criticism personally", "Neglecting own needs"]
  },
  INTP: {
    type: "INTP",
    name: "The Thinker",
    description: "Innovative inventors with an unquenchable thirst for knowledge and understanding.",
    careers: ["Research Scientist", "Software Developer", "Philosopher", "Mathematician", "Writer"],
    strengths: ["Analytical thinking", "Innovation", "Independence", "Objectivity"],
    weaknesses: ["Social interaction", "Practical matters", "Emotional expression"]
  },
  ESTP: {
    type: "ESTP",
    name: "The Entrepreneur",
    description: "Smart, energetic, and perceptive people who truly enjoy living on the edge.",
    careers: ["Sales Representative", "Entrepreneur", "Paramedic", "Marketing Executive", "Event Planner"],
    strengths: ["Adaptability", "People skills", "Practical problem-solving", "Crisis management"],
    weaknesses: ["Long-term planning", "Attention to detail", "Theoretical concepts"]
  }
};

const questions: Question[] = [
  {
    id: 1,
    text: "At a party, you would rather:",
    options: [
      { text: "Interact with many people, including strangers", weights: { ENFP: 3, ESFJ: 3, ENFJ: 3, ESTP: 3 } },
      { text: "Interact with a few people you know well", weights: { INTJ: 3, ISTJ: 3, ISTP: 3, INTP: 3 } }
    ]
  },
  {
    id: 2,
    text: "You are more drawn to:",
    options: [
      { text: "Possibilities and potential", weights: { ENFP: 3, INTJ: 3, ENFJ: 2, INTP: 3 } },
      { text: "Facts and reality", weights: { ISTJ: 3, ESFJ: 3, ISTP: 3, ESTP: 3 } }
    ]
  },
  {
    id: 3,
    text: "When making decisions, you rely more on:",
    options: [
      { text: "Logic and analysis", weights: { INTJ: 3, ISTP: 3, INTP: 3, ESTP: 2 } },
      { text: "Personal values and feelings", weights: { ENFP: 3, ESFJ: 3, ENFJ: 3, ISTJ: 1 } }
    ]
  },
  {
    id: 4,
    text: "You prefer to:",
    options: [
      { text: "Have things settled and decided", weights: { INTJ: 3, ISTJ: 3, ESFJ: 3, ENFJ: 3 } },
      { text: "Keep your options open", weights: { ENFP: 3, ISTP: 3, INTP: 3, ESTP: 3 } }
    ]
  },
  {
    id: 5,
    text: "In group discussions, you tend to:",
    options: [
      { text: "Lead the conversation", weights: { ENFJ: 3, ENFP: 2, ESFJ: 2, ESTP: 3 } },
      { text: "Listen and contribute when needed", weights: { INTJ: 3, ISTJ: 3, ISTP: 3, INTP: 3 } }
    ]
  },
  {
    id: 6,
    text: "You are more comfortable with:",
    options: [
      { text: "Theoretical discussions", weights: { INTJ: 3, ENFP: 2, INTP: 3, ENFJ: 1 } },
      { text: "Practical, hands-on activities", weights: { ISTJ: 3, ESFJ: 2, ISTP: 3, ESTP: 3 } }
    ]
  },
  {
    id: 7,
    text: "When solving problems, you prefer to:",
    options: [
      { text: "Use established methods", weights: { ISTJ: 3, ESFJ: 3, ENFJ: 2, ESTP: 1 } },
      { text: "Try new approaches", weights: { ENFP: 3, INTJ: 2, ISTP: 3, INTP: 3 } }
    ]
  },
  {
    id: 8,
    text: "You work best:",
    options: [
      { text: "In a structured environment", weights: { ISTJ: 3, INTJ: 2, ESFJ: 3, ENFJ: 2 } },
      { text: "With flexibility and freedom", weights: { ENFP: 3, ISTP: 3, INTP: 3, ESTP: 3 } }
    ]
  },
  {
    id: 9,
    text: "You are energized by:",
    options: [
      { text: "Social interaction", weights: { ENFP: 3, ESFJ: 3, ENFJ: 3, ESTP: 3 } },
      { text: "Quiet reflection", weights: { INTJ: 3, ISTJ: 3, ISTP: 3, INTP: 3 } }
    ]
  },
  {
    id: 10,
    text: "You focus more on:",
    options: [
      { text: "The big picture", weights: { INTJ: 3, ENFP: 3, ENFJ: 3, INTP: 2 } },
      { text: "Specific details", weights: { ISTJ: 3, ESFJ: 3, ISTP: 2, ESTP: 2 } }
    ]
  },
  {
    id: 11,
    text: "You make decisions based on:",
    options: [
      { text: "Objective criteria", weights: { INTJ: 3, ISTJ: 2, ISTP: 3, INTP: 3 } },
      { text: "How it affects people", weights: { ENFP: 3, ESFJ: 3, ENFJ: 3, ESTP: 1 } }
    ]
  },
  {
    id: 12,
    text: "You prefer to work:",
    options: [
      { text: "With deadlines and schedules", weights: { INTJ: 2, ISTJ: 3, ESFJ: 3, ENFJ: 3 } },
      { text: "At your own pace", weights: { ENFP: 3, ISTP: 3, INTP: 3, ESTP: 2 } }
    ]
  },
  {
    id: 13,
    text: "You learn best through:",
    options: [
      { text: "Discussion and interaction", weights: { ENFP: 3, ESFJ: 2, ENFJ: 3, ESTP: 3 } },
      { text: "Independent study", weights: { INTJ: 3, ISTJ: 3, ISTP: 2, INTP: 3 } }
    ]
  },
  {
    id: 14,
    text: "You are more interested in:",
    options: [
      { text: "What could be", weights: { ENFP: 3, INTJ: 3, ENFJ: 2, INTP: 3 } },
      { text: "What is", weights: { ISTJ: 3, ESFJ: 3, ISTP: 3, ESTP: 3 } }
    ]
  },
  {
    id: 15,
    text: "When facing criticism, you:",
    options: [
      { text: "Analyze it objectively", weights: { INTJ: 3, ISTJ: 2, ISTP: 3, INTP: 3 } },
      { text: "Consider the personal impact", weights: { ENFP: 3, ESFJ: 3, ENFJ: 3, ESTP: 1 } }
    ]
  }
];

interface CareerGuideProps {
  onBack: () => void;
}

const CareerGuide: React.FC<CareerGuideProps> = ({ onBack }) => {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Career Guide</h1>
            <p className="text-muted-foreground">Discover your ideal career path</p>
          </div>
          <div></div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">MBTI Personality Assessment</CardTitle>
            <p className="text-muted-foreground">
              Discover your personality type with our comprehensive 15-question assessment
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Personality Assessment</h3>
                <p className="text-sm text-muted-foreground">15-question MBTI-style test</p>
              </div>
              <div className="p-4">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Career Matching</h3>
                <p className="text-sm text-muted-foreground">5 personalized recommendations</p>
              </div>
              <div className="p-4">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Strengths & Weaknesses</h3>
                <p className="text-sm text-muted-foreground">Detailed personality insights</p>
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
                <Award className="w-5 h-5 mr-2" />
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
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Areas for Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-orange-800 font-medium">{weakness}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
