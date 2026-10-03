import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BellRing, X } from "lucide-react";
import { useDashboardSocketEvent } from "../hooks/useDashboardSocketEvent";
import { formatQueueCode } from "../lib/queue";

function QueueToast({ notice, dismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(notice.visitId), 10000);
    return () => clearTimeout(timer);
  }, [notice.visitId, dismiss]);
  return (
    <div className="pointer-events-auto flex items-start gap-3 rounded-lg border border-teal-200 bg-white p-4 shadow-lg dark:border-teal-800 dark:bg-[#101a1d]">
      <BellRing aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Pasien baru masuk antrean</p>
        <p className="mt-1 break-words text-sm text-slate-700 dark:text-slate-300">{notice.patientName} · {formatQueueCode(notice.queueNumber, notice.doctorQueueIndex)}</p>
        <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{notice.doctorName}</p>
      </div>
      <button type="button" title="Tutup notifikasi" aria-label="Tutup notifikasi antrean" onClick={() => dismiss(notice.visitId)} className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button>
    </div>
  );
}

export function QueueNotifications() {
  const [notices, setNotices] = useState([]);
  const seen = useRef(new Set());
  const dismiss = useRef((id) => setNotices((current) => current.filter((item) => item.visitId !== id))).current;
  useDashboardSocketEvent("queue:created", (notice) => {
    if (!notice?.visitId || seen.current.has(notice.visitId)) return;
    seen.current.add(notice.visitId);
    setNotices((current) => [...current, notice]);
  }, 0);

  return createPortal(
    <div role="status" aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed right-4 top-4 z-[100] grid max-h-[80svh] w-[calc(100%_-_2rem)] max-w-sm gap-3 overflow-y-auto">
      {notices.map((notice) => <QueueToast key={notice.visitId} notice={notice} dismiss={dismiss} />)}
    </div>, document.body
  );
}
