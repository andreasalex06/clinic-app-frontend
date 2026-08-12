import { useState } from "react";
import { Moon, Stethoscope, Sun } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { MotionSection } from "../components/ui/Motion";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@clinic.test");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isDarkMode = theme === "dark";
  const themeToggleButtonClass = isDarkMode
    ? "border-slate-200 bg-white text-slate-950 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 dark:!border-slate-200 dark:!bg-white dark:!text-slate-950 dark:hover:!border-primary-300 dark:hover:!bg-primary-50 dark:hover:!text-primary-800"
    : "border-slate-900 bg-slate-950 text-white hover:border-primary-700 hover:bg-primary-950 hover:text-white";

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="clinic-page-bg relative grid min-h-screen place-items-center px-4">
      <Button
        variant="outline"
        className={`absolute right-4 top-4 size-10 px-0 ${themeToggleButtonClass}`}
        aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        onClick={toggleTheme}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
      <MotionSection className="w-full max-w-md">
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-md bg-primary-600 text-white">
              <Stethoscope size={23} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-950">ClinicApp</h1>
              <p className="text-sm text-slate-500">Manajemen Rawat Jalan</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Kata sandi</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button className="w-full" disabled={loading}>
              {loading ? "Masuk..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </MotionSection>
    </main>
  );
}
