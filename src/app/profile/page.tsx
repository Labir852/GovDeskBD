import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="animate-fade-in-up">
      <Card className="transition-all duration-300 hover:shadow-xl border-slate-200/80 bg-white/90 rounded-[1.5rem]">
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View and update your account details, password, and preferences.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/settings">Open settings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
