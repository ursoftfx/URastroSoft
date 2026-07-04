import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props {
  targetId: string;
  fileName?: string;
  paperSize?: "a4" | "a5";
  orientation?: "p" | "l";
  /** Price in INR. If set, user must pay via UPI before download. */
  priceInRupees?: number;
  /** Label shown in the payment dialog (e.g. "Professional Report"). */
  productLabel?: string;
}

const UPI_ID = "udhayaraj24-1@oksbi";
const UPI_PAYEE = "UR Astro Soft";

const buildUpiUrl = (amount: number, note: string) =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    UPI_PAYEE
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

const qrUrl = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    data
  )}`;

export const DownloadReport = ({
  targetId,
  fileName = "jathagam.pdf",
  paperSize = "a4",
  orientation = "p",
  priceInRupees,
  productLabel = "Report",
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [utr, setUtr] = useState("");

  const paidKey = `paid:${productLabel}:${priceInRupees ?? 0}`;
  const isPaid = () =>
    !priceInRupees || sessionStorage.getItem(paidKey) === "1";

  const generatePdf = async () => {
    const node = document.getElementById(targetId);
    if (!node) {
      toast.error("அறிக்கை கிடைக்கவில்லை");
      return;
    }
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#FFF8EC",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation, unit: "mm", format: paperSize });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(fileName);
      toast.success("PDF பதிவிறக்கம் முடிந்தது");
    } catch (e) {
      console.error(e);
      toast.error("PDF உருவாக்க முடியவில்லை");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (isPaid()) {
      generatePdf();
    } else {
      setPayOpen(true);
    }
  };

  const confirmPayment = () => {
    if (utr.trim().length < 6) {
      toast.error("சரியான UPI பரிமாற்ற எண் (UTR) உள்ளிடவும்");
      return;
    }
    sessionStorage.setItem(paidKey, "1");
    sessionStorage.setItem(`${paidKey}:utr`, utr.trim());
    setPayOpen(false);
    toast.success("பணம் உறுதிசெய்யப்பட்டது — PDF உருவாக்கப்படுகிறது");
    generatePdf();
  };

  const upiLink = priceInRupees
    ? buildUpiUrl(priceInRupees, `${productLabel} - UR Astro Soft`)
    : "";

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading}
        className="bg-gradient-royal text-primary-foreground font-tamil"
      >
        <Download className="w-4 h-4 mr-2" />
        {loading
          ? "தயாராகிறது..."
          : priceInRupees && !isPaid()
          ? `PDF பதிவிறக்கம் — ₹${priceInRupees}`
          : "PDF பதிவிறக்கம்"}
      </Button>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md font-tamil">
          <DialogHeader>
            <DialogTitle>
              UPI மூலம் பணம் செலுத்தவும் — ₹{priceInRupees}
            </DialogTitle>
            <DialogDescription>
              {productLabel} PDF பதிவிறக்க கீழ்க்கண்ட UPI ID-க்கு ₹
              {priceInRupees} செலுத்தி, பரிமாற்ற எண்ணை (UTR / Reference No)
              கீழே உள்ளிடவும்.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2">
            <img
              src={qrUrl(upiLink)}
              alt="UPI QR code"
              className="w-44 h-44 border rounded bg-white p-2"
            />
            <div className="text-sm text-center">
              <div>
                <b>UPI ID:</b>{" "}
                <span className="font-mono select-all">{UPI_ID}</span>
              </div>
              <div>
                <b>தொகை:</b> ₹{priceInRupees}
              </div>
            </div>
            <a
              href={upiLink}
              className="text-sm underline text-primary"
            >
              UPI செயலியில் திற (GPay / PhonePe / Paytm)
            </a>
            <Input
              placeholder="UPI பரிமாற்ற எண் (UTR / Ref No)"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              ரத்து
            </Button>
            <Button
              onClick={confirmPayment}
              className="bg-gradient-royal text-primary-foreground"
            >
              பணம் செலுத்தியேன் — PDF பெறு
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
