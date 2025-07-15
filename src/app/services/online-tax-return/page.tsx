import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export default function OnlineTaxReturnPage() {
  return (
    <div>
      <Button asChild variant="outline">
              <Link href="/">
                  হোমে ফিরে যান <ArrowLeft className="ml-2 size-4" />
                </Link>
              </Button>
      <h1 className="text-2xl font-bold">অনলাইন ট্যাক্স রিটার্ন পরিষেবা</h1>
      <p>অনলাইনে আপনার আয়কর রিটার্ন দাখিল করুন।</p>
    </div>
  );
}
