import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, FileText, Landmark, Ship, Plane, Receipt, Phone, Mail, Facebook } from 'lucide-react';
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
         <div className="mt-4 overflow-hidden rounded-lg">
           <Image
                src="/govdesk banner.png"
                width={1200}
                height={400}
                alt="GovDesk BD Banner"
                className="w-full h-auto object-cover"
              />
         </div>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>যোগাযোগ করুন</CardTitle>
          <CardDescription>যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <Phone className="size-6 text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">ফোন / হোয়াটসঅ্যাপ</span>
              <a href="tel:+8801911724386" className="text-muted-foreground break-all hover:underline">
                01911724386
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="size-6 text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">ইমেইল</span>
              <a href="mailto:govdeskbd@gmail.com" className="text-muted-foreground break-all hover:underline">
                govdeskbd@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Facebook className="size-6 text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">ফেসবুক</span>
              <a href="https://www.facebook.com/govdeskbd/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                আমাদের ফেসবুক পেজ
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link href={service.link} key={service.title} className="flex">
          <Card className="flex flex-col w-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                {service.icon}
                <CardTitle>{service.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
            <Image
                src={service.bgImg}
                width={250}
                height={250}
                alt={service.title}
                className="object-contain"
              />

            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
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
