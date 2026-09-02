import { Activity, CheckCircle2, Clock, FileWarning, Plus, UserCheck, UserX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { MotionItem, MotionSection, PageMotion } from "../components/ui/Motion";
import { formatQueueCode } from "../lib/queue";
import { useAuthStore } from "../stores/authStore";

function formatVisitStatus(status) {
  const labels = {
    WAITING: "Menunggu",
    IN_CONSULTATION: "Dalam konsultasi",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan"
  };

  return labels[status] ?? status;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState(null);
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorTab, setDoctorTab] = useState("ACTIVE");
  const [updatingDoctorId, setUpdatingDoctorId] = useState(null);
  const [doctorError, setDoctorError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [summaryResponse, visitsResponse, doctorsResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/visits?date=today"),
        api.get("/doctors")
      ]);

      setSummary(summaryResponse.data.data);
      setVisits(visitsResponse.data.data);
      setDoctors(doctorsResponse.data.data);
    }

    void loadData();
  }, []);

  const cards = [
    {
      label: "Kunjungan",
      value: summary?.todayVisits ?? 0,
      icon: Users,
      iconClass: "text-teal-600 dark:text-teal-300",
      isPrimary: true
    },
    {
      label: "Menunggu",
      value: summary?.waiting ?? 0,
      icon: Clock,
      iconClass: "text-amber-600 dark:text-amber-300"
    },
    {
      label: "Konsultasi",
      value: summary?.inConsultation ?? 0,
      icon: Activity,
      iconClass: "text-sky-600 dark:text-sky-300"
    },
    {
      label: "Selesai",
      value: summary?.completed ?? 0,
      icon: CheckCircle2,
      iconClass: "text-emerald-600 dark:text-emerald-300"
    },
    {
      label: "Belum Bayar",
      value: summary?.unpaidInvoices ?? 0,
      icon: FileWarning,
      iconClass: "text-rose-600 dark:text-rose-300"
    }
  ];
  const displayedVisits = visits.slice(0, 5);
  const hiddenVisitsCount = Math.max(visits.length - displayedVisits.length, 0);
  const activeDoctors = doctors.filter((doctor) => doctor.isActive !== false);
  const inactiveDoctors = doctors.filter((doctor) => doctor.isActive === false);
  const displayedDoctors = doctorTab === "ACTIVE" ? activeDoctors : inactiveDoctors;
  const canManageDoctors = user?.role === "ADMIN";

  async function toggleDoctorStatus(doctor, nextIsActive) {
    setUpdatingDoctorId(doctor.id);
    setDoctorError("");

    try {
      const response = await api.patch(`/doctors/${doctor.id}`, { isActive: nextIsActive });
      setDoctors((currentDoctors) =>
        currentDoctors.map((item) => (item.id === doctor.id ? response.data.data : item))
      );
    } catch {
      setDoctorError("Status dokter gagal diperbarui.");
    } finally {
      setUpdatingDoctorId(null);
    }
  }

  return (
    <PageMotion>
      <div className="min-w-0 space-y-7 bg-white px-4 py-5 dark:bg-[#101a1d] sm:px-5 sm:py-6 lg:px-6 lg:py-7">
          <MotionSection className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-8 text-slate-950 dark:text-slate-100 sm:text-2xl">Dashboard</h1>
              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">Ringkasan operasional rawat jalan hari ini</p>
            </div>
            <Button className="w-full sm:w-auto" onClick={() => navigate("/registration")}><Plus className="size-4" />Registrasi Baru</Button>
          </MotionSection>

          <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-5">
            {cards.map((item, index) => (
              <MotionItem
                key={item.label}
                index={index}
                className={`h-full rounded-md border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-[#35585e] dark:bg-[#0b2324] ${item.isPrimary ? "col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="flex min-h-20 min-w-0 items-center px-3 py-3 min-[360px]:px-4">
                  <div className="min-w-0 w-full">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <p className="tabular-nums text-2xl font-semibold leading-none text-slate-950 dark:text-slate-100">{item.value}</p>
                      <item.icon className={`size-5 shrink-0 ${item.iconClass}`} strokeWidth={2} />
                    </div>
                    <p className="mt-1.5 text-xs font-medium leading-4 text-slate-500 dark:text-slate-400">{item.label}</p>
                  </div>
                </div>
              </MotionItem>
            ))}
          </div>

          <section className="border-t border-slate-200 pt-6 dark:border-[#35585e] sm:pt-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold leading-7 text-slate-950 dark:text-slate-100">Antrean Hari Ini</h2>
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
          <div className="hidden overflow-x-auto rounded-md border border-primary-100 md:block">
            <table className="data-table min-w-[640px]">
              <thead className="bg-primary-50/80 text-xs text-primary-700">
                <tr>
                  <th className="w-[12%] px-4 py-3 font-medium">No.</th>
                  <th className="w-[30%] px-4 py-3 font-medium">Pasien</th>
                  <th className="w-[16%] px-4 py-3 font-medium">Waktu</th>
                  <th className="w-[25%] px-4 py-3 font-medium">Dokter</th>
                  <th className="w-[17%] px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedVisits.map((visit, index) => (
                  <MotionItem key={visit.id} as="tr" index={index} className={index % 2 === 0 ? "bg-white align-middle" : "bg-slate-50/60 align-middle"}>
                    <td className="whitespace-nowrap border-t border-slate-100 px-4 py-3 align-middle font-medium tabular-nums text-primary-700">{formatQueueCode(visit.queueNumber)}</td>
                    <td className="border-t border-slate-100 px-4 py-3 align-middle font-medium text-slate-900"><p className="break-words">{visit.patient.name}</p></td>
                    <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">{new Date(visit.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600"><p className="break-words">{visit.doctor.name}</p></td>
                    <td className="border-t border-slate-100 px-4 py-3 align-middle">
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
                <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <div className="grid h-10 min-w-16 shrink-0 place-items-center whitespace-nowrap rounded-md bg-primary-50 px-2 text-sm font-medium tabular-nums text-primary-700">
                      {formatQueueCode(visit.queueNumber)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-medium text-slate-950">{visit.patient.name}</h3>
                      <p className="mt-1 break-words text-sm text-slate-500">{visit.doctor.name}</p>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <p className="text-xs tabular-nums text-slate-500">
                    {new Date(visit.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <Badge tone={visit.status === "COMPLETED" ? "green" : visit.status === "WAITING" ? "amber" : "primary"}>
                    {formatVisitStatus(visit.status)}
                  </Badge>
                </div>
              </MotionItem>
            ))}
          </div>
            </>
          )}
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6 dark:border-[#35585e] sm:pt-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold leading-7 text-slate-950 dark:text-slate-100">Status Dokter</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeDoctors.length} aktif, {inactiveDoctors.length} nonaktif
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-primary-100 bg-primary-50/60 p-1 dark:border-[#35585e] dark:bg-[#0b2324]">
                <Button
                  type="button"
                  variant={doctorTab === "ACTIVE" ? "primary" : "ghost"}
                  className="h-9 px-3"
                  aria-pressed={doctorTab === "ACTIVE"}
                  onClick={() => setDoctorTab("ACTIVE")}
                >
                  <UserCheck className="size-4" />
                  Aktif
                </Button>
                <Button
                  type="button"
                  variant={doctorTab === "INACTIVE" ? "primary" : "ghost"}
                  className="h-9 px-3"
                  aria-pressed={doctorTab === "INACTIVE"}
                  onClick={() => setDoctorTab("INACTIVE")}
                >
                  <UserX className="size-4" />
                  Nonaktif
                </Button>
              </div>
            </div>
            {doctorError && (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {doctorError}
              </div>
            )}
            {!canManageDoctors && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Hanya admin yang dapat mengubah status dokter.
              </div>
            )}
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {displayedDoctors.map((doctor, index) => (
                <MotionItem key={doctor.id} index={index} className="min-w-0 rounded-md border border-primary-100 bg-white p-4 dark:border-[#35585e] dark:bg-[#101a1d]">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-slate-950">{doctor.name}</p>
                      <p className="mt-1 break-words text-sm text-slate-500">{doctor.specialization}</p>
                      <p className="mt-1 break-words text-xs text-slate-400">{doctor.phone}</p>
                    </div>
                    <Badge tone={doctor.isActive === false ? "slate" : "green"}>
                      {doctor.isActive === false ? "Nonaktif" : "Aktif"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant={doctor.isActive === false ? "success" : "danger"}
                    className="mt-4 w-full"
                    disabled={!canManageDoctors || updatingDoctorId === doctor.id}
                    onClick={() => toggleDoctorStatus(doctor, doctor.isActive === false)}
                  >
                    {doctor.isActive === false ? "Aktifkan Dokter" : "Nonaktifkan Dokter"}
                  </Button>
                </MotionItem>
              ))}
            </div>
            {displayedDoctors.length === 0 && (
              <div className="mt-4 rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
                {doctorTab === "ACTIVE" ? "Belum ada dokter aktif." : "Belum ada dokter nonaktif."}
              </div>
            )}
          </section>
      </div>
    </PageMotion>
  );
}
