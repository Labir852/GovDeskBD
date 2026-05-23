'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Facebook,
  FileText,
  Landmark,
  Mail,
  Phone,
  Plane,
  ReceiptText,
  Ship,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const services = [
  {
    title: 'ই-ট্রেড লাইসেন্স',
    whatsappLabel: 'E Trade License',
    description: 'আবেদন, সংশোধন ও নবায়ন সহ সম্পূর্ণ সহায়তা।',
    icon: Briefcase,
    image: '/trade.png',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    requirements: [
      'NID কপি',
      'আবেদনকারীর মোবাইল নম্বর',
      'ব্যবসার নাম ও ঠিকানা',
      'ব্যবসার ধরন / কার্যক্রম',
      'হোল্ডিং ট্যাক্স বা ভাড়ার চুক্তি, যদি থাকে',
    ],
  },
  {
    title: 'টিন সার্টিফিকেট',
    whatsappLabel: 'TIN Certificate',
    description: 'ব্যক্তি বা প্রতিষ্ঠানের TIN প্রস্তুত ও যাচাই।',
    icon: FileText,
    image: '/tin.png',
    accent: 'bg-sky-50 text-sky-700 border-sky-200',
    requirements: ['NID কপি', 'মোবাইল নম্বর', 'ইমেইল ঠিকানা (যদি থাকে)', 'সংস্থার ব্যবসার বিবরণ'],
  },
  {
    title: 'বিআইএন সার্টিফিকেট',
    whatsappLabel: 'BIN Certificate',
    description: 'VAT/BIN নিবন্ধন ও প্রয়োজনীয় ডকুমেন্ট সহায়তা।',
    icon: ReceiptText,
    image: '/BIN.png',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
    requirements: [
      'ট্রেড লাইসেন্স',
      'TIN সার্টিফিকেট',
      'NID কপি',
      'ব্যবসার ঠিকানার প্রমাণ',
      'ব্যাংক অ্যাকাউন্টের তথ্য (যদি থাকে)',
    ],
  },
  {
    title: 'আইআরসি',
    whatsappLabel: 'IRC',
    description: 'আমদানি নিবন্ধন সনদের আবেদন ও নবায়ন।',
    icon: Ship,
    image: '/irc-erc.png',
    accent: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    requirements: [
      'ট্রেড লাইসেন্স',
      'TIN সার্টিফিকেট',
      'BIN সার্টিফিকেট (যদি থাকে)',
      'ব্যাংক সলভেন্সি সার্টিফিকেট',
      'সংস্থার মালিক/পরিচালকের NID',
    ],
  },
  {
    title: 'ইআরসি',
    whatsappLabel: 'ERC',
    description: 'রপ্তানি নিবন্ধন সনদের আবেদন ও নবায়ন।',
    icon: Plane,
    image: '/irc-erc.png',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    requirements: [
      'ট্রেড লাইসেন্স',
      'TIN সার্টিফিকেট',
      'BIN সার্টিফিকেট (যদি থাকে)',
      'ব্যাংক সলভেন্সি সার্টিফিকেট',
      'সংস্থার মালিক/পরিচালকের NID',
    ],
  },
  {
    title: 'অনলাইন ট্যাক্স রিটার্ন',
    whatsappLabel: 'Online Tax Return',
    description: 'ই-রিটার্ন, অ্যাকনলেজমেন্ট ও কর পরামর্শ।',
    icon: Landmark,
    image: '/tax acknowledge.png',
    accent: 'bg-rose-50 text-rose-700 border-rose-200',
    requirements: [
      'E-TIN নম্বর',
      'E-রিটার্ন পাসওয়ার্ড (যদি ইতিমধ্যে রেজিস্টার করা থাকে)',
      'NID কপি',
      'আয় ও বেতনের বিবরণ',
      'ব্যাংক স্টেটমেন্ট / বিনিয়োগের বিবরণ (যদি প্রযোজ্য)',
    ],
  },
];

const steps = ['ডকুমেন্ট যাচাই', 'অনলাইন আবেদন', 'স্ট্যাটাস ফলোআপ', 'ডেলিভারি'];
const phoneNumber = '01911724386';
const whatsappNumber = '8801911724386';

