import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, FileText, Landmark, Ship, Plane, Receipt } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const services = [
  {
    title: 'ই-ট্রেড লাইসেন্স',
    description: 'আপনার ই-ট্রেড লাইসেন্সের জন্য আবেদন করুন বা নবায়ন করুন।',
    icon: <Briefcase className="size-8 text-primary" />,
    link: '/services/e-trade-license',
    bgImg:'/trade.png'
  },
  {
    title: 'টিন সার্টিফিকেট',
    description: 'আপনার করদাতা শনাক্তকরণ নম্বর (TIN) সার্টিফিকেট পান।',
    icon: <FileText className="size-8 text-primary" />,
    link: '/services/tin-certificate',
    bgImg:'/tin.png'
  },
  {
    title: 'বিআইএন সার্টিফিকেট',
    description: 'আপনার ব্যবসা শনাক্তকরণ নম্বর (BIN) সার্টিফিকেট পান।',
    icon: <FileText className="size-8 text-primary" />,
    link: '/services/bin-certificate',
    bgImg:'/BIN.png'
  },
  {
    title: 'আইআরসি',
    description: 'আমদানি নিবন্ধন সার্টিফিকেট (IRC) এর জন্য আবেদন করুন।',
    icon: <Ship className="size-8 text-primary" />,
    link: '/services/irc',
    bgImg:'/irc-erc.png'
  },
  {
    title: 'ইআরসি',
    description: 'রপ্তানি নিবন্ধন সার্টিফিকেট (ERC) এর জন্য আবেদন করুন।',
    icon: <Plane className="size-8 text-primary" />,
    link: '/services/erc',
    bgImg:'/irc-erc.png'
  },
  {
    title: 'অনলাইন ট্যাক্স রিটার্ন',
    description: 'অনলাইনে আপনার আয়কর রিটার্ন দাখিল করুন।',
    icon: <Landmark className="size-8 text-primary" />,
    link: '/services/online-tax-return',
    bgImg:'/tax acknowledge.png'
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">GovDesk BD তে আপনাকে স্বাগতম !</h2>
        <p className="text-muted-foreground">শুরু করতে নীচের একটি পরিষেবা নির্বাচন করুন।</p>
        <Image
                src="/govdesk banner.png"
                width={1000}
                height={400}
                alt="Picture of the author"
              />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link href={service.link}>
          <Card key={service.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                {service.icon}
                <CardTitle>{service.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
            <Image
                style={{width:"100%",height:"100%"}}
                src={service.bgImg}
                width={200}
                height={300}
                alt="Picture of the author"
              />

            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
              <Link href={service.link}>
                  পরিষেবাতে যান <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
