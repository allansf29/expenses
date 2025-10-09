import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Target,
  Settings,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const navItems: { name: string; href: string; icon: IconType }[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Análises", href: "/analysis", icon: BarChart3 },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Configurações", href: "/configs", icon: Settings },
];

const SIDEBAR_WIDTH_PX = 256; 

export default function Sidebar(): React.ReactElement {
  const [open, setOpen] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActive(window.location.pathname + window.location.hash);
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

  const classNames = (...args: Array<string | false | null | undefined>) =>
    args.filter(Boolean).join(" ");

  return (
    <>
      {/* Botão hamburguer / fechar - mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          // Usando cores do tema: bg-card, border-border, text-foreground
          className="w-11 h-11 rounded-lg bg-card border border-border flex items-center justify-center shadow-md text-foreground transition-colors"
        >
          <AnimatePresence initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Overlay mobile */}
      <AnimatePresence>
        {!isDesktop && open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        role="navigation"
        aria-label="Sidebar"
        initial={{ x: isDesktop ? 0 : -SIDEBAR_WIDTH_PX }}
        animate={{ x: open ? 0 : -SIDEBAR_WIDTH_PX }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-64 z-50 shadow-2xl"
        style={{ pointerEvents: open || isDesktop ? "auto" : "none" }}
      >
        {/* Usando bg-card e border-r do shadcn */}
        <div className="h-full bg-card border-r border-border p-5 flex flex-col">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            {/* Logo usando primary/secondary para tema */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
              $$
            </div>
            <div>
              <div className="text-xl text-foreground font-bold">Financeiro</div>
              <div className="text-xs text-muted-foreground">App • v1.0</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1">
            <ul className="space-y-2 relative">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  active === item.href ||
                  (item.href !== "/" && active.startsWith(item.href));

                return (
                  <li key={item.href} className="relative">
                    {/* Indicador ativo animado (barra esquerda) */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-primary shadow-lg shadow-primary/50"
                      />
                    )}

                    <motion.a
                      href={item.href}
                      onClick={() => {
                        setActive(item.href);
                        if (!isDesktop) setOpen(false);
                      }}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.985 }}
                      className={classNames(
                        "group relative flex items-center gap-3 w-full px-3 py-2 pl-4 rounded-lg transition-all",
                        // Item ativo: bg-primary/10, texto-primary
                        isActive
                          ? "text-primary bg-primary/10 font-semibold"
                          // Item inativo: text-muted-foreground, hover mais discreto
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={classNames(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                          isActive ? "bg-primary/20" : "bg-transparent"
                        )}
                      >
                        {/* Ícone usa primary ou current cor de texto */}
                        <Icon
                          className={classNames(
                            "w-5 h-5",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                      </div>

                      <span className="text-sm font-medium">{item.name}</span>
                      
                      {item.name === "Calendário" && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 font-medium">
                          New
                        </span>
                      )}
                    </motion.a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/profile";
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Logout (aqui põe tua lógica)");
              }}
              className="mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}