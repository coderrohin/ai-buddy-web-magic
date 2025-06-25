import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Play, BarChart3, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ExamPatternDialog } from '@/components/upload/ExamPatternDialog';

interface Test {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
  created_at: string;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamDialog, setShowExamDialog] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "Failed to load tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const handleUploadClick = () => {
    setShowExamDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">MCQ Test Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your tests and track your progress</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleUploadClick}>
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>Upload Test</CardTitle>
              <CardDescription>Upload a PDF with MCQs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleUploadClick}>
                Upload PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Play className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Take Test</CardTitle>
              <CardDescription>Start a practice test</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Browse Tests
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle>View Results</CardTitle>
              <CardDescription>Check your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tests</CardTitle>
            <CardDescription>
              {tests.length === 0 ? 'No tests uploaded yet' : `${tests.length} test(s) available`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading tests...</div>
            ) : tests.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
                <p className="text-gray-600 mb-4">Upload your first PDF to get started</p>
                <Button onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-900">{test.title}</h4>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{test.total_questions} questions</span>
                        <span>{test.duration_minutes} minutes</span>
                        <span>Created {new Date(test.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Exam Pattern Dialog */}
      <ExamPatternDialog 
        open={showExamDialog} 
        onOpenChange={setShowExamDialog} 
      />
    </div>
  );
};
