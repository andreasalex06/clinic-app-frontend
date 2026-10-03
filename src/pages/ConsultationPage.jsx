import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { MotionItem, MotionSection, PageMotion } from "../components/ui/Motion";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Textarea } from "../components/ui/Textarea";

function formatVisitStatus(status) {
  const labels = {
    WAITING: "Menunggu",
    IN_CONSULTATION: "Dalam konsultasi",
    COMPLETED: "Selesai"
  };

  return labels[status] ?? status;
}

function getConsultationFormErrors(form, selectedMedicines) {
  const errors = {};

  if (form.complaint.trim().length < 10) {
    errors.complaint = "Keluhan minimal 10 karakter agar catatan pemeriksaan cukup jelas.";
  }

  if (!form.diagnosisId) {
    errors.diagnosisId = "Diagnosis wajib dipilih.";
  }

  if (form.treatmentIds.length === 0) {
    errors.treatmentIds = "Pilih minimal satu tindakan atau biaya konsultasi.";
  }

  if (form.notes.trim().length < 10) {
    errors.notes = "Catatan minimal 10 karakter untuk dokumentasi konsultasi.";
  }

  const invalidMedicine = selectedMedicines.find((item) => !item.medicineId || item.quantity < 1);

  if (invalidMedicine) {
    errors.medicines = "Obat yang ditambahkan wajib dipilih dan jumlahnya minimal 1.";
  }

  const medicineWithoutInstructions = selectedMedicines.find(
    (item) => item.instructions.trim().length < 3
  );

  if (medicineWithoutInstructions) {
    errors.medicines = "Catatan aturan pakai setiap obat minimal 3 karakter.";
  }

  return errors;
}

