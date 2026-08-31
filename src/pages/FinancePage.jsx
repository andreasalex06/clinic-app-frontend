import { Activity, Banknote, FileWarning, ReceiptText, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

  useEffect(() => {
    async function loadFinance() {
      setLoading(true);
      const response = await api.get(`/finance?period=${period}`);
      setFinance(response.data.data);
      setLoading(false);
    }

    void loadFinance();
  }, [period]);

  const summary = finance?.summary;
  const trends = finance?.trends ?? [];
  const recentInvoices = finance?.recentInvoices ?? [];
  const activePeriodLabel = periodOptions.find((item) => item.value === period)?.label ?? "Harian";

  const cards = [
    {
      label: "Pendapatan",
      value: formatRupiah(summary?.totalRevenue),
      icon: Banknote,
      iconClass: "bg-primary-600 text-white shadow-sm shadow-primary-950/10 dark:bg-[#249d8f] dark:text-white"
    },
    {
      label: "Invoice Lunas",
      value: summary?.paidInvoices ?? 0,
      icon: ReceiptText,
      iconClass: "bg-primary-600 text-white shadow-sm shadow-primary-950/10 dark:bg-[#249d8f] dark:text-white"
    },
    {
      label: "Belum Bayar",
      value: summary?.unpaidInvoices ?? 0,
      icon: FileWarning,
      iconClass: "bg-primary-600 text-white shadow-sm shadow-primary-950/10 dark:bg-[#249d8f] dark:text-white"
    },
    {
      label: "Piutang",
      value: formatRupiah(summary?.outstandingRevenue),
      icon: WalletCards,
      iconClass: "bg-primary-600 text-white shadow-sm shadow-primary-950/10 dark:bg-[#249d8f] dark:text-white"
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
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {cards.map((item, index) => (
                  <MotionItem
                    key={item.label}
                    index={index}
                    className="h-full rounded-md border border-primary-100 bg-primary-50/60 shadow-sm shadow-primary-950/5 dark:border-[#4a7378] dark:bg-[#0b2324]"
                  >
                    <div className="flex min-h-[5.5rem] min-w-0 items-center gap-3 p-3.5 sm:min-h-24">
                      <div className={`grid size-9 shrink-0 place-items-center rounded-md ${item.iconClass}`}>
                        <item.icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-base font-semibold leading-6 tabular-nums text-primary-950 dark:text-slate-100">{loading ? "-" : item.value}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{item.label}</p>
                      </div>
                    </div>
                  </MotionItem>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-primary-100 dark:border-[#4a7378]">
            <CardContent className="space-y-2">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-600 text-white shadow-sm shadow-primary-950/10 dark:bg-[#249d8f]">
                    <Banknote className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-medium leading-tight text-slate-950 dark:text-slate-100">Grafik Pendapatan</h2>
                    <p className="text-xs font-medium leading-tight text-slate-500 dark:text-slate-300">Periode {activePeriodLabel.toLowerCase()}</p>
                  </div>
                </div>
              </div>
              <div className="finance-chart-surface h-72 min-w-0 rounded-md border border-primary-100 bg-primary-50/40 p-2 dark:!border-[#35585e] dark:!bg-[#0b2324]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 8, right: 12, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-28} textAnchor="end" height={48} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                    <Tooltip content={<FinanceTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary-100 dark:border-[#4a7378]">
            <CardContent className="space-y-2">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-600 text-white shadow-sm shadow-primary-950/10 dark:bg-[#249d8f]">
                    <Activity className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-medium leading-tight text-slate-950 dark:text-slate-100">Grafik Pasien</h2>
                    <p className="text-xs font-medium leading-tight text-slate-500 dark:text-slate-300">Periode {activePeriodLabel.toLowerCase()}</p>
                  </div>
                </div>
              </div>
              <div className="finance-chart-surface h-72 min-w-0 rounded-md border border-primary-100 bg-primary-50/40 p-2 dark:!border-[#35585e] dark:!bg-[#0b2324]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-28} textAnchor="end" height={48} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<FinanceTooltip />} />
                    <Legend />
                    <Bar dataKey="patients" name="Pasien" fill="#249D8F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-base font-medium text-slate-950">Invoice Terbaru</h2>
              <p className="mt-1 text-sm text-slate-500">Delapan tagihan terakhir dari transaksi klinik</p>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
                Belum ada data invoice.
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
                          <td className="border-t border-slate-100 px-4 py-3 align-middle font-medium text-slate-900">{invoice.invoiceNo}</td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600"><p className="break-words">{invoice.visit.patient.name}</p></td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600"><p className="break-words">{invoice.visit.doctor.name}</p></td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">{formatDate(invoice.createdAt)}</td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle">
                            <Badge tone={invoice.status === "PAID" ? "green" : "amber"}>{formatInvoiceStatus(invoice.status)}</Badge>
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 text-right align-middle font-semibold text-slate-900">{formatRupiah(invoice.total)}</td>
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
                          <h3 className="break-words text-sm font-medium text-slate-950">{invoice.invoiceNo}</h3>
                          <p className="mt-1 break-words text-sm text-slate-500">{invoice.visit.patient.name}</p>
                        </div>
                        <Badge className="shrink-0" tone={invoice.status === "PAID" ? "green" : "amber"}>{formatInvoiceStatus(invoice.status)}</Badge>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="break-words text-xs text-slate-500">{formatDate(invoice.createdAt)}</p>
                        <p className="text-right text-sm font-semibold text-slate-950">{formatRupiah(invoice.total)}</p>
                      </div>
                    </MotionItem>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}
