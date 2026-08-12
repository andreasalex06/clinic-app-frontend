import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { MotionItem, PageMotion } from "../components/ui/Motion";
import { useAuthStore } from "../stores/authStore";

const QUEUE_PAGE_SIZE = 10;

function formatVisitStatus(status) {
  const labels = {
    WAITING: "Menunggu",
    IN_CONSULTATION: "Dalam konsultasi",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan"
  };

  return labels[status] ?? status;
}

function getVisitStatusTone(status) {
  if (status === "COMPLETED") return "green";
  if (status === "WAITING") return "amber";
  if (status === "CANCELLED") return "rose";
  return "primary";
}

function getPaginationItems(currentPage, totalPages) {
  const pages = [];

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    if (
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - currentPage) <= 1
    ) {
      pages.push(pageNumber);
    }
  }

  return pages.reduce((items, pageNumber) => {
    const previous = items[items.length - 1];

    if (typeof previous === "number" && pageNumber - previous > 1) {
      items.push(`ellipsis-${previous}-${pageNumber}`);
    }

    items.push(pageNumber);
    return items;
  }, []);
}

export function QueuePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [visits, setVisits] = useState([]);
  const [visitMeta, setVisitMeta] = useState({
    page: 1,
    limit: QUEUE_PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canCancelVisit = user?.role === "ADMIN" || user?.role === "STAFF";

  async function loadVisits(nextPage = page) {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/visits", {
        params: {
          date: "today",
          page: nextPage,
          limit: QUEUE_PAGE_SIZE
        }
      });
      setVisits(response.data.data);
      setVisitMeta(response.data.meta ?? {
        page: nextPage,
        limit: QUEUE_PAGE_SIZE,
        total: response.data.data.length,
        totalPages: 1
      });
    } catch {
      setError("Data antrean gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVisits();
  }, [page]);

  async function startConsultation(visit) {
    await api.patch(`/visits/${visit.id}/status`, { status: "IN_CONSULTATION" });
    navigate(`/consultation/${visit.id}`);
  }

  async function cancelVisit(visit) {
    const confirmed = window.confirm(`Batalkan antrean ${visit.patient.name}?`);

    if (!confirmed) {
      return;
    }

    setCancellingId(visit.id);

    try {
      await api.patch(`/visits/${visit.id}/status`, { status: "CANCELLED" });
      await loadVisits();
    } finally {
      setCancellingId(null);
    }
  }

  function renderVisitActions(visit, isMobile = false) {
    if (visit.status === "COMPLETED") {
      if (isMobile) {
        return visit.invoice ? (
          <Button className="w-full" variant="outline" onClick={() => navigate(`/invoice/${visit.id}`)}>
            Tagihan
          </Button>
        ) : (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-700">
            Selesai
          </span>
        );
      }

      return (
        <div className="w-full">
          {visit.invoice ? (
            <Button className="h-9 w-full px-2 text-xs" variant="outline" onClick={() => navigate(`/invoice/${visit.id}`)}>
              Tagihan
            </Button>
          ) : (
            <span className="grid h-9 w-full place-items-center text-sm text-emerald-700">
              Selesai
            </span>
          )}
        </div>
      );
    }

    if (visit.status === "CANCELLED") {
      return isMobile ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-500">
          Antrean dibatalkan
        </p>
      ) : (
        <span className="grid h-9 w-full place-items-center text-sm text-slate-400">-</span>
      );
    }

    if (!isMobile) {
      return (
        <div className={canCancelVisit && visit.status === "WAITING" ? "grid w-full grid-cols-[3fr_2fr] gap-1.5" : "w-full"}>
          <Button className="h-9 w-full min-w-0 px-2 text-xs" variant={visit.status === "WAITING" ? "success" : "primary"} onClick={() => startConsultation(visit)}>
            {visit.status === "IN_CONSULTATION" ? "Lanjut" : "Mulai"}
          </Button>
          {canCancelVisit && visit.status === "WAITING" && (
            <Button className="h-9 w-full min-w-0 px-2 text-xs" variant="danger" onClick={() => cancelVisit(visit)} disabled={cancellingId === visit.id}>
              Batal
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <Button className="w-full" variant={visit.status === "WAITING" ? "success" : "primary"} onClick={() => startConsultation(visit)}>
          {visit.status === "IN_CONSULTATION" ? "Lanjutkan" : "Mulai"}
        </Button>
        {canCancelVisit && visit.status === "WAITING" && (
          <Button className="w-full" variant="danger" onClick={() => cancelVisit(visit)} disabled={cancellingId === visit.id}>
            Batalkan
          </Button>
        )}
      </>
    );
  }

  const firstVisitNumber =
    visitMeta.total === 0
      ? 0
      : (visitMeta.page - 1) * visitMeta.limit + 1;
  const lastVisitNumber = Math.min(
    visitMeta.page * visitMeta.limit,
    visitMeta.total
  );
  const paginationItems = getPaginationItems(
    visitMeta.page,
    visitMeta.totalPages
  );

  return (
    <PageMotion>
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-950">Antrean</h1>
          <p className="text-sm text-slate-500">{visitMeta.total} kunjungan hari ini</p>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
            Memuat antrean...
          </div>
        ) : error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
            {error}
          </div>
        ) : visits.length === 0 ? (
          <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
            Belum ada pasien dalam antrean.
          </div>
        ) : (
          <>
        <div className="hidden overflow-hidden rounded-md border border-primary-100 lg:block">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-primary-50/80 text-xs uppercase text-primary-700">
              <tr>
                <th className="w-[23%] px-4 py-3 font-semibold">Pasien</th>
                <th className="w-[19%] px-4 py-3 font-semibold">Kunjungan</th>
                <th className="w-[10%] px-4 py-3 font-semibold">Waktu</th>
                <th className="w-[21%] px-4 py-3 font-semibold">Dokter</th>
                <th className="w-[11%] px-4 py-3 font-semibold">Status</th>
                <th className="w-[16%] px-4 py-3 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
                <MotionItem key={visit.id} as="tr" index={index} className={index % 2 === 0 ? "bg-white align-middle" : "bg-slate-50/60 align-middle"}>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle font-medium text-slate-900"><p className="break-words">{visit.patient.name}</p></td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600"><p className="break-words">{visit.visitNumber}</p></td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600">{new Date(visit.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle text-slate-600"><p className="break-words">{visit.doctor.name}</p></td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle">
                    <Badge tone={getVisitStatusTone(visit.status)}>
                      {formatVisitStatus(visit.status)}
                    </Badge>
                  </td>
                  <td className="border-t border-slate-100 px-4 py-4 align-middle">
                    <div className="flex w-36 max-w-full items-center justify-start">
                      {renderVisitActions(visit)}
                    </div>
                  </td>
                </MotionItem>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 lg:hidden">
          {visits.map((visit, index) => (
            <MotionItem key={visit.id} index={index} className="min-w-0 rounded-md border border-primary-100 bg-white p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-semibold text-slate-950">{visit.patient.name}</h3>
                  <p className="mt-1 break-words text-xs text-slate-400">{visit.visitNumber}</p>
                </div>
                <Badge className="shrink-0" tone={getVisitStatusTone(visit.status)}>
                  {formatVisitStatus(visit.status)}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p className="break-words"><span className="font-medium text-slate-900">Dokter:</span> {visit.doctor.name}</p>
                <p><span className="font-medium text-slate-900">Waktu:</span> {new Date(visit.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="mt-4 grid gap-2">
                {renderVisitActions(visit, true)}
              </div>
            </MotionItem>
          ))}
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-[#35585e] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <p className="min-w-0">
            Menampilkan {firstVisitNumber}-{lastVisitNumber} dari {visitMeta.total} antrean
          </p>
          {visitMeta.totalPages > 1 && (
            <>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:hidden">
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                disabled={visitMeta.page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Prev
              </Button>
              <p className="truncate text-center text-xs font-medium text-slate-500">
                Halaman {visitMeta.page} / {visitMeta.totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                disabled={visitMeta.page >= visitMeta.totalPages || loading}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, visitMeta.totalPages))
                }
              >
                Next
              </Button>
            </div>
            <div className="hidden min-w-0 items-center gap-1 overflow-x-auto pb-1 sm:flex lg:justify-end lg:overflow-visible lg:pb-0">
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 px-3"
                disabled={visitMeta.page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Sebelumnya
              </Button>
              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <Button
                    key={item}
                    type="button"
                    variant={item === visitMeta.page ? "primary" : "outline"}
                    className="size-9 shrink-0 px-0"
                    disabled={loading}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                ) : (
                  <span
                    key={item}
                    className="grid size-9 shrink-0 place-items-center text-slate-400"
                  >
                    ...
                  </span>
                )
              )}
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 px-3"
                disabled={visitMeta.page >= visitMeta.totalPages || loading}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, visitMeta.totalPages))
                }
              >
                Berikutnya
              </Button>
            </div>
            </>
          )}
        </div>
          </>
        )}
      </CardContent>
    </Card>
    </PageMotion>
  );
}
