'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  applicationType: z.enum(["new", "renewal"]).optional(),
  orgNameBangla: z.string().optional(),
  orgNameEnglish: z.string().optional(),
  ownerName: z.string().optional(),
  fatherOrHusbandName: z.string().optional(),
  motherName: z.string().optional(),
  nid: z.string().optional(),
  tin: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  businessAddress: z.string().optional(),
  businessNature: z.string().optional(),
  businessCapital: z.string().optional(),
  contactNumber: z.string().optional(),
  signboard: z.string().optional(),
});

export default function ETradeLicenseForm() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            applicationType: "new",
            orgNameBangla: "",
            orgNameEnglish: "",
            ownerName: "",
            fatherOrHusbandName: "",
            motherName: "",
            nid: "",
            tin: "",
            presentAddress: "",
            permanentAddress: "",
            businessAddress: "",
            businessNature: "",
            businessCapital: "",
            contactNumber: "",
            signboard: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        toast({
            title: "আবেদন জমা দেওয়া হয়েছে",
            description: "আপনার ই-ট্রেড লাইসেন্স আবেদন সফলভাবে জমা দেওয়া হয়েছে।",
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>আবেদনপত্র</CardTitle>
                <CardDescription>অনুগ্রহ করে নিচের ফর্মটি পূরণ করুন।</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="applicationType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>আবেদনপত্রের ধরণ</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="new" />
                                                </FormControl>
                                                <FormLabel className="font-normal">নতুন</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="renewal" />
                                                </FormControl>
                                                <FormLabel className="font-normal">নবায়ন</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">প্রতিষ্ঠানের তথ্য</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="orgNameBangla"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>প্রতিষ্ঠানের নাম (বাংলা)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="প্রতিষ্ঠানের নাম বাংলায় লিখুন" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="orgNameEnglish"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>প্রতিষ্ঠানের নাম (ইংরেজি)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter organization name in English" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />
                        
                        <div className="space-y-4">
                             <h3 className="text-lg font-medium">মালিকের তথ্য</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ownerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>মালিকের নাম</FormLabel>
                                            <FormControl>
                                                <Input placeholder="মালিকের পুরো নাম" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="fatherOrHusbandName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>পিতা/স্বামীর নাম</FormLabel>
                                            <FormControl>
                                                <Input placeholder="পিতা বা স্বামীর নাম" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="motherName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>মাতার নাম</FormLabel>
                                            <FormControl>
                                                <Input placeholder="মাতার নাম" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>জাতীয় পরিচয়পত্র নম্বর</FormLabel>
                                            <FormControl>
                                                <Input placeholder="এনআইডি নম্বর" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>টিন নম্বর (যদি থাকে)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="টিন নম্বর" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>যোগাযোগের নম্বর</FormLabel>
                                            <FormControl>
                                                <Input placeholder="মোবাইল নম্বর" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                    control={form.control}
                                    name="presentAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>বর্তমান ঠিকানা</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="আপনার বর্তমান ঠিকানা লিখুন" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            <FormField
                                    control={form.control}
                                    name="permanentAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>স্থায়ী ঠিকানা</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="আপনার স্থায়ী ঠিকানা লিখুন" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                        </div>
                        
                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">ব্যবসার বিবরণ</h3>
                            <FormField
                                    control={form.control}
                                    name="businessAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ব্যবসার ঠিকানা</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="আপনার ব্যবসার ঠিকানা লিখুন" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="businessNature"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ব্যবসার ধরণ</FormLabel>
                                            <FormControl>
                                                <Input placeholder="যেমন: মুদি দোকান, আইটি ফার্ম" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="businessCapital"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ব্যবসায়িক মূলধন</FormLabel>
                                            <FormControl>
                                                <Input placeholder="মূলধনের পরিমাণ" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="signboard"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>সাইনবোর্ড</FormLabel>
                                            <FormControl>
                                                <Input placeholder="সাইনবোর্ডের বিবরণ দিন" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">সংযুক্ত করতে হবে</h3>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>(ক) মালিকের সত্যায়িত ছবি ০৩ (তিন) কপি।</li>
                                <li>(খ) অনাপত্তি সনদ (নতুন প্রতিষ্ঠানের ক্ষেত্রে)।</li>
                                <li>(গ) মূলধন প্রমাণের প্রয়োজনীয় কাগজপত্রাদি (লিমিটেড কোম্পানির ক্ষেত্রে মেমোরেন্ডাম অব আর্টিকেলস)।</li>
                                <li>(ঘ) মালিকানা প্রমাণের জন্য দলিল/পর্চা (ভাড়াটিয়া হলে ভাড়ার চুক্তিপত্র)।</li>
                                <li>(ঙ) হালনাগাদ হোল্ডিং ট্যাক্স পরিশোধের রশিদ (প্রযোজ্য ক্ষেত্রে)।</li>
                                <li>(চ) ফায়ার সার্ভিস ও সিভিল ডিফেন্স কর্তৃক লাইসেন্স এর ফটোকপি (শিল্প কারখানার ক্ষেত্রে)।</li>
                                <li>(ছ) জাতীয় পরিচয় পত্রের ফটোকপি।</li>
                            </ul>
                            <p className="font-semibold">আবেদনকারীর স্বাক্ষর ও নাম</p>
                            <p>তারিখ: .........................</p>
                            <p className="text-sm font-bold text-destructive">বিঃদ্রঃ- সংযুক্ত সকল কাগজ পত্র সত্যায়িত হইতে হইবে। (প্রথম শ্রেণীর গেজেটেড কর্মকর্তা / ওয়ার্ড কাউন্সিলর কর্তৃক)</p>
                        </div>


                        <Button type="submit">আবেদন জমা দিন</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