const getWhatsappLink = (service: (typeof services)[number]) => {
  const message = `Website - ${service.whatsappLabel}. I want to take this service from GovDesk BD. Please tell me the required documents and service charge.`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export default function Home() {
  return (
    <div className="-m-6 bg-white text-slate-950">
      <section className="relative isolate overflow-hidden">
        <Image
          src="/govdesk banner.png"
          alt="GovDesk BD service desk"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100svh-12rem)] max-w-7xl content-center gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1fr_360px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-3xl text-white"
          >
            <Badge className="mb-5 border-white/30 bg-white/15 text-white backdrop-blur">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Government service support in Bangladesh
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-normal md:text-6xl">
              GovDesk BD
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              ট্রেড লাইসেন্স, TIN, BIN, IRC, ERC, VAT ও অনলাইন ট্যাক্স রিটার্ন সেবাকে দ্রুত, পরিষ্কার এবং নির্ভরযোগ্যভাবে সম্পন্ন করুন।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-white text-slate-950 hover:bg-white/90">
                <Link href="#services">
                  শুরু করুন <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-2 h-4 w-4" /> {phoneNumber}
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55, ease: 'easeOut' }}
            className="self-end rounded-lg border border-white/20 bg-white/12 p-4 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-md bg-white/10 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-sm font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl scroll-mt-8 px-6 pb-12 pt-8 md:px-10">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Services</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal">এক জায়গায় আপনার প্রয়োজনীয় সেবা</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            প্রতিটি সেবার জন্য প্রয়োজনীয় তথ্য, ডকুমেন্ট ও স্ট্যাটাস আমরা গুছিয়ে রাখি।
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group grid h-full w-full grid-cols-[96px_1fr] gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    <div className="relative h-24 overflow-hidden rounded-md bg-slate-50">
                      <Image src={service.image} alt={service.title} fill className="object-contain p-2" sizes="96px" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border p-2 ${service.accent}`}>
                          <service.icon className="h-4 w-4" />
                        </span>
                        <h3 className="truncate text-lg font-semibold">{service.title}</h3>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{service.description}</p>
                      <span className="mt-3 inline-flex items-center text-sm font-medium text-slate-900">
                        প্রয়োজনীয় তথ্য <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
                  <DialogHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`rounded-md border p-2 ${service.accent}`}>
                        <service.icon className="h-5 w-5" />
                      </span>
                      <DialogTitle className="text-2xl">{service.title}</DialogTitle>
                    </div>
                    <DialogDescription>{service.description}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">প্রয়োজনীয় তথ্য</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {service.requirements.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="font-semibold text-slate-950">সরাসরি যোগাযোগ</p>
                      <p className="mt-1 text-sm text-slate-600">
                        হোয়াটসঅ্যাপ বার্তায় থাকবে: Website - {service.whatsappLabel}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">ফোন / হোয়াটসঅ্যাপ: {phoneNumber}</p>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`tel:+88${phoneNumber}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call
                      </Link>
                    </Button>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                      <Link href={getWhatsappLink(service)} target="_blank" rel="noopener noreferrer">
                        Contact on WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 md:grid-cols-3 md:px-10">
          <Link href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border bg-white p-4 transition hover:border-emerald-300">
            <Phone className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold">ফোন / হোয়াটসঅ্যাপ</p>
              <p className="text-sm text-slate-600">{phoneNumber}</p>
            </div>
          </Link>
          <Link href="mailto:govdeskbd@gmail.com" className="flex items-center gap-3 rounded-lg border bg-white p-4 transition hover:border-sky-300">
            <Mail className="h-5 w-5 text-sky-700" />
            <div>
              <p className="text-sm font-semibold">ইমেইল</p>
              <p className="break-all text-sm text-slate-600">govdeskbd@gmail.com</p>
            </div>
          </Link>
          <Link
            href="https://www.facebook.com/govdeskbd/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 transition hover:border-indigo-300"
          >
            <Facebook className="h-5 w-5 text-indigo-700" />
            <div>
              <p className="text-sm font-semibold">ফেসবুক</p>
              <p className="text-sm text-slate-600">GovDesk BD পেজ</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
        <div>
          <h2 className="text-2xl font-bold tracking-normal">নিয়মিত VAT, tax return ও renewal কাজ আরও পরিষ্কারভাবে চালান</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            মাসিক ও বার্ষিক কাজের জন্য পেমেন্ট, সাবমিশন স্ট্যাটাস, প্রিন্টিং ও অতিরিক্ত তথ্য আলাদা করে সংরক্ষণের ব্যবস্থা করা যায়।
          </p>
        </div>
        <Button asChild>
          <Link href="/login">
            Admin login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
