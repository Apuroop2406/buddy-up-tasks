import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Image, Loader2, CheckCircle, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  taskDescription?: string;
  taskType?: string;
}

interface VerificationDetails {
  confidence: number;
  matchedKeywords: string[];
  concerns: string[];
}

const SubmitProofModal: React.FC<SubmitProofModalProps> = ({ 
  isOpen, 
  onClose, 
  taskId, 
  taskTitle,
  taskDescription,
  taskType = 'assignment'
}) => {
  const { user } = useAuth();
  const { submitProof, updateTask } = useTasks();
  const [proofText, setProofText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'approved' | 'rejected' | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);
  const [aiFeedback, setAiFeedback] = useState('');
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

  const verifyWithAI = async (proofUrl?: string): Promise<{ 
    approved: boolean; 
    feedback: string;
    confidence: number;
    matchedKeywords: string[];
    concerns: string[];
  }> => {
    const { data, error } = await supabase.functions.invoke('verify-proof', {
      body: {
        taskTitle,
        taskDescription,
        taskType,
        proofText,
        proofUrl,
      },
    });

    if (error) {
      console.error('AI verification error:', error);
      throw new Error('Verification failed. Please try again.');
    }

    if (!data.success) {
      throw new Error(data.error || 'Verification failed');
    }

    return {
      approved: data.approved,
      feedback: data.feedback,
      confidence: data.confidence || 0,
      matchedKeywords: data.matchedKeywords || [],
      concerns: data.concerns || [],
    };
  };

  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    let fileHash: string | undefined;

    try {
      // Upload file if provided
      if (file) {
        // Compute hash for duplicate detection
        fileHash = await computeFileHash(file);

        // Check for duplicates across all accounts using server function (bypasses RLS)
        const { data: isDuplicate, error: dupError } = await supabase
          .rpc('check_duplicate_proof_hash', {
            p_hash: fileHash,
            p_user_id: user.id,
          });

        if (dupError) {
          console.error('Duplicate check error:', dupError);
        }

        if (isDuplicate) {
          toast.error('⚠️ This proof has already been submitted by another user. Please upload your own original work.');
          setIsUploading(false);
          return;
        }

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
        proofHash: fileHash,
      });

      setIsUploading(false);
      setIsVerifying(true);

      // Real AI verification
      const result = await verifyWithAI(proofUrl);
      
      // Store verification details
      setVerificationDetails({
        confidence: result.confidence,
        matchedKeywords: result.matchedKeywords,
        concerns: result.concerns,
      });
      setAiFeedback(result.feedback);
      
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
        toast.success(`🎉 Task approved! Confidence: ${result.confidence}%`);
      } else {
        toast.error(result.feedback);
      }

      // Close modal after showing result - let lock context re-evaluate
      setTimeout(async () => {
        resetForm();
        onClose();
      }, 3500);

    } catch (error) {
      console.error('Proof submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit proof');
      setIsUploading(false);
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setProofText('');
    setFile(null);
    setIsUploading(false);
    setIsVerifying(false);
    setVerificationResult(null);
    setVerificationDetails(null);
    setAiFeedback('');
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto"
            >
            <div className="p-6">
              {isVerifying || verificationResult ? (
                <div className="text-center py-6">
                  {isVerifying && !verificationResult && (
                    <>
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <Loader2 className="w-20 h-20 text-primary animate-spin" />
                        <ShieldCheck className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-2">AI Analyzing Your Proof...</h2>
                      <p className="text-muted-foreground text-sm">Checking relevance to: "{taskTitle}"</p>
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
                      <h2 className="text-xl font-bold text-success mb-2">Verified & Approved! 🎉</h2>
                      {verificationDetails && (
                        <div className="mt-4 space-y-3 text-left">
                          <div className="bg-success/10 rounded-lg p-3">
                            <p className="text-sm text-foreground font-medium">Confidence: {verificationDetails.confidence}%</p>
                          </div>
                          {verificationDetails.matchedKeywords.length > 0 && (
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-2">Matched Keywords:</p>
                              <div className="flex flex-wrap gap-1">
                                {verificationDetails.matchedKeywords.map((keyword, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{aiFeedback}</p>
                        </div>
                      )}
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
                      <h2 className="text-xl font-bold text-destructive mb-2">Verification Failed</h2>
                      {verificationDetails && (
                        <div className="mt-4 space-y-3 text-left">
                          <div className="bg-destructive/10 rounded-lg p-3">
                            <p className="text-sm text-foreground font-medium">Confidence: {verificationDetails.confidence}%</p>
                          </div>
                          {verificationDetails.concerns.length > 0 && (
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Issues Found:
                              </p>
                              <ul className="text-xs text-foreground space-y-1">
                                {verificationDetails.concerns.map((concern, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-destructive">•</span> {concern}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{aiFeedback}</p>
                        </div>
                      )}
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmitProofModal;
