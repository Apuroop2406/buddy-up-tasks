import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Image, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

interface SubmitProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  taskTitle: string;
}

const SubmitProofModal: React.FC<SubmitProofModalProps> = ({ isOpen, onClose, taskId, taskTitle }) => {
  const { user } = useAuth();
  const { submitProof, updateTask } = useTasks();
  const [proofText, setProofText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'approved' | 'rejected' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const simulateAIVerification = async (hasProof: boolean): Promise<{ approved: boolean; feedback: string }> => {
    // Simulate AI verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, approve if there's substantial proof
    if (hasProof && (proofText.length > 20 || file)) {
      return {
        approved: true,
        feedback: 'Great job! Your proof has been verified. Keep up the excellent work! 🎉',
      };
    } else if (hasProof) {
      return {
        approved: false,
        feedback: 'Please provide more detailed proof of your work. Add a longer description or upload a file showing your completed work.',
      };
    }
    return {
      approved: false,
      feedback: 'No proof provided. Please submit evidence of your completed work.',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !user) return;

    if (!proofText && !file) {
      toast.error('Please provide proof of completion');
      return;
    }

    setIsUploading(true);
    let proofUrl: string | undefined;

    try {
      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${taskId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('proofs')
          .getPublicUrl(fileName);
        
        proofUrl = urlData.publicUrl;
      }

      // Submit the proof
      await submitProof.mutateAsync({
        taskId,
        proofUrl,
        proofText: proofText || undefined,
      });

      setIsUploading(false);
      setIsVerifying(true);

      // Simulate AI verification
      const result = await simulateAIVerification(!!(proofText || file));
      
      // Update task with verification result
      await updateTask.mutateAsync({
        id: taskId,
        status: result.approved ? 'approved' : 'rejected',
        ai_verified: true,
        ai_feedback: result.feedback,
        points_earned: result.approved ? 10 : 0,
        approved_at: result.approved ? new Date().toISOString() : null,
      });

      setVerificationResult(result.approved ? 'approved' : 'rejected');

      if (result.approved) {
        toast.success('🎉 Task approved! You earned 10 points!');
      } else {
        toast.error(result.feedback);
      }

      // Close modal after showing result
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      toast.error('Failed to submit proof');
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setProofText('');
    setFile(null);
    setIsUploading(false);
    setIsVerifying(false);
    setVerificationResult(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-card rounded-2xl shadow-lg z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {isVerifying || verificationResult ? (
                <div className="text-center py-8">
                  {isVerifying && !verificationResult && (
                    <>
                      <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
                      <h2 className="text-xl font-bold text-foreground mb-2">AI Verifying...</h2>
                      <p className="text-muted-foreground">Checking your submission</p>
                    </>
                  )}
                  {verificationResult === 'approved' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                    >
                      <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-12 h-12 text-success" />
                      </div>
                      <h2 className="text-xl font-bold text-success mb-2">Approved! 🎉</h2>
                      <p className="text-muted-foreground">Great work! +10 points earned</p>
                    </motion.div>
                  )}
                  {verificationResult === 'rejected' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                    >
                      <div className="w-20 h-20 mx-auto bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-12 h-12 text-destructive" />
                      </div>
                      <h2 className="text-xl font-bold text-destructive mb-2">Needs More Work</h2>
                      <p className="text-muted-foreground">Please provide more detailed proof</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Submit Proof</h2>
                      <p className="text-sm text-muted-foreground mt-1">{taskTitle}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label className="text-foreground font-medium mb-3 block">
                        Upload Proof (Image/PDF)
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors text-center"
                      >
                        {file ? (
                          <div className="flex items-center justify-center gap-3">
                            {file.type.startsWith('image/') ? (
                              <Image className="w-8 h-8 text-primary" />
                            ) : (
                              <FileText className="w-8 h-8 text-primary" />
                            )}
                            <span className="text-foreground font-medium">{file.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                            <span className="text-muted-foreground">
                              Click to upload or drag & drop
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-muted-foreground text-sm">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div>
                      <Label htmlFor="proofText" className="text-foreground font-medium">
                        Describe Your Work
                      </Label>
                      <Textarea
                        id="proofText"
                        placeholder="Explain what you completed and how..."
                        value={proofText}
                        onChange={(e) => setProofText(e.target.value)}
                        className="input-field mt-2 min-h-[120px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="btn-accent w-full text-lg py-6"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Submit for AI Verification
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmitProofModal;
