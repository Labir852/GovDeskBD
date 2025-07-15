import NidUploadForm from "@/components/services/NidUploadForm";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function TinCertificatePage() {
  return (
    <div className="flex flex-col gap-8">
      <Button asChild variant="outline">
              <Link href="/">
                  হোমে ফিরে যান <ArrowLeft className="ml-2 size-4" />
                </Link>
              </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">টিন সার্টিফিকেট পরিষেবা</h1>
        <p className="text-muted-foreground">আপনার করদাতা শনাক্তকরণ নম্বর (TIN) সার্টিফিকেট পান।</p>
      </div>
      <NidUploadForm />
    </div>
  );
}
