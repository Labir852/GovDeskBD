import MultiDocUploadForm from "@/components/services/MultiDocUploadForm";

const requiredDocs = [
    { id: 'tin', label: 'টিন সার্টিফিকেট' },
    { id: 'bankStatement', label: 'ব্যাংক স্টেটমেন্ট' },
    { id: 'nid', label: 'জাতীয় পরিচয়পত্র' },
    { id: 'eTradeLicense', label: 'ই-ট্রেড লাইসেন্স' },
    { id: 'rentAgreement', label: 'দোকান ভাড়ার চুক্তিপত্র / দলিলের কপি' },
    { id: 'ircErc', label: 'আইআরসি/ইআরসি (আমদানি/রপ্তানি ব্যবসার ক্ষেত্রে)', optional: true },
];

export default function BinCertificatePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">বিআইএন সার্টিফিকেট পরিষেবা</h1>
        <p className="text-muted-foreground">আপনার ব্যবসা শনাক্তকরণ নম্বর (BIN) সার্টিফিকেট পেতে প্রয়োজনীয় কাগজপত্র আপলোড করুন।</p>
      </div>
      <MultiDocUploadForm documents={requiredDocs} />
    </div>
  );
}