function FieldWarning({ children }) {
  if (!children) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-700">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function ConsultationPage() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    complaint: "",
    diagnosisId: "",
    treatmentIds: [],
    notes: ""
  });
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const formErrors = getConsultationFormErrors(form, selectedMedicines);
  const isFormValid = Object.keys(formErrors).length === 0;

  useEffect(() => {
    async function loadData() {
      const [visitsResponse, diagnosesResponse, treatmentsResponse, medicinesResponse] = await Promise.all([
        api.get("/visits?date=today"),
        api.get("/diagnoses"),
        api.get("/treatments"),
        api.get("/medicines")
      ]);
      const activeVisit = visitsResponse.data.data.find((item) => item.id === visitId) ?? null;

      setVisit(activeVisit);
      setDiagnoses(diagnosesResponse.data.data);
      setTreatments(treatmentsResponse.data.data);
      setMedicines(medicinesResponse.data.data);

    }

    void loadData();
  }, [visitId]);

  function addMedicine() {
    if (!medicines.length) return;
    setSelectedMedicines([
      ...selectedMedicines,
      { rowId: crypto.randomUUID(), medicineId: "", quantity: 1, instructions: "" }
    ]);
  }

  function removeMedicine(indexToRemove) {
    setSelectedMedicines((current) => current.filter((_, index) => index !== indexToRemove));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    await api.post("/consultations", {
      visitId,
      ...form,
      medicines: selectedMedicines.map(({ medicineId, quantity, instructions }) => ({ medicineId, quantity, instructions }))
    });

    navigate("/dashboard");
  }

  function toggleTreatment(treatmentId) {
    setForm((current) => {
      const isSelected = current.treatmentIds.includes(treatmentId);

      return {
        ...current,
        treatmentIds: isSelected
          ? current.treatmentIds.filter((id) => id !== treatmentId)
          : [...current.treatmentIds, treatmentId]
      };
    });
  }

  return (
    <PageMotion className="grid items-start gap-5 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:gap-6">
      <Card className="self-start">
        <CardHeader>
          <h1 className="page-title">{visit?.patient.name ?? "Konsultasi"}</h1>
          <p className="break-words text-sm text-slate-500">{visit?.visitNumber}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="break-words"><span className="font-medium text-slate-900">Dokter:</span> {visit?.doctor.name}</p>
          <p className="break-words"><span className="font-medium text-slate-900">Status:</span> {formatVisitStatus(visit?.status)}</p>
          <p className="break-words"><span className="font-medium text-slate-900">Telepon:</span> {visit?.patient.phone}</p>
          <p className="break-words"><span className="font-medium text-slate-900">Alamat:</span> {visit?.patient.address}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium text-slate-950">Form Konsultasi</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-950" htmlFor="complaint">
                Keluhan
              </label>
              <Textarea
                id="complaint"
                placeholder="Tulis keluhan utama pasien..."
                value={form.complaint}
                onChange={(event) => setForm({ ...form, complaint: event.target.value })}
              />
              <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
                <span>Minimal 10 karakter.</span>
                <span>{form.complaint.trim().length}/10</span>
              </div>
              <FieldWarning>{formErrors.complaint}</FieldWarning>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-950" htmlFor="diagnosisId">
                Diagnosis
              </label>
              <SearchableSelect
                id="diagnosisId"
                value={form.diagnosisId}
                options={diagnoses}
                debounceMs={1000}
                showOptionsWhenEmpty={false}
                idleText=""
                placeholder="Cari nama atau kode diagnosis..."
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => option.name}
                getOptionDescription={(option) => option.code}
                onChange={(diagnosisId) => setForm((current) => ({ ...current, diagnosisId }))}
              />
              <FieldWarning>{formErrors.diagnosisId}</FieldWarning>
            </div>

            <MotionSection className="min-w-0 space-y-3 rounded-md border border-primary-100 p-3 sm:p-4">
              <div>
                <h3 className="text-sm font-medium text-slate-950">Biaya & Tindakan</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">Pilih tindakan yang diberikan pada sesi konsultasi.</p>
                <FieldWarning>{formErrors.treatmentIds}</FieldWarning>
              </div>
              <SearchableSelect
                label="Cari biaya atau tindakan"
                value={form.treatmentIds}
                options={treatments}
                multiple
                debounceMs={1000}
                showOptionsWhenEmpty={false}
                idleText=""
                placeholder="Cari nama tindakan..."
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => option.name}
                getOptionDescription={(option) => `Rp ${option.price.toLocaleString("id-ID")}`}
                onChange={toggleTreatment}
              />
              <div className="space-y-2">
                {treatments.filter((item) => form.treatmentIds.includes(item.id)).map((item) => (
                  <label key={item.id} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked onChange={() => toggleTreatment(item.id)} className="size-4 accent-primary-600" />
                    <span>{item.name} - Rp {item.price.toLocaleString("id-ID")}</span>
                  </label>
                ))}
              </div>
            </MotionSection>

            <MotionSection className="min-w-0 space-y-3 rounded-md border border-primary-100 p-3 sm:p-4">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-950">Obat</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Tambahkan obat hanya jika pasien mendapat resep.</p>
                  <FieldWarning>{formErrors.medicines}</FieldWarning>
                </div>
                <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={addMedicine}>Tambah Obat</Button>
              </div>
              {selectedMedicines.map((item, index) => (
                <MotionItem key={item.rowId} index={index} className="grid min-w-0 gap-3 rounded-md border border-slate-200 bg-slate-50/60 p-3 dark:border-[#35585e] dark:bg-[#101a1d]">
                  <div className="min-w-0">
                    <div className="min-w-0">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor={`medicine-${index}`}>
                        Pilih obat
                      </label>
                      <SearchableSelect
                        id={`medicine-${index}`}
                        value={item.medicineId}
                        options={medicines}
                        debounceMs={1000}
                        showOptionsWhenEmpty={false}
                        idleText=""
                        placeholder="Cari nama obat..."
                        inputActions={
                          <>
                            <Input
                              className="w-16 shrink-0 px-2 sm:w-20"
                              aria-label={`Kuantitas obat ${index + 1}`}
                              title="Kuantitas"
                              min="1"
                              type="number"
                              value={item.quantity}
                              onChange={(event) => {
                                const quantity = Number(event.target.value) || 1;
                                setSelectedMedicines((current) => current.map((row) =>
                                  row.rowId === item.rowId ? { ...row, quantity } : row
                                ));
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              className="size-9 shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                              title="Hapus obat dari resep"
                              aria-label={`Hapus obat ${index + 1} dari resep`}
                              onClick={() => removeMedicine(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        }
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.name}
                        getOptionDescription={(option) => `Stok ${option.stock}`}
                        onChange={(medicineId) => {
                          setSelectedMedicines((current) => current.map((row) =>
                            row.rowId === item.rowId ? { ...row, medicineId } : row
                          ));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor={`medicine-instructions-${index}`}>
                        Catatan aturan pakai
                      </label>
                      <span className="text-xs tabular-nums text-slate-400">{item.instructions.length}/200</span>
                    </div>
                    <Textarea
                      className="min-h-20"
                      id={`medicine-instructions-${index}`}
                      maxLength={200}
                      placeholder="Contoh: 3x1 sesudah makan, habiskan"
                      value={item.instructions}
                      onChange={(event) => {
                        const copy = [...selectedMedicines];
                        copy[index] = { ...copy[index], instructions: event.target.value };
                        setSelectedMedicines(copy);
                      }}
                    />
                  </div>
                </MotionItem>
              ))}
            </MotionSection>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-950" htmlFor="notes">
                Catatan
              </label>
              <Textarea
                id="notes"
                placeholder="Tulis catatan pemeriksaan, instruksi, atau observasi..."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
              <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
                <span>Minimal 10 karakter.</span>
                <span>{form.notes.trim().length}/10</span>
              </div>
              <FieldWarning>{formErrors.notes}</FieldWarning>
            </div>

            <div className="flex justify-end">
              <Button disabled={!isFormValid}>Selesaikan Konsultasi</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageMotion>
  );
}
