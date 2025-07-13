import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, Landmark, Newspaper, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    title: 'Birth Certificate',
    description: 'Apply for a new birth certificate or request a correction.',
    icon: <FileText className="size-8 text-primary" />,
    link: '/services/birth-certificate',
  },
  {
    title: 'Passport Services',
    description: 'Renew your passport or apply for a new one online.',
    icon: <Newspaper className="size-8 text-primary" />,
    link: '/services/passport',
  },
  {
    title: 'National ID',
    description: 'Access your NID information and download a digital copy.',
    icon: <ShieldCheck className="size-8 text-primary" />,
    link: '/services/national-id',
  },
  {
    title: 'Tax Payment',
    description: 'Pay your income tax and view your payment history.',
    icon: <Landmark className="size-8 text-primary" />,
    link: '/services/tax-payment',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to your Dashboard</h2>
        <p className="text-muted-foreground">Select a service below to get started.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                {service.icon}
                <CardTitle>{service.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{service.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={service.link}>
                  Go to Service <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
