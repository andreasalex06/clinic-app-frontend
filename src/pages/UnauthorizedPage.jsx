import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { MotionSection } from "../components/ui/Motion";
import { useThemeStore } from "../stores/themeStore";

export function UnauthorizedPage() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDarkMode = theme === "dark";
  const themeToggleButtonClass = isDarkMode
    ? "border-slate-200 bg-white text-slate-950 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 dark:!border-slate-200 dark:!bg-white dark:!text-slate-950 dark:hover:!border-primary-300 dark:hover:!bg-primary-50 dark:hover:!text-primary-800"
    : "border-slate-900 bg-slate-950 text-white hover:border-primary-700 hover:bg-primary-950 hover:text-white";

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
      <MotionSection className="max-w-md">
      <Card>
        <CardContent className="space-y-4 text-center">
          <h1 className="page-title">Akses Ditolak</h1>
          <p className="text-sm text-slate-500">Peran akun ini tidak punya akses ke halaman tersebut.</p>
          <Link to="/dashboard">
            <Button>Kembali ke dashboard</Button>
          </Link>
        </CardContent>
      </Card>
      </MotionSection>
    </main>
  );
}
