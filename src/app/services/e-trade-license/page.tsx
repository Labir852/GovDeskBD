import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export default function ETradeLicensePage() {
  return (
    <div>
      <Button asChild variant="outline">
              <Link href="/">
                  হোমে ফিরে যান <ArrowLeft className="ml-2 size-4" />
                </Link>
              </Button>
      <h1 className="text-2xl font-bold">ই-ট্রেড লাইসেন্স পরিষেবা</h1>
      <p>আপনার ই-ট্রেড লাইসেন্সের জন্য আবেদন বা নবায়ন করুন।</p>
    </div>
  );
}
