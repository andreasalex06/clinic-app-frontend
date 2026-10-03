import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { MotionItem, PageMotion } from "../components/ui/Motion";
import { formatQueueCode } from "../lib/queue";
import { useDashboardSocketEvent } from "../hooks/useDashboardSocketEvent";

const statusOptions = [
  { value: "", label: "Semua" },
  { value: "WAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PREPARING", label: "Sedang Diracik" },
  { value: "READY_FOR_PICKUP", label: "Siap Diambil" },
  { value: "COMPLETED", label: "Selesai" }
];

const statusLabels = {
  WAITING_PAYMENT: "Menunggu Bayar",
  PREPARING: "Obat Diracik",
  READY_FOR_PICKUP: "Siap Diambil",
  COMPLETED: "Selesai"
};

function getStatusTone(status) {
  if (status === "WAITING_PAYMENT") return "amber";
  if (status === "PREPARING") return "primary";
  if (status === "READY_FOR_PICKUP") return "green";
  return "slate";
}

function formatQueueNumber(order) {
  return formatQueueCode(order.queueNumber);
}

function getMedicineSummary(order) {
  const medicines = order.visit.consultation?.medicines ?? [];

  if (medicines.length === 0) {
    return "Tidak ada obat";
  }

  return medicines
    .map((item) => `${item.medicine.name} x${item.quantity}${item.instructions ? ` - ${item.instructions}` : ""}`)
    .join("; ");
}

export function PharmacyPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  async function loadOrders(nextStatus = status, showLoading = true) {
    if (showLoading) setLoading(true);
    setError("");

    try {
      const response = await api.get("/pharmacy", {
        params: { status: nextStatus || undefined }
      });
      setOrders(response.data.data);
    } catch {
      setError("Data farmasi gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, [status]);

  useDashboardSocketEvent("pharmacy:changed", () => loadOrders(status, false));

  async function updateOrder(order, action) {
    setUpdatingId(order.id);
    setError("");

    try {
      await api.patch(`/pharmacy/${order.id}/${action}`);
      await loadOrders(status, false);
    } catch {
      setError("Status farmasi gagal diperbarui.");
    } finally {
      setUpdatingId(null);
    }
  }

  function renderActions(order) {
    if (order.status === "WAITING_PAYMENT") {
      return <span className="text-sm text-slate-500">Menunggu kasir</span>;
    }

    if (order.status === "PREPARING") {
      return (
        <Button className="h-9 w-full px-2 text-xs" onClick={() => updateOrder(order, "ready")} disabled={updatingId === order.id}>
          Siap Diambil
        </Button>
      );
    }

    if (order.status === "READY_FOR_PICKUP") {
      return (
        <Button className="h-9 w-full px-2 text-xs" variant="success" onClick={() => updateOrder(order, "complete")} disabled={updatingId === order.id}>
          Selesai
        </Button>
      );
    }

    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <PageMotion>
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="page-title">Farmasi</h1>
            <p className="page-description">{orders.length} order obat ditemukan</p>
          </div>
          <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter status farmasi">
            {statusOptions.map((option) => {
              const isActive = status === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? "primary" : "outline"}
                  aria-pressed={isActive}
                  className="h-9 shrink-0 whitespace-nowrap px-3 text-xs"
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
              Memuat order farmasi...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
              Belum ada order farmasi.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-md border border-primary-100 xl:block">
                <table className="data-table min-w-[840px]">
                  <thead className="bg-primary-50/80 text-xs text-primary-700">
                    <tr>
                      <th className="w-[10%] px-4 py-3 font-medium">No.</th>
                      <th className="w-[20%] px-4 py-3 font-medium">Pasien</th>
                      <th className="w-[15%] px-4 py-3 font-medium">Kunjungan</th>
                      <th className="w-[22%] px-4 py-3 font-medium">Obat</th>
                      <th className="w-[17%] px-4 py-3 font-medium">Status</th>
                      <th className="w-[16%] px-4 py-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <MotionItem key={order.id} as="tr" index={index} className={index % 2 === 0 ? "bg-white align-middle" : "bg-slate-50/60 align-middle"}>
                        <td className="whitespace-nowrap border-t border-slate-100 px-4 py-3 align-middle font-medium tabular-nums text-primary-700">{formatQueueNumber(order)}</td>
                        <td className="border-t border-slate-100 px-4 py-3 align-middle">
                          <p className="break-words font-medium text-slate-900">{order.visit.patient.name}</p>
                          <p className="mt-1 break-words text-xs text-slate-500">{order.visit.doctor.name}</p>
                        </td>
                        <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">{order.visit.visitNumber}</td>
                        <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">
                          <p className="line-clamp-2 break-words">{getMedicineSummary(order)}</p>
                        </td>
                        <td className="border-t border-slate-100 px-4 py-3 align-middle">
                          <Badge tone={getStatusTone(order.status)}>{statusLabels[order.status]}</Badge>
                        </td>
                        <td className="border-t border-slate-100 px-4 py-3 align-middle">{renderActions(order)}</td>
                      </MotionItem>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:hidden">
                {orders.map((order, index) => (
                  <MotionItem key={order.id} index={index} className="rounded-md border border-primary-100 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-base font-medium tabular-nums text-primary-700">{formatQueueNumber(order)}</p>
                        <h3 className="mt-1 break-words text-sm font-medium text-slate-950">{order.visit.patient.name}</h3>
                        <p className="mt-1 break-words text-xs text-slate-500">{order.visit.visitNumber} - {order.visit.doctor.name}</p>
                      </div>
                      <Badge className="shrink-0" tone={getStatusTone(order.status)}>{statusLabels[order.status]}</Badge>
                    </div>
                    <p className="mt-3 break-words text-sm leading-6 text-slate-600">{getMedicineSummary(order)}</p>
                    <div className="mt-4">{renderActions(order)}</div>
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
