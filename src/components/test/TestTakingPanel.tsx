
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Circle, AlertCircle, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { QuestionRenderer } from './QuestionRenderer';
import { TestSidebar } from './TestSidebar';
import { TestSubmissionDialog } from './TestSubmissionDialog';

interface Question {
  id: string;
  type: 'mcq' | 'multi-correct' | 'matrix-match' | 'numerical' | 'subjective';
  section: string;
  question: string;
  options?: string[];
  matrix?: { left: string[]; right: string[] };
  answer?: any;
  marks: number;
}

interface TestTakingPanelProps {
  testId: string;
  testTitle: string;
  duration: number; // in minutes
  questions: Question[];
  onTestSubmit: (answers: Record<string, any>) => void;
  onExit: () => void;
}

export const TestTakingPanel = ({ 
  testId, 
  testTitle, 
  duration, 
  questions, 
  onTestSubmit, 
  onExit 
}: TestTakingPanelProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Prevent page refresh/navigation during test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F5, Ctrl+R, Alt+F4, etc.
      if (e.key === 'F5' || 
          (e.ctrlKey && e.key === 'r') || 
          (e.altKey && e.key === 'F4') ||
          (e.ctrlKey && e.key === 'w')) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleAutoSubmit = () => {
    toast({
      title: "Time's up!",
      description: "Your test has been automatically submitted.",
      variant: "destructive",
    });
    onTestSubmit(answers);
  };

  const handleManualSubmit = () => {
    setShowSubmissionDialog(true);
  };

  const confirmSubmit = () => {
    onTestSubmit(answers);
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId] !== undefined) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'not-attempted';
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Test Sidebar */}
      <TestSidebar
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        onQuestionSelect={setCurrentQuestionIndex}
        testTitle={testTitle}
      />

      {/* Main Test Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{testTitle}</h1>
            <p className="text-blue-100">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-200' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleManualSubmit}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Submit Test
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Progress: {Math.round(progress)}%</span>
            <span>
              Answered: {Object.keys(answers).length} / {questions.length}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">{currentQuestion.section}</Badge>
                  <Badge variant="outline">{currentQuestion.type.toUpperCase()}</Badge>
                  <Badge variant="outline">{currentQuestion.marks} marks</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={flaggedQuestions.has(currentQuestion.id) ? 'text-red-600' : ''}
              >
                <Flag className="h-4 w-4 mr-1" />
                {flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
              </Button>
            </CardHeader>
            <CardContent>
              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Navigation Footer */}
        <div className="bg-gray-50 border-t p-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <Circle className="h-3 w-3 text-gray-400" />
              <span>Not Attempted</span>
              <CheckCircle className="h-3 w-3 text-green-500 ml-2" />
              <span>Answered</span>
              <Flag className="h-3 w-3 text-red-500 ml-2" />
              <span>Flagged</span>
            </div>
          </div>

          <Button
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Submission Dialog */}
      <TestSubmissionDialog
        open={showSubmissionDialog}
        onOpenChange={setShowSubmissionDialog}
        onConfirm={confirmSubmit}
        totalQuestions={questions.length}
        answeredQuestions={Object.keys(answers).length}
        timeLeft={timeLeft}
      />
    </div>
  );
};
