
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Bot, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface TestResultsViewProps {
  results: {
    testId: string;
    testTitle: string;
    totalQuestions: number;
    answers: Record<string, any>;
    submittedAt: string;
    status: 'submitted' | 'checked' | 'ai-checked';
    score?: number;
    maxScore?: number;
    checkedAnswers?: Record<string, { isCorrect: boolean; correctAnswer?: string; marks: number }>;
    attemptId?: string;
  };
  onBackToDashboard: () => void;
}

export const TestResultsView = ({ results, onBackToDashboard }: TestResultsViewProps) => {
  const [checkingMethod, setCheckingMethod] = useState<'manual' | 'ai' | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnswerKeyFile(file);
    }
  };

  const handleManualCheck = async () => {
    if (!answerKeyFile) {
      toast({
        title: "Error",
        description: "Please select an answer key file first",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Here we would process the answer key and check answers
      console.log('Processing answer key:', answerKeyFile);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Answer Key Processed",
        description: "Your test has been checked against the answer key",
      });
      
      // In a real implementation, we would:
      // 1. Parse the answer key file
      // 2. Compare with user answers
      // 3. Update the test_attempts table with the score
      // 4. Store detailed results in a checking_results table
      // 5. Refresh the view to show results
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process answer key",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAICheck = async () => {
    setIsProcessing(true);
    
    try {
      // Here we would send to AI for checking
      console.log('Sending to AI for checking...');
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "AI Checking Complete",
        description: "Your test has been checked by AI",
      });
      
      // In a real implementation, we would:
      // 1. Send questions and answers to AI
      // 2. Get back the scoring and feedback
      // 3. Update the database with results
      // 4. Refresh the view to show results
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check with AI",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isChecked = results.status === 'checked' || results.status === 'ai-checked';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Test Results</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              Status: {results.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{results.testTitle}</span>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(results.submittedAt)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(results.answers).length}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {results.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {isChecked ? `${results.score}/${results.maxScore}` : 'Pending'}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checking Options - Show this for submitted tests */}
        {results.status === 'submitted' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Check Your Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                Choose how you want to check your test answers:
              </div>

              {/* Manual Checking */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">Upload Answer Key</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload an answer key file and we'll check your answers against it.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="answerKey">Choose Answer Key File</Label>
                    <Input
                      id="answerKey"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </div>
                  <Button 
                    onClick={handleManualCheck}
                    disabled={!answerKeyFile || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Check with Answer Key'}
                  </Button>
                </div>
              </div>

              {/* AI Checking */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Bot className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium">AI Checking</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Let our AI analyze your answers and provide automated checking.
                </p>
                <Button 
                  onClick={handleAICheck}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Check with AI'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display (if checked) */}
        {isChecked && results.checkedAnswers && Object.keys(results.checkedAnswers).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results.checkedAnswers).map(([questionId, result]) => (
                  <div key={questionId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Question {questionId}</span>
                      <div className="flex items-center space-x-2">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={result.isCorrect ? "default" : "destructive"}>
                          {result.marks} marks
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Your Answer: {results.answers[questionId]}</p>
                      {!result.isCorrect && result.correctAnswer && (
                        <p>Correct Answer: {result.correctAnswer}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Answers Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submitted Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(results.answers).map(([questionId, answer]) => (
                <div key={questionId} className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Question {questionId}</span>
                  <span className="text-gray-600">
                    {Array.isArray(answer) ? answer.join(', ') : answer}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
