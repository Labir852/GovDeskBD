'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Document = {
  id: string;
  label: string;
  optional?: boolean;
};

type MultiDocUploadFormProps = {
  documents: Document[];
};

export default function MultiDocUploadForm({ documents }: MultiDocUploadFormProps) {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, docId: string) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
       if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'ফাইল খুব বড়',
          description: 'অনুগ্রহ করে ১০MB এর চেয়ে ছোট ফাইল আপলোড করুন।',
        });
        return;
      }
      setFiles((prevFiles) => ({ ...prevFiles, [docId]: selectedFile }));
    }
  };

  const handleRemoveFile = (docId: string) => {
    setFiles((prevFiles) => ({ ...prevFiles, [docId]: null }));
    const inputRef = fileInputRefs.current[docId];
    if (inputRef) {
      inputRef.value = '';
    }
  };

  const triggerFileSelect = (docId: string) => fileInputRefs.current[docId]?.click();
  
  const handleSubmit = () => {
    const requiredDocs = documents.filter(doc => !doc.optional);
    const missingDocs = requiredDocs.filter(doc => !files[doc.id]);

    if (missingDocs.length > 0) {
        toast({
            variant: 'destructive',
            title: 'প্রয়োজনীয় ডকুমেন্ট দিন',
            description: `অনুগ্রহ করে এই ডকুমেন্টগুলো আপলোড করুন: ${missingDocs.map(d => d.label).join(', ')}`,
        });
        return;
    }

    // Placeholder for actual upload logic
    console.log('Uploading files:', files);
    toast({
      title: 'আপলোড সফল হয়েছে',
      description: 'আপনার ডকুমেন্টগুলো সফলভাবে আপলোড করা হয়েছে।',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>প্রয়োজনীয় ডকুমেন্ট আপলোড করুন</CardTitle>
        <CardDescription>প্রতিটি প্রয়োজনীয় ডকুমেন্টের জন্য ফাইল আপলোড করুন (ছবি বা পিডিএফ)।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="space-y-2">
            <Label htmlFor={doc.id} className="flex items-center gap-2">
                <span>{doc.label}</span>
                {doc.optional && <span className="text-xs text-muted-foreground">(ঐচ্ছিক)</span>}
            </Label>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    onClick={() => triggerFileSelect(doc.id)} 
                    className={cn("w-full justify-start text-left", files[doc.id] ? "border-green-500" : "")}
                >
                    {files[doc.id] ? (
                        <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="truncate">{files[doc.id]?.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <File className="h-4 w-4" />
                            <span>একটি ফাইল নির্বাচন করুন...</span>
                        </div>
                    )}
                </Button>
                {files[doc.id] && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(doc.id)}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <input
              id={doc.id}
              type="file"
              ref={(el) => (fileInputRefs.current[doc.id] = el)}
              className="hidden"
              onChange={(e) => handleFileChange(e, doc.id)}
              accept="image/png, image/jpeg, application/pdf"
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>
          <Upload className="mr-2 h-4 w-4" />
          সব ডকুমেন্ট জমা দিন
        </Button>
      </CardFooter>
    </Card>
  );
}
