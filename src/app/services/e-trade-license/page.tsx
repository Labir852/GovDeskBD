import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ETradeLicenseForm from '@/components/services/ETradeLicenseForm';

export default function ETradeLicensePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
         <Button asChild variant="outline" className="mb-4">
            <Link href="/">
                <ArrowLeft className="ml-2 size-4" />
                হোমে ফিরে যান
            </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">ই-ট্রেড লাইসেন্স আবেদন</h1>
        <p className="text-muted-foreground">আপনার ই-ট্রেড লাইসেন্সের জন্য আবেদন বা নবায়ন করুন।</p>
      </div>
      <ETradeLicenseForm />
    </div>
  );
}
