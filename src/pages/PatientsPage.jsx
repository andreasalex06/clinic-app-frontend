import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { MotionItem, MotionPanel, MotionSection, PageMotion } from "../components/ui/Motion";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuthStore } from "../stores/authStore";

function formatGender(gender) {
  return gender === "MALE" ? "Laki-laki" : "Perempuan";
}

function formatStatus(status) {
  const labels = {
    WAITING: "Menunggu",
    IN_CONSULTATION: "Dalam konsultasi",
    COMPLETED: "Selesai",
  };

  return labels[status] ?? status;
}

const emptyForm = {
  name: "",
  phone: "",
  gender: "MALE",
  birthDate: "",
  address: "",
};

const PATIENTS_PAGE_SIZE = 10;

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("id-ID");
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

export function PatientsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const redirectTarget = searchParams.get("redirect");
  const [patients, setPatients] = useState([]);
  const [patientMeta, setPatientMeta] = useState({
    page: 1,
    limit: PATIENTS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(
    redirectTarget === "registration",
  );
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const isAdmin = user?.role === "ADMIN";
  const isEditing = Boolean(editingPatient);

  async function loadPatients(nextPage = page, nextSearch = search) {
    setPatientsLoading(true);
    try {
      const response = await api.get("/patients", {
        params: {
          page: nextPage,
          limit: PATIENTS_PAGE_SIZE,
          search: nextSearch || undefined,
        },
      });
      setPatients(response.data.data);
      setPatientMeta(response.data.meta);
    } finally {
      setPatientsLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, [page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingPatient) {
        await api.patch(`/patients/${editingPatient.id}`, form);
        setSuccessMessage("Data pasien berhasil diperbarui.");
      } else {
        await api.post("/patients", form);
        setSuccessMessage("Data pasien berhasil disimpan.");
      }

      resetForm();

      if (redirectTarget === "registration") {
        navigate("/registration");
        return;
      }

      const nextPage = editingPatient ? page : 1;
      setPage(nextPage);
      await loadPatients(nextPage, search);
      setIsPatientFormOpen(false);
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ?? "Data pasien gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(patient) {
    setEditingPatient(patient);
    setError("");
    setSuccessMessage("");
    setForm({
      name: patient.name,
      phone: patient.phone,
      gender: patient.gender,
      birthDate: formatDateInput(patient.birthDate),
      address: patient.address,
    });
    setIsPatientFormOpen(true);
  }

  function openCreatePatientForm() {
    setEditingPatient(null);
    setError("");
    setSuccessMessage("");
    setForm(emptyForm);
    setIsPatientFormOpen(true);
  }

  function resetForm() {
    setEditingPatient(null);
    setForm(emptyForm);
  }

  function closePatientForm() {
    resetForm();
    setError("");
    setIsPatientFormOpen(false);
  }

  async function handleDelete(patient) {
    const confirmed = window.confirm(`Hapus pasien ${patient.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(patient.id);
    setError("");
    setSuccessMessage("");

    try {
      await api.delete(`/patients/${patient.id}`);

      if (editingPatient?.id === patient.id) {
        resetForm();
      }

      const nextPage = patients.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await loadPatients(nextPage, search);
      setSuccessMessage("Data pasien berhasil dihapus.");
    } catch {
      setError("Data pasien gagal dihapus.");
    } finally {
      setDeletingId(null);
    }
  }

  async function openPatientDetail(patient) {
    setSelectedPatient(patient);
    setDetailLoading(true);
    setDetailError("");

    try {
      const response = await api.get(`/patients/${patient.id}`);
      setSelectedPatient(response.data.data);
    } catch {
      setDetailError("Detail pasien gagal dimuat.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closePatientDetail() {
    setSelectedPatient(null);
    setDetailError("");
  }

  function handleSearchChange(event) {
    setSearchInput(event.target.value);
  }

  const firstPatientNumber =
    patientMeta.total === 0
      ? 0
      : (patientMeta.page - 1) * patientMeta.limit + 1;
  const lastPatientNumber = Math.min(
    patientMeta.page * patientMeta.limit,
    patientMeta.total,
  );
  const paginationItems = getPaginationItems(
    patientMeta.page,
    patientMeta.totalPages,
  );

  return (
    <>
      <PageMotion>
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="page-title">Pasien</h1>
              <p className="text-sm text-slate-500">
                {patientMeta.total} pasien terdaftar
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:max-w-xl">
              <Input
                aria-label="Cari pasien"
                placeholder="Cari nama atau telepon..."
                value={searchInput}
                onChange={handleSearchChange}
              />
              <Button type="button" className="w-full sm:w-auto" onClick={openCreatePatientForm}>
                <Plus size={16} />
                Tambah Pasien
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence initial={false}>
              {error && !isPatientFormOpen && (
                <MotionItem key="patient-list-error" className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
                  {error}
                </MotionItem>
              )}
              {successMessage && !isPatientFormOpen && (
                <MotionItem key="patient-list-success" className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  {successMessage}
                </MotionItem>
              )}
            </AnimatePresence>
            {patientsLoading ? (
              <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
                Memuat pasien...
              </div>
            ) : patients.length === 0 ? (
              <div className="rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-6 text-center text-sm text-slate-500">
                {search
                  ? "Tidak ada pasien yang cocok."
                  : "Belum ada pasien terdaftar."}
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-md border border-primary-100 lg:block">
                  <table className="data-table">
                    <thead className="bg-primary-50/80 text-xs text-primary-700">
                      <tr>
                        <th className="w-[22%] px-4 py-3 font-medium">
                          Nama
                        </th>
                        <th className="w-[20%] px-4 py-3 font-medium">
                          Telepon
                        </th>
                        <th className="w-[14%] px-4 py-3 font-medium">
                          Jenis Kelamin
                        </th>
                        <th
                          className={
                            isAdmin
                              ? "w-[24%] px-4 py-3 font-semibold"
                              : "w-[44%] px-4 py-3 font-semibold"
                          }
                        >
                          Alamat
                        </th>
                        {isAdmin && (
                          <th className="w-[20%] px-4 py-3 text-left font-medium">
                            Aksi
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient, index) => (
                        <MotionItem
                          key={patient.id}
                          as="tr"
                          index={index}
                          className={
                            index % 2 === 0
                              ? "bg-white align-middle"
                              : "bg-slate-50/60 align-middle"
                          }
                        >
                          <td className="border-t border-slate-100 px-4 py-3 align-middle font-medium text-slate-900">
                            <button
                              type="button"
                              className="block w-full truncate text-left font-medium text-slate-900 underline-offset-2 hover:text-primary-700 hover:underline dark:text-slate-100 dark:hover:text-primary-100"
                              title={patient.name}
                              onClick={() => openPatientDetail(patient)}
                            >
                              {patient.name}
                            </button>
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">
                            <p className="break-words">{patient.phone}</p>
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">
                            {formatGender(patient.gender)}
                          </td>
                          <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-600">
                            <p className="truncate" title={patient.address}>
                              {patient.address}
                            </p>
                          </td>
                          {isAdmin && (
                            <td className="border-t border-slate-100 px-4 py-3 align-middle">
                              <div className="grid w-[96px] grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="size-9 px-0"
                                  aria-label={`Edit ${patient.name}`}
                                  onClick={() => startEdit(patient)}
                                >
                                  <Pencil size={15} />
                                </Button>
                                <Button
                                  type="button"
                                  variant="danger"
                                  className="size-9 px-0"
                                  aria-label={`Hapus ${patient.name}`}
                                  onClick={() => handleDelete(patient)}
                                  disabled={deletingId === patient.id}
                                >
                                  <Trash2 size={15} />
                                </Button>
                              </div>
                            </td>
                          )}
                        </MotionItem>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:hidden">
                  {patients.map((patient, index) => (
                    <MotionItem
                      key={patient.id}
                      index={index}
                      className="min-w-0 rounded-md border border-primary-100 bg-white p-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <button
                          type="button"
                          className="min-w-0 text-left"
                          onClick={() => openPatientDetail(patient)}
                        >
                          <h3 className="break-words text-sm font-medium text-slate-950 underline-offset-2 hover:text-primary-700 hover:underline dark:hover:text-primary-100">
                            {patient.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {patient.phone}
                          </p>
                        </button>
                        <span className="shrink-0 rounded bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
                          {formatGender(patient.gender)}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-600">
                        {patient.address}
                      </p>
                      {isAdmin && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => startEdit(patient)}
                          >
                            <Pencil size={15} />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => handleDelete(patient)}
                            disabled={deletingId === patient.id}
                          >
                            <Trash2 size={15} />
                            Hapus
                          </Button>
                        </div>
                      )}
                    </MotionItem>
                  ))}
                </div>

                <MotionSection className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-[#35585e] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <p className="min-w-0">
                    Menampilkan {firstPatientNumber}-{lastPatientNumber} dari{" "}
                    {patientMeta.total} pasien
                  </p>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:hidden">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-3"
                      disabled={patientMeta.page <= 1 || patientsLoading}
                      onClick={() =>
                        setPage((current) => Math.max(current - 1, 1))
                      }
                    >
                      Prev
                    </Button>
                    <p className="truncate text-center text-xs font-medium text-slate-500">
                      Halaman {patientMeta.page} / {patientMeta.totalPages}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-3"
                      disabled={
                        patientMeta.page >= patientMeta.totalPages ||
                        patientsLoading
                      }
                      onClick={() =>
                        setPage((current) =>
                          Math.min(current + 1, patientMeta.totalPages),
                        )
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
                      disabled={patientMeta.page <= 1 || patientsLoading}
                      onClick={() =>
                        setPage((current) => Math.max(current - 1, 1))
                      }
                    >
                      Sebelumnya
                    </Button>
                    {paginationItems.map((item) =>
                      typeof item === "number" ? (
                        <Button
                          key={item}
                          type="button"
                          variant={
                            item === patientMeta.page ? "primary" : "outline"
                          }
                          className="size-9 shrink-0 px-0"
                          disabled={patientsLoading}
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
                      ),
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 shrink-0 px-3"
                      disabled={
                        patientMeta.page >= patientMeta.totalPages ||
                        patientsLoading
                      }
                      onClick={() =>
                        setPage((current) =>
                          Math.min(current + 1, patientMeta.totalPages),
                        )
                      }
                    >
                      Berikutnya
                    </Button>
                  </div>
                </MotionSection>
              </>
            )}
          </CardContent>
        </Card>
      </PageMotion>

      <AnimatePresence>
      {isPatientFormOpen && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-3 py-6"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          onClick={closePatientForm}
        >
          <MotionPanel
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-primary-100 bg-white shadow-xl shadow-black/20 dark:border-[#35585e] dark:bg-[#101a1d]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 dark:border-[#35585e] sm:px-5">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold text-slate-950">
                  {isEditing ? "Edit Pasien" : "Tambah Pasien"}
                </h2>
                {isEditing ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Perbarui data pasien yang dipilih.
                  </p>
                ) : redirectTarget === "registration" ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Setelah disimpan, Anda akan kembali ke registrasi.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    Lengkapi data pasien baru.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="size-9 shrink-0 px-0"
                aria-label="Tutup form pasien"
                onClick={closePatientForm}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="p-4 sm:p-5">
              <AnimatePresence initial={false}>
                {error && (
                  <MotionItem key="patient-form-error" className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
                    {error}
                  </MotionItem>
                )}
                {successMessage && (
                  <MotionItem key="patient-form-success" className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    {successMessage}
                  </MotionItem>
                )}
              </AnimatePresence>

              <MotionSection as="form" className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  placeholder="Nama pasien"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value.toUpperCase() })
                  }
                />
                <Input
                  placeholder="Nomor telepon"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
                <Select
                  value={form.gender}
                  onChange={(event) =>
                    setForm({ ...form, gender: event.target.value })
                  }
                >
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </Select>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) =>
                    setForm({ ...form, birthDate: event.target.value })
                  }
                />
                <Textarea
                  placeholder="Alamat"
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button className="w-full" disabled={saving}>
                    {saving
                      ? "Menyimpan..."
                      : isEditing
                        ? "Perbarui Pasien"
                        : "Simpan Pasien"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={closePatientForm}
                    disabled={saving}
                  >
                    Batal
                  </Button>
                </div>
              </MotionSection>
            </div>
          </MotionPanel>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {selectedPatient && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-3 py-6"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={closePatientDetail}
        >
          <MotionPanel
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-primary-100 bg-white shadow-xl shadow-black/20 dark:border-[#35585e] dark:bg-[#101a1d]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 dark:border-[#35585e] sm:px-5">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold text-slate-950">
                  {selectedPatient.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Detail pasien</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="size-9 shrink-0 px-0"
                aria-label="Tutup detail pasien"
                onClick={closePatientDetail}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-5 p-4 sm:p-5">
              {detailLoading ? (
                <p className="text-sm text-slate-500">Memuat detail...</p>
              ) : detailError ? (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
                  {detailError}
                </p>
              ) : (
                <>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Telepon
                      </p>
                      <p className="mt-1 break-words font-medium text-slate-900">
                        {selectedPatient.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Jenis Kelamin
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatGender(selectedPatient.gender)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Tanggal Lahir
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatDate(selectedPatient.birthDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        Terdaftar
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatDate(selectedPatient.createdAt)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-slate-400">Alamat</p>
                      <p className="mt-1 break-words leading-6 text-slate-700">
                        {selectedPatient.address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-950">
                      Riwayat Kunjungan
                    </h3>
                    {selectedPatient.visits?.length ? (
                      <div className="mt-3 grid gap-2">
                        {selectedPatient.visits.map((visit, index) => (
                          <MotionItem
                            key={visit.id}
                            index={index}
                            className="rounded-md border border-primary-100 bg-primary-50/50 p-3 dark:border-[#35585e] dark:bg-[#0b2324]"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-medium text-slate-900">
                                {visit.visitNumber}
                              </p>
                              <p className="text-sm text-slate-500">
                                {formatDate(visit.checkInTime)}
                              </p>
                            </div>
                            <p className="mt-2 break-words text-sm text-slate-600">
                              Dokter: {visit.doctor?.name ?? "-"}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Status: {formatStatus(visit.status)}
                            </p>
                          </MotionItem>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-md border border-dashed border-primary-200 bg-primary-50/60 p-4 text-sm text-slate-500">
                        Belum ada riwayat kunjungan.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </MotionPanel>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
