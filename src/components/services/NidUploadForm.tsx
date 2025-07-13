'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Upload, X, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NidUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'ফাইল খুব বড়',
          description: 'অনুগ্রহ করে ৫MB এর চেয়ে ছোট ফাইল আপলোড করুন।',
        });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'কোনো ফাইল নির্বাচন করা হয়নি',
        description: 'অনুগ্রহ করে আপনার এনআইডি কার্ডের একটি ছবি আপলোড করুন।',
      });
      return;
    }
    // Placeholder for actual upload logic
    console.log('Uploading file:', file.name);
    toast({
      title: 'আপলোড সফল হয়েছে',
      description: `ফাইল '${file.name}' সফলভাবে আপলোড করা হয়েছে।`,
    });
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <Card>
      <CardHeader>
        <CardTitle>এনআইডি আপলোড</CardTitle>
        <CardDescription>আপনার জাতীয় পরিচয়পত্রের একটি পরিষ্কার ছবি আপলোড করুন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="w-full aspect-video border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={triggerFileSelect}
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
                alt="NID Preview"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggerFileSelect from firing
                  handleRemoveImage();
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">ছবি মুছুন</span>
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <FileImage className="mx-auto h-12 w-12" />
              <p className="mt-2">ছবি নির্বাচন করতে এখানে ক্লিক করুন</p>
              <p className="text-xs mt-1">PNG, JPG, বা JPEG (সর্বোচ্চ 5MB)</p>
            </div>
          )}
        </div>
        <Input
          id="nid-upload"
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file}>
          <Upload className="mr-2 h-4 w-4" />
          আপলোড করুন
        </Button>
      </CardFooter>
    </Card>
  );
}
