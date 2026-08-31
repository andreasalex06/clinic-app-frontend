import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { MotionSection, PageMotion } from "../components/ui/Motion";
import { SearchableSelect } from "../components/ui/SearchableSelect";

export function RegistrationPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");

  useEffect(() => {
    async function loadOptions() {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        api.get("/patients"),
        api.get("/doctors")
      ]);
      setPatients(patientsResponse.data.data);
      setDoctors(doctorsResponse.data.data);
    }

    void loadOptions();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/visits", { patientId, doctorId });
    navigate("/queue");
  }

  return (
    <PageMotion className="w-full">
      <Card>
        <CardHeader>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="page-title">Registrasi Baru</h1>
              <p className="text-sm text-slate-500">Pilih pasien terdaftar dan masukkan ke antrean hari ini.</p>
            </div>
            <Button className="w-full sm:w-auto" onClick={() => navigate("/patients?redirect=registration")}>
              Tambah Pasien Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="min-w-0 space-y-4" onSubmit={handleSubmit}>
            <MotionSection className="grid min-w-0 gap-4 lg:grid-cols-2">
              <SearchableSelect
                label="Pasien"
                value={patientId}
                options={patients}
                onChange={setPatientId}
                getOptionValue={(patient) => patient.id}
                getOptionLabel={(patient) => patient.name}
                getOptionDescription={(patient) => `${patient.phone} - ${patient.address}`}
                placeholder="Cari pasien berdasarkan nama atau telepon..."
                emptyText="Tidak ada pasien yang cocok."
                idleText="Ketik nama atau nomor telepon pasien untuk mencari."
                showOptionsWhenEmpty={false}
              />
              <SearchableSelect
                label="Dokter"
                value={doctorId}
                options={doctors}
                onChange={setDoctorId}
                getOptionValue={(doctor) => doctor.id}
                getOptionLabel={(doctor) => doctor.name}
                getOptionDescription={(doctor) => doctor.specialization}
                placeholder="Cari dokter berdasarkan nama atau spesialisasi..."
                emptyText="Tidak ada dokter yang cocok."
              />
            </MotionSection>
            <Button className="w-full sm:w-auto" disabled={!patientId || !doctorId}>Check-in & Masuk Antrean</Button>
          </form>
        </CardContent>
      </Card>
    </PageMotion>
  );
}
