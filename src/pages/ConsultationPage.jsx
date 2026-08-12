import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { MotionItem, MotionSection, PageMotion } from "../components/ui/Motion";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";

function formatVisitStatus(status) {
  const labels = {
    WAITING: "Menunggu",
    IN_CONSULTATION: "Dalam konsultasi",
    COMPLETED: "Selesai"
  };

  return labels[status] ?? status;
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
      setForm((current) => ({
        ...current,
        diagnosisId: diagnosesResponse.data.data[0]?.id ?? "",
        treatmentIds: treatmentsResponse.data.data[0]?.id ? [treatmentsResponse.data.data[0].id] : []
      }));
    }

    void loadData();
  }, [visitId]);

  function addMedicine() {
    const medicineId = medicines[0]?.id;
    if (!medicineId) return;
    setSelectedMedicines([...selectedMedicines, { medicineId, quantity: 1 }]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await api.post("/consultations", {
      visitId,
      ...form,
      medicines: selectedMedicines
    });

    navigate(`/invoice/${visitId}`);
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
    <PageMotion className="grid items-start gap-5 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:gap-6">
      <Card className="self-start">
        <CardHeader>
          <h1 className="break-words text-lg font-semibold text-slate-950">{visit?.patient.name ?? "Konsultasi"}</h1>
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
          <h2 className="font-semibold text-slate-950">Form Konsultasi</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Textarea placeholder="Keluhan" value={form.complaint} onChange={(event) => setForm({ ...form, complaint: event.target.value })} />
            <Select value={form.diagnosisId} onChange={(event) => setForm({ ...form, diagnosisId: event.target.value })}>
              {diagnoses.map((diagnosis) => (
                <option key={diagnosis.id} value={diagnosis.id}>
                  {diagnosis.name} ({diagnosis.code})
                </option>
              ))}
            </Select>
            <MotionSection className="min-w-0 space-y-3 rounded-md border border-primary-100 p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-slate-950">Biaya & Tindakan</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {treatments.map((treatment) => {
                  const isSelected = form.treatmentIds.includes(treatment.id);

                  return (
                    <MotionItem
                      as="label"
                      index={treatments.indexOf(treatment)}
                      key={treatment.id}
                      className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 text-primary-900 dark:border-[#48d6c9] dark:bg-[#0d3435] dark:text-primary-50"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50/60 dark:border-[#4a7378] dark:bg-[#101a1d] dark:text-slate-300 dark:hover:border-[#48d6c9] dark:hover:bg-[#0d3435]"
                      }`}
                    >
                      <input
                        checked={isSelected}
                        className="mt-1 size-4 accent-primary-600"
                        onChange={() => toggleTreatment(treatment.id)}
                        type="checkbox"
                      />
                      <span className="min-w-0">
                        <span className="block break-words font-medium">{treatment.name}</span>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                          Rp {treatment.price.toLocaleString("id-ID")}
                        </span>
                      </span>
                    </MotionItem>
                  );
                })}
              </div>
            </MotionSection>

            <MotionSection className="min-w-0 space-y-3 rounded-md border border-primary-100 p-3 sm:p-4">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-950">Obat</h3>
                <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={addMedicine}>Tambah Obat</Button>
              </div>
              {selectedMedicines.map((item, index) => (
                <MotionItem key={index} index={index} className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <Select
                    value={item.medicineId}
                    onChange={(event) => {
                      const copy = [...selectedMedicines];
                      copy[index] = { ...copy[index], medicineId: event.target.value };
                      setSelectedMedicines(copy);
                    }}
                  >
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} - stok {medicine.stock}
                      </option>
                    ))}
                  </Select>
                  <Input
                    min="1"
                    placeholder="Jumlah"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => {
                      const copy = [...selectedMedicines];
                      copy[index] = { ...copy[index], quantity: Number(event.target.value) || 1 };
                      setSelectedMedicines(copy);
                    }}
                  />
                </MotionItem>
              ))}
            </MotionSection>

            <Textarea placeholder="Catatan" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <Button className="w-full sm:w-auto" disabled={!form.complaint || !form.diagnosisId || form.treatmentIds.length === 0}>Selesaikan Konsultasi</Button>
          </form>
        </CardContent>
      </Card>
    </PageMotion>
  );
}
