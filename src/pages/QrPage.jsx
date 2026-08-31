import { Copy, ExternalLink, LogIn, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { MotionItem, PageMotion } from "../components/ui/Motion";

const patientFrontendUrl = import.meta.env.VITE_PATIENT_FRONTEND_URL ?? "http://localhost:5174";

function buildPatientUrl(path) {
  return new URL(path, patientFrontendUrl).toString();
}

export function QrPage() {
  const [copiedUrl, setCopiedUrl] = useState("");
  const qrItems = useMemo(
    () => [
      {
        title: "Login Pasien",
        description: "Pasien lama scan QR ini untuk masuk ke akun dan melihat layanan aktif.",
        path: "/login",
        icon: LogIn
      },
      {
        title: "Registrasi Pasien",
        description: "Pasien baru scan QR ini untuk membuat akun sebelum mengambil antrean.",
        path: "/register",
        icon: UserPlus
      }
    ].map((item) => ({ ...item, url: buildPatientUrl(item.path) })),
    []
  );

  async function copyUrl(url) {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    window.setTimeout(() => setCopiedUrl(""), 1600);
  }

  return (
    <PageMotion>
      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="page-title">QR Pasien</h1>
            <p className="text-sm text-slate-500">QR untuk membuka halaman login dan registrasi user-side.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {qrItems.map((item, index) => (
              <MotionItem key={item.path} index={index} className="min-w-0 rounded-md border border-primary-100 bg-white p-4 dark:border-[#35585e] dark:bg-[#101a1d]">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-50 text-primary-700 dark:bg-[#0d3435] dark:text-[#a7eee5]">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="section-title">{item.title}</h2>
                    <p className="mt-1 break-words text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>

                <div className="mt-5 grid min-w-0 justify-items-center border-y border-slate-100 py-5 dark:border-[#35585e]">
                  <div className="w-full max-w-[244px] rounded-md bg-white p-3">
                    <QRCodeSVG className="h-auto w-full" value={item.url} size={220} level="M" includeMargin />
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-[#35585e] dark:bg-[#0b2324] dark:text-slate-300">
                  <p className="break-all">{item.url}</p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button type="button" variant="outline" onClick={() => copyUrl(item.url)}>
                    <Copy className="size-4" />
                    {copiedUrl === item.url ? "Tersalin" : "Salin URL"}
                  </Button>
                  <Button type="button" onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}>
                    <ExternalLink className="size-4" />
                    Buka Halaman
                  </Button>
                </div>
              </MotionItem>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageMotion>
  );
}
