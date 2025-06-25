
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Play, BarChart3, LogOut, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ExamPatternDialog } from '@/components/upload/ExamPatternDialog';
import { BrowseTests } from '@/components/browse/BrowseTests';

interface Test {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
  created_at: string;
  exam_pattern?: string;
  is_public?: boolean;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'browse'>('dashboard');

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchTests();
    }
  }, [currentView]);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', user?.id)
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

  const handleBrowseClick = () => {
    setCurrentView('browse');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (currentView === 'browse') {
    return (
      <div>
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">MCQ Test Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                  ← Back to Dashboard
                </Button>
                <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>
        <BrowseTests />
      </div>
    );
  }

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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleBrowseClick}>
            <CardHeader className="text-center">
              <Search className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Browse Tests</CardTitle>
              <CardDescription>Explore available tests by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={handleBrowseClick}>
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
                        {test.exam_pattern && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {test.exam_pattern.toUpperCase()}
                          </span>
                        )}
                        {test.is_public && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Public
                          </span>
                        )}
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
