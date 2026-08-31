import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { MotionItem, MotionSection, PageMotion } from "../components/ui/Motion";

function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatInvoiceStatus(status) {
  const labels = {
    PAID: "Lunas",
    UNPAID: "Belum lunas",
  };

  return labels[status] ?? status;
}

export function InvoicePage() {
  const { visitId } = useParams();
  const [invoice, setInvoice] = useState(null);

  async function loadInvoice() {
    if (!visitId) return;
    const response = await api.get(`/invoices/${visitId}`);
    setInvoice(response.data.data);
  }

  useEffect(() => {
    void loadInvoice();
  }, [visitId]);

  async function markAsPaid() {
    if (!invoice) return;
    const response = await api.patch(`/invoices/${invoice.id}/pay`);
    setInvoice(response.data.data);
  }

  function downloadInvoicePdf() {
    if (!invoice) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const primaryColor = [36, 157, 143];
    const logoSize = 42;
    let y = 42;

    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, y, logoSize, logoSize, 8, 8, "F");
    doc.setDrawColor(176, 232, 225);
    doc.setLineWidth(1);
    doc.roundedRect(margin + 4, y + 4, logoSize - 8, logoSize - 8, 6, 6, "S");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("CA", margin + logoSize / 2, y + 27, { align: "center" });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ClinicApp", margin + logoSize + 14, y + 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Tagihan Manajemen Klinik", margin + logoSize + 14, y + 32);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("INVOICE", pageWidth - margin, y + 18, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.invoiceNo, pageWidth - margin, y + 34, { align: "right" });

    y += 78;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);

    y += 28;
    const leftX = margin;
    const rightX = pageWidth / 2 + 16;
    const rowGap = 16;

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Detail Pasien", leftX, y);
    doc.text("Detail Kunjungan", rightX, y);

    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Pasien: ${invoice.visit.patient.name}`, leftX, y);
    doc.text(`Tanggal Tagihan: ${formatDate(invoice.createdAt)}`, rightX, y);
    y += rowGap;
    doc.text(`Kunjungan: ${invoice.visit.visitNumber}`, leftX, y);
    doc.text(`Dokter: ${invoice.visit.doctor.name}`, rightX, y);
    y += rowGap;
    doc.text(`Status: ${formatInvoiceStatus(invoice.status)}`, leftX, y);
    doc.text(`Dibayar Pada: ${formatDate(invoice.paidAt)}`, rightX, y);

    y += 34;
    doc.setFillColor(236, 254, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(8, 145, 178);
    doc.text("Item", margin + 14, y + 20);
    doc.text("Jml", pageWidth - 210, y + 20);
    doc.text("Harga", pageWidth - 160, y + 20);
    doc.text("Jumlah", pageWidth - margin - 14, y + 20, { align: "right" });

    y += 46;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    invoice.items.forEach((item, index) => {
      const itemNameLines = doc.splitTextToSize(item.item, pageWidth - 300);
      const rowHeight = Math.max(40, itemNameLines.length * 12 + 24);

      if (y + rowHeight > 760) {
        doc.addPage();
        y = 48;
      }

      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 10, pageWidth - margin * 2, rowHeight, "F");
      }

      const rowMiddleY = y + rowHeight / 2 - 3;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(itemNameLines, margin + 14, y + 8);
      doc.text(String(item.quantity), pageWidth - 210, rowMiddleY);
      doc.text(formatRupiah(item.price), pageWidth - 160, rowMiddleY);
      doc.setFont("helvetica", "bold");
      doc.text(formatRupiah(item.amount), pageWidth - margin - 14, rowMiddleY, {
        align: "right",
      });

      y += rowHeight;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y - 10, pageWidth - margin, y - 10);
    });

    y += 14;
    doc.setFillColor(8, 145, 178);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 48, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Total Pembayaran", margin + 16, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(formatRupiah(invoice.total), pageWidth - margin - 16, y + 31, {
      align: "right",
    });

    y += 86;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Terima kasih atas pembayaran Anda.", margin, y);

    doc.save(`invoice-${invoice.invoiceNo}.pdf`);
  }

  if (!invoice) {
    return (
      <PageMotion>
      <Card>
        <CardContent>Tagihan belum ditemukan.</CardContent>
      </Card>
      </PageMotion>
    );
  }

  return (
    <PageMotion className="grid items-start gap-5 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:gap-6">
      <Card>
        <CardHeader>
          <h1 className="page-title">Tagihan</h1>
          <p className="break-words text-sm text-slate-500">
            {invoice.invoiceNo}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="break-words">
            <span className="font-medium text-slate-900">Kunjungan:</span>{" "}
            {invoice.visit.visitNumber}
          </p>
          <p className="break-words">
            <span className="font-medium text-slate-900">Pasien:</span>{" "}
            {invoice.visit.patient.name}
          </p>
          <p className="break-words">
            <span className="font-medium text-slate-900">Dokter:</span>{" "}
            {invoice.visit.doctor.name}
          </p>
          <Badge tone={invoice.status === "PAID" ? "green" : "amber"}>
            {formatInvoiceStatus(invoice.status)}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-slate-950">Detail Pembayaran</h2>
            <p className="text-sm text-slate-500">
              {invoice.items.length} item tagihan
            </p>
          </div>
          <Badge tone={invoice.status === "PAID" ? "green" : "amber"}>
            {formatInvoiceStatus(invoice.status)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="hidden overflow-hidden rounded-md border border-primary-100 lg:block">
            <table className="data-table">
              <thead className="bg-primary-50/80 text-xs text-primary-700">
                <tr>
                  <th className="w-[42%] px-4 py-3 font-medium">Item</th>
                  <th className="w-[14%] px-4 py-3 text-center font-medium">
                    Jml
                  </th>
                  <th className="w-[22%] px-4 py-3 font-medium">Harga</th>
                  <th className="w-[22%] px-4 py-3 text-right font-medium">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <MotionItem
                    key={item.id}
                    as="tr"
                    index={index}
                    className={
                      index % 2 === 0
                        ? "bg-white align-middle"
                        : "bg-slate-50/60 align-middle"
                    }
                  >
                    <td className="border-t border-slate-100 px-4 py-3 align-middle font-medium text-slate-900">
                      <p className="break-words leading-6">{item.item}</p>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-center align-middle text-slate-600">
                      <span className="inline-flex min-w-8 justify-center rounded bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-right align-middle font-semibold text-slate-950">
                      {formatRupiah(item.amount)}
                    </td>
                  </MotionItem>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {invoice.items.map((item, index) => (
              <MotionItem
                key={item.id}
                index={index}
                className="rounded-md border border-primary-100 bg-white p-4 shadow-sm shadow-primary-950/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-sm font-medium text-slate-950">
                    {item.item}
                  </h3>
                  <span className="shrink-0 rounded bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
                    x{item.quantity}
                  </span>
                </div>
                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm min-[380px]:grid-cols-2">
                  <div className="min-w-0">
                    <p className="text-xs uppercase text-slate-400">Harga</p>
                    <p className="mt-1 break-words font-medium text-slate-700">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="min-w-0 min-[380px]:text-right">
                    <p className="text-xs uppercase text-slate-400">Jumlah</p>
                    <p className="mt-1 break-words font-semibold text-slate-950">
                      {formatRupiah(item.amount)}
                    </p>
                  </div>
                </div>
              </MotionItem>
            ))}
          </div>

          <MotionSection className="rounded-md border border-primary-100 bg-primary-50/70 p-4">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Total Pembayaran
                </p>
                <p className="break-words text-xs text-slate-400">
                  {invoice.invoiceNo}
                </p>
              </div>
              <p className="break-words text-lg font-semibold leading-7 tabular-nums text-primary-700">
                {formatRupiah(invoice.total)}
              </p>
            </div>
          </MotionSection>
          <Button
            className="w-full"
            disabled={invoice.status === "PAID"}
            onClick={markAsPaid}
          >
            {invoice.status === "PAID" ? "Lunas" : "Tandai Lunas"}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={downloadInvoicePdf}
          >
            Unduh PDF
          </Button>
        </CardContent>
      </Card>
    </PageMotion>
  );
}
