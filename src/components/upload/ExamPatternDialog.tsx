
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Upload, Clock, FileText, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ExamPatternDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const examPatterns = [
  { id: 'jee-mains', name: 'JEE Mains', duration: 180 },
  { id: 'jee-advanced', name: 'JEE Advanced', duration: 180 },
  { id: 'cuet', name: 'CUET', duration: 120 },
  { id: 'sat', name: 'SAT', duration: 180 },
  { id: 'bitsat', name: 'BITSAT', duration: 180 },
  { id: 'neet', name: 'NEET', duration: 180 },
  { id: 'gate', name: 'GATE', duration: 180 },
  { id: 'cat', name: 'CAT', duration: 120 },
  { id: 'gmat', name: 'GMAT', duration: 210 },
  { id: 'gre', name: 'GRE', duration: 180 },
  { id: 'ielts', name: 'IELTS', duration: 60 },
  { id: 'toefl', name: 'TOEFL', duration: 240 },
  { id: 'upsc', name: 'UPSC', duration: 120 },
  { id: 'ssc', name: 'SSC', duration: 60 },
  { id: 'bank-po', name: 'Bank PO', duration: 60 },
  { id: 'custom', name: 'Custom Test', duration: 0 }
];

export const ExamPatternDialog = ({ open, onOpenChange }: ExamPatternDialogProps) => {
  const { user } = useAuth();
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [allowPublicUse, setAllowPublicUse] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      if (file) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStartTest = async () => {
    if (!selectedPattern || !allowPublicUse || !selectedFile || !user) return;
    
    if (selectedPattern === 'custom' && !customTime) return;

    setUploading(true);

    try {
      console.log('🚀 Starting test upload process...');
      console.log('Selected pattern:', selectedPattern);
      console.log('Allow public use:', allowPublicUse);
      console.log('File:', selectedFile.name);

      // Upload PDF to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('test-pdfs')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('test-pdfs')
        .getPublicUrl(fileName);

      console.log('📂 Generated public URL:', urlData.publicUrl);

      // Create test record in database
      const duration = selectedPattern === 'custom' ? parseInt(customTime) : examPatterns.find(p => p.id === selectedPattern)?.duration;
      const isPublic = allowPublicUse === 'yes';
      
      const testData = {
        user_id: user.id,
        title: selectedFile.name.replace('.pdf', ''),
        description: `${examPatterns.find(p => p.id === selectedPattern)?.name || 'Custom'} test uploaded from PDF`,
        pdf_url: urlData.publicUrl,
        duration_minutes: duration,
        exam_pattern: selectedPattern,
        is_public: isPublic,
        total_questions: 0 // Will be updated when PDF is processed
      };

      console.log('💾 Inserting test data:', testData);

      const { data: insertedTest, error: testError } = await supabase
        .from('tests')
        .insert(testData)
        .select()
        .single();

      if (testError) {
        console.error('❌ Database insert error:', testError);
        throw testError;
      }

      console.log('✅ Test created successfully:', insertedTest);

      // Show success message
      const examPatternName = examPatterns.find(p => p.id === selectedPattern)?.name || 'Custom';
      const publicMessage = isPublic 
        ? `and is now available for everyone in the ${examPatternName} category under Browse Tests`
        : 'and is private to your account';

      toast({
        title: "Test uploaded successfully!",
        description: `Your test "${insertedTest.title}" has been created ${publicMessage}.`,
      });

      // Log for debugging
      if (isPublic) {
        console.log(`🌍 Public test created in category: ${selectedPattern}`);
        console.log('📊 Test should now be visible in Browse Tests under', examPatternName);
      }

      // Reset form
      setSelectedPattern('');
      setCustomTime('');
      setAllowPublicUse('');
      setSelectedFile(null);
      
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error uploading test:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = selectedPattern && allowPublicUse && selectedFile && (selectedPattern !== 'custom' || customTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5" />
            Upload PDF & Select Exam Pattern
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* PDF Upload Section */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <File className="h-4 w-4" />
              Upload PDF File
            </Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mb-2"
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Selected: {selectedFile.name}
              </p>
            )}
            {!selectedFile && (
              <p className="text-sm text-gray-500">Please select a PDF file containing MCQ questions</p>
            )}
          </div>

          {/* Exam Pattern Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Choose Exam Pattern (This helps AI understand marking scheme and time limits)
            </Label>
            <RadioGroup value={selectedPattern} onValueChange={setSelectedPattern}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {examPatterns.map((pattern) => (
                  <Card key={pattern.id} className="relative">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={pattern.id} id={pattern.id} />
                      <div className="flex-1">
                        <Label 
                          htmlFor={pattern.id} 
                          className="font-medium cursor-pointer text-sm"
                        >
                          {pattern.name}
                        </Label>
                        {pattern.duration > 0 && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {pattern.duration} mins
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Custom Time Input */}
          {selectedPattern === 'custom' && (
            <div className="bg-blue-50 p-4 rounded-lg border">
              <Label htmlFor="customTime" className="text-sm font-medium mb-2 block">
                Enter Custom Test Duration (in minutes)
              </Label>
              <Input
                id="customTime"
                type="number"
                placeholder="e.g., 120"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                min="1"
                max="600"
                className="w-full"
                disabled={uploading}
              />
            </div>
          )}

          {/* Public Use Permission */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Share Test with Community
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Can we make this test available for other users to practice? 
              (Your PDF will be added to our Browse Tests section under the selected exam pattern)
            </p>
            <RadioGroup value={allowPublicUse} onValueChange={setAllowPublicUse}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">
                  Yes, allow others to use this test (will appear in Browse Tests)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">
                  No, keep it private to my account
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Start Test Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleStartTest} 
              disabled={!isFormValid || uploading}
              className="px-8"
            >
              {uploading ? 'Uploading...' : 'Upload & Create Test'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
