import { Activity, CheckCircle2, Clock, FileWarning, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { MotionItem, MotionSection, PageMotion } from "../components/ui/Motion";

function formatVisitStatus(status) {
  const labels = {
    WAITING: "Menunggu",
    IN_CONSULTATION: "Dalam konsultasi",
    COMPLETED: "Selesai"
  };

  return labels[status] ?? status;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [summaryResponse, visitsResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/visits?date=today")
      ]);

      setSummary(summaryResponse.data.data);
      setVisits(visitsResponse.data.data);
    }

    void loadData();
  }, []);

  const cards = [
    {
      label: "Kunjungan",
      value: summary?.todayVisits ?? 0,
      icon: Users,
      iconClass: "border-primary-200 bg-primary-50 text-primary-700 ring-primary-100 dark:border-[#48d6c9] dark:bg-[#0d3435] dark:text-[#a7eee5] dark:ring-[#48d6c9]"
    },
    {
      label: "Menunggu",
      value: summary?.waiting ?? 0,
      icon: Clock,
      iconClass: "border-amber-200 bg-amber-50 text-amber-700 ring-amber-100 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/70"
    },
    {
      label: "Konsultasi",
      value: summary?.inConsultation ?? 0,
      icon: Activity,
      iconClass: "border-sky-200 bg-sky-50 text-sky-700 ring-sky-100 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-400/70"
    },
    {
      label: "Selesai",
      value: summary?.completed ?? 0,
      icon: CheckCircle2,
      iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-100 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/70"
    },
    {
      label: "Belum Bayar",
      value: summary?.unpaidInvoices ?? 0,
      icon: FileWarning,
      iconClass: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-100 dark:border-rose-400 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/70"
    }
  ];
  const displayedVisits = visits.slice(0, 5);
  const hiddenVisitsCount = Math.max(visits.length - displayedVisits.length, 0);

  return (
    <PageMotion>
      <Card>
        <CardContent className="space-y-5 sm:space-y-6">
          <MotionSection className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold text-slate-950 sm:text-2xl">Dashboard</h1>
              <p className="text-sm text-slate-500">Ringkasan rawat jalan hari ini</p>
            </div>
            <Button className="w-full sm:w-auto" onClick={() => navigate("/registration")}>Registrasi Baru</Button>
          </MotionSection>

          <div className="grid min-w-0 grid-cols-5 gap-2 sm:gap-3">
            {cards.map((item, index) => (
              <MotionItem
                key={item.label}
                index={index}
                className="h-full rounded-md border border-primary-100 bg-primary-50/50 shadow-sm shadow-primary-950/5 dark:border-[#4a7378] dark:bg-[#0b2324]"
              >
                <div className="flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center sm:min-h-24 sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-3 sm:text-left">
              <div className={`grid size-7 shrink-0 place-items-center rounded-md border ring-1 sm:size-9 ${item.iconClass}`}>
                <item.icon className="size-3 sm:size-[17px]" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="tabular-nums text-base font-semibold leading-none text-slate-950 sm:text-2xl">{item.value}</p>
                <p className="mt-0.5 w-full text-[9px] font-medium leading-3 text-slate-500 sm:mt-1 sm:text-xs sm:leading-4">{item.label}</p>
              </div>
                </div>
              </MotionItem>
            ))}
          </div>

          <section className="border-t border-slate-100 pt-5 dark:border-[#35585e] sm:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Antrean Hari Ini</h2>
            {hiddenVisitsCount > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                Menampilkan 5 dari {visits.length} antrean.
              </p>
            )}
          </div>
          {visits.length > 5 && (
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/queue")}>
              Lihat semua antrean
            </Button>
          )}
            </div>
            <div className="mt-4">
          {visits.length === 0 ? (
            <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
              Belum ada kunjungan hari ini.
            </div>
          ) : (
            <>
          <div className="hidden overflow-hidden rounded-md border border-primary-100 md:block">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-primary-50/80 text-xs uppercase text-primary-700">
                <tr>
                  <th className="w-[34%] px-4 py-3 font-semibold">Pasien</th>
                  <th className="w-[18%] px-4 py-3 font-semibold">Waktu</th>
                  <th className="w-[28%] px-4 py-3 font-semibold">Dokter</th>
                  <th className="w-[20%] px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedVisits.map((visit, index) => (
                  <MotionItem key={visit.id} as="tr" index={index} className={index % 2 === 0 ? "bg-white align-middle" : "bg-slate-50/60 align-middle"}>
                    <td className="border-t border-slate-100 px-4 py-4 align-middle font-medium text-slate-900"><p className="break-words">{visit.patient.name}</p></td>
                    <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600">{new Date(visit.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600"><p className="break-words">{visit.doctor.name}</p></td>
                    <td className="border-t border-slate-100 px-4 py-4 align-middle">
                      <div className="flex items-center">
                      <Badge tone={visit.status === "COMPLETED" ? "green" : visit.status === "WAITING" ? "amber" : "primary"}>
                        {formatVisitStatus(visit.status)}
                      </Badge>
                      </div>
                    </td>
                  </MotionItem>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {displayedVisits.map((visit, index) => (
              <MotionItem key={visit.id} index={index} className="min-w-0 rounded-md border border-primary-100 bg-white p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-slate-950">{visit.patient.name}</h3>
                    <p className="mt-1 break-words text-sm text-slate-500">{visit.doctor.name}</p>
                  </div>
                  <Badge className="shrink-0" tone={visit.status === "COMPLETED" ? "green" : visit.status === "WAITING" ? "amber" : "primary"}>
                    {formatVisitStatus(visit.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {new Date(visit.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </MotionItem>
            ))}
          </div>
            </>
          )}
            </div>
          </section>
        </CardContent>
      </Card>
    </PageMotion>
  );
}
