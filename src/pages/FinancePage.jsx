import { Activity, Banknote, FileWarning, ReceiptText, RefreshCw, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api/client";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { MotionItem, MotionSection, PageMotion } from "../components/ui/Motion";
import { cn } from "../lib/utils";

const periodOptions = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" }
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatInvoiceStatus(status) {
  return status === "PAID" ? "Lunas" : "Belum bayar";
}

function FinanceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-primary-100 bg-white px-3 py-2 text-xs shadow-lg shadow-primary-950/10 dark:border-[#4a7378] dark:bg-[#101a1d]">
      <p className="mb-1 font-semibold text-slate-950 dark:text-slate-100">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-slate-600 dark:text-slate-300">
          <span className="font-medium" style={{ color: item.color }}>{item.name}: </span>
          {item.dataKey === "revenue" ? formatRupiah(item.value) : item.value}
        </p>
      ))}
    </div>
  );
}

export function FinancePage() {
  const [period, setPeriod] = useState("daily");
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFinance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/finance?period=${period}`);
      setFinance(response.data.data);
    } catch {
      setError("Data finance belum dapat dimuat. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadFinance();
  }, [loadFinance]);

  const summary = finance?.summary;
  const trends = finance?.trends ?? [];
  const recentInvoices = finance?.recentInvoices ?? [];
  const activePeriodLabel = periodOptions.find((item) => item.value === period)?.label ?? "Harian";

  const cards = [
    {
      label: "Pendapatan",
      value: formatRupiah(summary?.totalRevenue),
      icon: Banknote,
      surfaceClass: "bg-[#e8f7f4] dark:bg-[#0b302e]",
      iconClass: "bg-primary-600 text-white dark:bg-[#249d8f]"
    },
    {
      label: "Invoice Lunas",
      value: summary?.paidInvoices ?? 0,
      icon: ReceiptText,
      surfaceClass: "bg-[#edf8f0] dark:bg-[#123126]",
      iconClass: "bg-emerald-600 text-white dark:bg-emerald-500"
    },
    {
      label: "Belum Bayar",
      value: summary?.unpaidInvoices ?? 0,
      icon: FileWarning,
      surfaceClass: "bg-[#fff7e6] dark:bg-[#322812]",
      iconClass: "bg-amber-500 text-slate-950 dark:bg-amber-400"
    },
    {
      label: "Piutang",
      value: formatRupiah(summary?.outstandingRevenue),
      icon: WalletCards,
      surfaceClass: "bg-[#fff0f1] dark:bg-[#351c22]",
      iconClass: "bg-rose-600 text-white dark:bg-rose-500"
    }
  ];

  return (
    <PageMotion>
      <div className="space-y-4 sm:space-y-5">
        <section className="overflow-hidden rounded-lg bg-white shadow-md shadow-primary-950/5 dark:bg-[#101a1d] dark:shadow-black/20">
          <div className="relative bg-white dark:bg-[#101a1d]">
            <div className="flex min-w-0 flex-col justify-between gap-3 bg-primary-600 p-4 dark:bg-[#249d8f] sm:flex-row sm:items-center sm:p-5">
              <MotionSection className="min-w-0">
                <h1 className="break-words text-lg font-semibold leading-7 text-white">Finance</h1>
                <p className="mt-1 text-sm leading-5 text-primary-50/85">Ringkasan pendapatan, tagihan, dan tren pasien</p>
              </MotionSection>

              <div className="grid w-full shrink-0 grid-cols-3 gap-1 rounded-md border border-primary-100 bg-white p-1 shadow-sm shadow-primary-950/10 dark:border-[#4a7378] dark:bg-[#101a1d] sm:w-72">
                {periodOptions.map((item) => (
                  <Button
                    key={item.value}
                    type="button"
                    variant={period === item.value ? "primary" : "ghost"}
                    className={cn(
                      "h-9 px-2 text-xs sm:px-3 sm:text-sm",
                      period === item.value
                        ? "shadow-sm shadow-primary-950/10"
                        : "text-primary-700 hover:bg-primary-50 hover:text-primary-900 dark:text-slate-200 dark:hover:bg-[#0d3435] dark:hover:text-white"
                    )}
                    onClick={() => setPeriod(item.value)}
                    aria-pressed={period === item.value}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {error && (
                <div className="mb-4 flex flex-col gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button type="button" variant="ghost" className="min-h-11 shrink-0 border border-rose-200 dark:border-rose-800" onClick={() => void loadFinance()}>
                    <RefreshCw className="size-4" />
                    Muat ulang
                  </Button>
                </div>
              )}

              <div aria-label="Metrik finance" className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
                {cards.map((item, index) => (
                  <MotionItem
                    key={item.label}
                    index={index}
                    className={`h-full rounded-md ${item.surfaceClass}`}
                  >
                    <div className="flex min-h-24 min-w-0 items-center gap-3 p-3 sm:min-h-28 sm:gap-4 sm:p-4">
                      <div className={`grid size-10 shrink-0 place-items-center rounded-md sm:size-11 ${item.iconClass}`}>
                        <item.icon className="size-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-[clamp(0.7rem,3.2vw,1.125rem)] font-semibold leading-tight tabular-nums text-slate-950 dark:text-slate-100">{loading ? "-" : item.value}</p>
                        <p className="mt-1.5 text-xs font-medium leading-4 text-slate-600 dark:text-slate-300">{item.label}</p>
                      </div>
                    </div>
                  </MotionItem>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="overflow-hidden border-slate-200 dark:border-[#35585e]">
            <CardContent className="p-0 sm:p-0">
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-[#35585e] sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-50 text-primary-700 dark:bg-[#0b302e] dark:text-[#7ce5d9]">
                    <Banknote className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-5 text-slate-950 dark:text-slate-100">Pendapatan</h2>
                    <p className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">Tren {activePeriodLabel.toLowerCase()} berdasarkan invoice lunas</p>
                  </div>
                </div>
              </div>
              <div className="finance-chart-surface h-72 min-w-0 px-2 pb-3 pt-4 sm:h-80 sm:px-4">
                {loading || trends.length === 0 ? (
                  <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-400">
                    {loading ? "Memuat tren pendapatan..." : "Belum ada pendapatan pada periode ini."}
                  </div>
                ) : <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dbe7e5" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} angle={-24} textAnchor="end" height={48} interval="preserveStartEnd" />
                    <YAxis width={50} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                    <Tooltip content={<FinanceTooltip />} />
                    <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#0f8f82" strokeWidth={3} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 dark:border-[#35585e]">
            <CardContent className="p-0 sm:p-0">
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-[#35585e] sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    <Activity className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-5 text-slate-950 dark:text-slate-100">Kunjungan Pasien</h2>
                    <p className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">Volume pasien pada periode {activePeriodLabel.toLowerCase()}</p>
                  </div>
                </div>
              </div>
              <div className="finance-chart-surface h-72 min-w-0 px-2 pb-3 pt-4 sm:h-80 sm:px-4">
                {loading || trends.length === 0 ? (
                  <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-400">
                    {loading ? "Memuat tren pasien..." : "Belum ada kunjungan pada periode ini."}
                  </div>
                ) : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dbe7e5" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} angle={-24} textAnchor="end" height={48} interval="preserveStartEnd" />
                    <YAxis width={34} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<FinanceTooltip />} />
                    <Bar dataKey="patients" name="Pasien" fill="#288fb8" radius={[4, 4, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-slate-200 dark:border-[#35585e]">
          <CardContent className="p-0 sm:p-0">
            <div className="border-b border-slate-100 px-4 py-4 dark:border-[#35585e] sm:px-5">
              <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">Invoice Terbaru</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Delapan tagihan terakhir dari transaksi klinik</p>
            </div>

            <div className="p-4 sm:p-5">
            {loading || recentInvoices.length === 0 ? (
              <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500 dark:border-[#4a7378] dark:bg-[#0b2324] dark:text-slate-400">
                {loading ? "Memuat invoice terbaru..." : "Belum ada invoice pada periode ini."}
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-md border border-primary-100 md:block">
                  <table className="data-table">
                    <thead className="bg-primary-50/80 text-xs text-primary-700">
                      <tr>
                        <th className="w-[20%] px-4 py-3 font-medium">Invoice</th>
                        <th className="w-[24%] px-4 py-3 font-medium">Pasien</th>
                        <th className="w-[22%] px-4 py-3 font-medium">Dokter</th>
                        <th className="w-[14%] px-4 py-3 font-medium">Tanggal</th>
                        <th className="w-[12%] px-4 py-3 font-medium">Status</th>
                        <th className="w-[16%] px-4 py-3 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice, index) => (
                        <MotionItem key={invoice.id} as="tr" index={index} className={index % 2 === 0 ? "bg-white align-middle" : "bg-slate-50/60 align-middle"}>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle font-medium text-slate-900 dark:text-slate-100">{invoice.invoiceNo}</td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600"><p className="break-words">{invoice.visit.patient.name}</p></td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600"><p className="break-words">{invoice.visit.doctor.name}</p></td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">{formatDate(invoice.createdAt)}</td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle">
                            <Badge tone={invoice.status === "PAID" ? "green" : "amber"}>{formatInvoiceStatus(invoice.status)}</Badge>
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 text-right align-middle font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(invoice.total)}</td>
                        </MotionItem>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 md:hidden">
                  {recentInvoices.map((invoice, index) => (
                    <MotionItem key={invoice.id} index={index} className="min-w-0 rounded-md border border-primary-100 bg-white p-4 dark:border-[#4a7378] dark:bg-[#0b2324]">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-medium text-slate-950 dark:text-slate-100">{invoice.invoiceNo}</h3>
                          <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">{invoice.visit.patient.name}</p>
                        </div>
                        <Badge className="shrink-0" tone={invoice.status === "PAID" ? "green" : "amber"}>{formatInvoiceStatus(invoice.status)}</Badge>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="break-words text-xs text-slate-500 dark:text-slate-400">{formatDate(invoice.createdAt)}</p>
                        <p className="text-right text-sm font-semibold text-slate-950 dark:text-slate-100">{formatRupiah(invoice.total)}</p>
                      </div>
                    </MotionItem>
                  ))}
                </div>
              </>
            )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}
