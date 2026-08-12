import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { MotionItem, PageMotion } from "../components/ui/Motion";

function formatInvoiceStatus(status) {
  const labels = {
    PAID: "Lunas",
    UNPAID: "Belum lunas"
  };

  return labels[status] ?? status;
}

export function InvoiceLookupPage() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    async function loadVisits() {
      const response = await api.get("/visits?date=today&status=COMPLETED");
      setVisits(response.data.data.filter((visit) => visit.invoice));
    }

    void loadVisits();
  }, []);

  return (
    <PageMotion>
    <Card>
      <CardHeader>
        <h1 className="text-lg font-semibold text-slate-950">Tagihan</h1>
        <p className="text-sm text-slate-500">Kunjungan selesai yang sudah memiliki tagihan.</p>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
            Belum ada tagihan yang tersedia.
          </div>
        ) : (
          <>
        <div className="hidden overflow-hidden rounded-md border border-primary-100 md:block">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-primary-50/80 text-xs uppercase text-primary-700">
              <tr>
                <th className="w-[26%] px-4 py-3 font-semibold">Kunjungan</th>
                <th className="w-[26%] px-4 py-3 font-semibold">Pasien</th>
                <th className="w-[24%] px-4 py-3 font-semibold">Dokter</th>
                <th className="w-[14%] px-4 py-3 font-semibold">Status</th>
                <th className="w-[10%] px-4 py-3 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
                <MotionItem key={visit.id} as="tr" index={index} className={index % 2 === 0 ? "bg-white align-middle" : "bg-slate-50/60 align-middle"}>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle font-medium text-slate-900"><p className="break-words">{visit.visitNumber}</p></td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600"><p className="break-words">{visit.patient.name}</p></td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600"><p className="break-words">{visit.doctor.name}</p></td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle">
                    <Badge tone={visit.invoice?.status === "PAID" ? "green" : "amber"}>
                      {formatInvoiceStatus(visit.invoice?.status ?? "UNPAID")}
                    </Badge>
                  </td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle">
                    <div className="flex items-center justify-start">
                      <Button variant="outline" onClick={() => navigate(`/invoice/${visit.id}`)}>
                        Buka
                      </Button>
                    </div>
                  </td>
                </MotionItem>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 md:hidden">
          {visits.map((visit, index) => (
            <MotionItem key={visit.id} index={index} className="min-w-0 rounded-md border border-primary-100 bg-white p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-semibold text-slate-950">{visit.patient.name}</h3>
                  <p className="mt-1 break-words text-xs text-slate-400">{visit.visitNumber}</p>
                </div>
                <Badge className="shrink-0" tone={visit.invoice?.status === "PAID" ? "green" : "amber"}>
                  {formatInvoiceStatus(visit.invoice?.status ?? "UNPAID")}
                </Badge>
              </div>
              <p className="mt-3 break-words text-sm text-slate-600"><span className="font-medium text-slate-900">Dokter:</span> {visit.doctor.name}</p>
              <Button className="mt-4 w-full" variant="outline" onClick={() => navigate(`/invoice/${visit.id}`)}>
                Buka
              </Button>
            </MotionItem>
          ))}
        </div>
          </>
        )}
      </CardContent>
    </Card>
    </PageMotion>
  );
}
