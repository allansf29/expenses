import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Target,
  Lightbulb,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const navItems: { name: string; href: string; icon: IconType }[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Análises", href: "/analysis", icon: BarChart3 },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Estratégia e Metas", href: "/insights", icon: Lightbulb },
];

const SIDEBAR_WIDTH_PX = 256;

const classNames = (...args: Array<string | false | null | undefined>) =>
  args.filter(Boolean).join(" ");

export default function Sidebar(): React.ReactElement {
  const [open, setOpen] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [active, setActive] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActive(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setOpen(desktop);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (href: string) => {
    setActive(href);
    navigate(href);
    if (!isDesktop) setOpen(false);
  };
  
  const handleLogout = () => {
    const confirmar = window.confirm("Tem certeza que deseja sair?");
    if (confirmar) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-[100]">
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="w-11 h-11 rounded-xl bg-background/90 backdrop-blur-md border border-border flex items-center justify-center shadow-lg text-foreground transition-colors hover:border-primary/50"
        >
          <AnimatePresence initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {!isDesktop && open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        role="navigation"
        aria-label="Navegação Principal"
        initial={{ x: isDesktop ? 0 : -SIDEBAR_WIDTH_PX }}
        animate={{ x: open ? 0 : -SIDEBAR_WIDTH_PX }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-64 z-50 shadow-xl lg:shadow-md"
        style={{ pointerEvents: open || isDesktop ? "auto" : "none" }}
      >
        <div className="h-full bg-card border-r border-border p-4 flex flex-col">
          <div className="flex items-center gap-3 pt-2 pb-6 border-b border-border/70 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30">
              $F
            </div>
            <div>
              <div className="text-xl text-foreground font-extrabold tracking-tight">
                Finan<span className="text-primary">App</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Painel de Controle
              </div>
            </div>
          </div>

          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.href || (item.href !== "/" && active.startsWith(item.href));

                return (
                  <li key={item.href} className="relative">
                    <motion.button
                      onClick={() => handleNavigation(item.href)}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={classNames(
                        "group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="w-6 h-6 flex items-center justify-center transition-colors duration-200">
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className={classNames("text-sm transition-colors duration-200", isActive ? "font-semibold" : "font-medium")}>
                        {item.name}
                      </span>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto pt-4 border-t border-border/70">
            <motion.button
              type="button"
              onClick={handleLogout}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition cursor-pointer"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Sair</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}