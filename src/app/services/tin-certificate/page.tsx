import NidUploadForm from "@/components/services/NidUploadForm";

export default function TinCertificatePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">টিন সার্টিফিকেট পরিষেবা</h1>
        <p className="text-muted-foreground">আপনার করদাতা শনাক্তকরণ নম্বর (TIN) সার্টিফিকেট পান।</p>
      </div>
      <NidUploadForm />
    </div>
  );
}
