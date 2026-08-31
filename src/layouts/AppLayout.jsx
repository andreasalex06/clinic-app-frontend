import { useState } from "react";
import { CalendarCheck, ChevronsLeft, ChevronsRight, FileText, Home, LineChart, LogOut, Menu, Moon, Pill, QrCode, Stethoscope, Sun, Users, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/patients", label: "Pasien", icon: Users },
  { to: "/registration", label: "Registrasi", icon: CalendarCheck },
  { to: "/qr", label: "QR Pasien", icon: QrCode },
  { to: "/queue", label: "Antrean", icon: Stethoscope },
  { to: "/pharmacy", label: "Farmasi", icon: Pill },
  { to: "/finance", label: "Finance", icon: LineChart },
  { to: "/invoice", label: "Tagihan", icon: FileText }
];

const logoutButtonClass =
  "hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:!border-red-500 dark:hover:!bg-red-950 dark:hover:!text-red-200";

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isDarkMode = theme === "dark";
  const themeToggleButtonClass = isDarkMode
    ? "border-slate-200 bg-white text-slate-950 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 dark:!border-slate-200 dark:!bg-white dark:!text-slate-950 dark:hover:!border-primary-300 dark:hover:!bg-primary-50 dark:hover:!text-primary-800"
    : "border-slate-900 bg-slate-950 text-white hover:border-primary-700 hover:bg-primary-950 hover:text-white";
  const sidebarPanelColor = isDarkMode ? "#82d8cf" : "#ffffff";
  const sidebarThemeToggleButtonClass = isDarkMode
    ? "!border-[#145b5a] !bg-white !text-[#071113] shadow-sm shadow-primary-950/10 hover:!border-[#249d8f] hover:!bg-[#ecfffd] hover:!text-[#0b2324]"
    : "!border-slate-900 !bg-slate-950 !text-white shadow-sm shadow-primary-950/10 hover:!border-primary-700 hover:!bg-primary-950 hover:!text-white";
  const sidebarLogoutButtonClass =
    "!border-red-200 !bg-white !text-red-700 shadow-sm shadow-primary-950/5 hover:!border-red-600 hover:!bg-red-600 hover:!text-white";

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  }

  return (
    <div className="clinic-page-bg min-h-screen min-w-0 overflow-x-hidden">
      <motion.aside
        animate={shouldReduceMotion ? undefined : { width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden flex-col overflow-hidden border-r border-primary-700 bg-primary-700 dark:border-[#35585e] dark:bg-[#0b2324] lg:flex",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b border-white/15 dark:border-[#4a7378]", isSidebarCollapsed ? "justify-center px-3" : "gap-2 px-3")}>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "size-9 shrink-0 px-0 text-primary-50/90 hover:bg-white/15 hover:text-white dark:text-[#d8fbf7] dark:hover:bg-[#0d3435] dark:hover:text-white",
              isSidebarCollapsed && "mx-auto"
            )}
            title={isSidebarCollapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
            aria-label={isSidebarCollapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
          >
            {isSidebarCollapsed ? <ChevronsRight className="size-5" /> : <ChevronsLeft className="size-5" />}
          </Button>
          <AnimatePresence initial={false}>
            {!isSidebarCollapsed && (
            <motion.div
              className="flex min-w-0 items-center gap-2"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-primary-700 dark:bg-[#48d6c9] dark:text-[#071113]">
                <Stethoscope className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Sarana Medika</p>
                <p className="truncate text-xs text-primary-50/80 dark:text-[#a7eee5]">Manajemen Klinik</p>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav aria-label="Navigasi utama" className={cn("min-h-0 flex-1 space-y-1 overflow-y-auto p-3", isSidebarCollapsed && "px-3")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center rounded-md text-sm font-medium leading-5",
                  isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3",
                  isActive
                    ? "bg-white text-primary-800 shadow-sm shadow-primary-950/10 dark:!bg-white dark:!text-[#071113]"
                    : "text-primary-50/85 hover:bg-white/15 hover:text-white dark:text-[#d8fbf7] dark:hover:bg-[#0d3435] dark:hover:text-white"
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              <AnimatePresence initial={false}>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, x: -6 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>
        <div
          className={cn(
            "shrink-0 border-t border-primary-100 py-4 dark:border-[#35585e]",
            isSidebarCollapsed ? "px-3" : "px-4"
          )}
          style={{ backgroundColor: sidebarPanelColor }}
        >
          <div className="relative space-y-3">
          <div className={cn(isSidebarCollapsed && "grid place-items-center")}>
            {isSidebarCollapsed ? (
              <div className="grid h-10 w-full place-items-center rounded-md bg-primary-700 text-sm font-semibold text-white dark:bg-[#071113]" title={`${user?.name ?? "User"} - ${user?.role ?? ""}`}>
                {user?.name?.charAt(0) ?? "U"}
              </div>
            ) : (
              <>
                <p className="truncate text-sm font-medium text-slate-900 dark:!text-[#071113]" title={user?.name}>{user?.name}</p>
                <p className="text-xs font-medium text-slate-500 dark:!text-[#145b5a]">{user?.role}</p>
              </>
            )}
          </div>
          <Button
            variant="outline"
            className={cn("h-10 w-full", isSidebarCollapsed && "justify-center px-0", sidebarThemeToggleButtonClass)}
            title={isDarkMode ? "Mode terang" : "Mode gelap"}
            aria-label={isDarkMode ? "Mode terang" : "Mode gelap"}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="size-5 shrink-0" /> : <Moon className="size-5 shrink-0" />}
            {!isSidebarCollapsed && (isDarkMode ? "Mode terang" : "Mode gelap")}
          </Button>
          <Button
            variant="outline"
            className={cn("h-10 w-full", isSidebarCollapsed && "justify-center px-0", sidebarLogoutButtonClass)}
            title="Keluar"
            aria-label="Keluar"
            onClick={handleLogout}
          >
            <LogOut className="size-5 shrink-0" />
            {!isSidebarCollapsed && "Keluar"}
          </Button>
          </div>
        </div>
      </motion.aside>

      <main className={cn("min-w-0 max-w-full overflow-x-hidden transition-[padding-left] duration-200", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <div className="sticky top-0 z-10 max-w-full border-b border-primary-100 bg-white/90 px-3 py-3 backdrop-blur dark:border-[#35585e] dark:bg-[#0e191c]/95 sm:px-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-primary-600 text-white">
                <Stethoscope size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">ClinicApp</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="size-9 px-0"
              aria-label={isMobileMenuOpen ? "Tutup navigasi" : "Buka navigasi"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.button
                key="mobile-menu-overlay"
                type="button"
                className="fixed inset-0 top-[65px] z-10 cursor-default bg-transparent"
                aria-label="Tutup menu navigasi"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-menu-panel"
                className="absolute left-3 right-3 top-[calc(100%+8px)] z-20 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-lg border border-primary-100 bg-white p-2 shadow-lg shadow-primary-950/10 dark:border-[#35585e] dark:bg-[#101a1d] dark:shadow-black/40 sm:left-4 sm:right-4"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -10, scale: 0.98 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <nav className="grid gap-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600",
                          isActive
                            ? "bg-primary-50 text-primary-700 dark:!bg-white dark:!text-[#071113]"
                            : "dark:text-slate-300 dark:hover:bg-[#0d3435] dark:hover:text-white"
                        )
                      }
                    >
                      <item.icon size={17} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-2 space-y-2 border-t border-slate-100 pt-2 dark:border-[#35585e]">
                  <Button variant="outline" className={cn("h-11 w-full px-3", themeToggleButtonClass)} onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
                    {isDarkMode ? "Mode terang" : "Mode gelap"}
                  </Button>
                  <Button variant="outline" className={cn("h-11 w-full justify-start px-3", logoutButtonClass)} onClick={handleLogout}>
                    <LogOut size={17} />
                    Keluar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mx-auto min-w-0 w-full max-w-[1440px] px-3 py-4 sm:p-5 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
