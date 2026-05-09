import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  targetId: string;
  fileName?: string;
  paperSize?: "a4" | "a5";
  orientation?: "p" | "l";
}

export const DownloadReport = ({ targetId, fileName = "jathagam.pdf", paperSize = "a4", orientation = "p" }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
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
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: paperSize });
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

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="bg-gradient-royal text-primary-foreground font-tamil"
    >
      <Download className="w-4 h-4 mr-2" />
      {loading ? "தயாராகிறது..." : "PDF பதிவிறக்கம்"}
    </Button>
  );
};
