import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export default function IrcPage() {
  return (
    <div>
      <Button asChild variant="outline">
              <Link href="/">
                  হোমে ফিরে যান <ArrowLeft className="ml-2 size-4" />
                </Link>
              </Button>
      <h1 className="text-2xl font-bold">আইআরসি পরিষেবা</h1>
      <p>আমদানি নিবন্ধন সার্টিফিকেট (IRC) এর জন্য আবেদন করুন।</p>
    </div>
  );
}
