
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Upload, Clock, FileText } from 'lucide-react';

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
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [allowPublicUse, setAllowPublicUse] = useState<string>('');

  const handleStartTest = () => {
    if (!selectedPattern || !allowPublicUse) return;
    
    if (selectedPattern === 'custom' && !customTime) return;

    console.log({
      examPattern: selectedPattern,
      duration: selectedPattern === 'custom' ? parseInt(customTime) : examPatterns.find(p => p.id === selectedPattern)?.duration,
      allowPublicUse: allowPublicUse === 'yes'
    });

    // TODO: Start test creation process
    onOpenChange(false);
  };

  const isFormValid = selectedPattern && allowPublicUse && (selectedPattern !== 'custom' || customTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5" />
            Select Exam Pattern
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
              (Your PDF will be added to our Browse Tests section)
            </p>
            <RadioGroup value={allowPublicUse} onValueChange={setAllowPublicUse}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">
                  Yes, allow others to use this test
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
              disabled={!isFormValid}
              className="px-8"
            >
              Start Test Creation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
