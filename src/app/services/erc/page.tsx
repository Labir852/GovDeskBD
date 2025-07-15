import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export default function ErcPage() {
  return (
    <div>
      <Button asChild variant="outline">
              <Link href="/">
                  হোমে ফিরে যান <ArrowLeft className="ml-2 size-4" />
                </Link>
              </Button>
      <h1 className="text-2xl font-bold">ইআরসি পরিষেবা</h1>
      <p>রপ্তানি নিবন্ধন সার্টিফিকেট (ERC) এর জন্য আবেদন করুন।</p>
    </div>
  );
}
