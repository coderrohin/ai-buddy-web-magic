
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Bot, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  };
  onBackToDashboard: () => void;
}

export const TestResultsView = ({ results, onBackToDashboard }: TestResultsViewProps) => {
  const [checkingMethod, setCheckingMethod] = useState<'manual' | 'ai' | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnswerKeyFile(file);
    }
  };

  const handleManualCheck = () => {
    if (!answerKeyFile) return;
    
    // Here we would process the answer key and check answers
    console.log('Processing answer key:', answerKeyFile);
    // For now, show a placeholder
  };

  const handleAICheck = () => {
    // Here we would send to AI for checking
    console.log('Sending to AI for checking...');
    // For now, show a placeholder
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
                Back to Dashboard
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

        {/* Checking Options */}
        {!isChecked && (
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
                    />
                  </div>
                  <Button 
                    onClick={handleManualCheck}
                    disabled={!answerKeyFile}
                    className="w-full"
                  >
                    Check with Answer Key
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
                >
                  Check with AI
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display (if checked) */}
        {isChecked && results.checkedAnswers && (
          <Card>
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

        {/* Your Answers Preview (for submitted tests) */}
        {results.status === 'submitted' && (
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
        )}
      </main>
    </div>
  );
};
