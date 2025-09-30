// src/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Target,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const navItems: { name: string; href: string; icon: IconType }[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Análises", href: "/analysis", icon: BarChart3 },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Configurações", href: "/configs", icon: Settings },
];

const SIDEBAR_WIDTH_PX = 256; // corresponde a w-64

export default function Sidebar(): React.ReactElement {
  // aberto por padrão em desktop, fechado em mobile
  const [open, setOpen] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    // set active com base na rota atual (simples)
    if (typeof window !== "undefined") {
      setActive(window.location.pathname + window.location.hash);
    }
  }, []);

  useEffect(() => {
    // ajusta quando redimensionar: abre no desktop sempre, fecha no mobile
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setOpen(desktop); // força aberto em desktop, fechado em mobile
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // helper simples
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
          className="w-11 h-11 rounded-lg bg-gradient-to-b from-white/6 to-white/2 border border-white/6 flex items-center justify-center shadow-sm text-white backdrop-blur-sm"
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
        className="fixed top-0 left-0 h-screen w-64 z-50"
        style={{ pointerEvents: open || isDesktop ? "auto" : "none" }}
      >
        <div className="h-full bg-[#161B22] border-r border-gray-800 p-5 flex flex-col">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-sm">
              $$
            </div>
            <div>
              <div className="text-white font-semibold">Meu Painel</div>
              <div className="text-xs text-gray-400">Finance • v1.0</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1">
            <ul className="space-y-2 relative">
              {navItems.map((item) => {
                const Icon = item.icon;
                // considera active se o pathname começar com href (tratando seções)
                const isActive =
                  active === item.href ||
                  (item.href !== "/" && active.startsWith(item.href));

                return (
                  <li key={item.href} className="relative">
                    {/* indicador ativo animado (barra esquerda) */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-0 h-full w-1 rounded-r-md"
                        style={{
                          background:
                            "linear-gradient(180deg,#60a5fa,#8b5cf6)", // azul -> violeta
                        }}
                      />
                    )}

                    <motion.a
                      href={item.href}
                      onClick={() => {
                        // atualiza active localmente (navegação vai mudar a rota logo em seguida)
                        setActive(item.href);
                        if (!isDesktop) setOpen(false); // fecha no mobile após clicar
                      }}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.985 }}
                      className={classNames(
                        "group relative flex items-center gap-3 w-full px-3 py-2 pl-[1.1rem] rounded-md transition-all",
                        isActive
                          ? "text-white bg-white/2"
                          : "text-gray-300 hover:text-white hover:bg-white/3"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={classNames(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          isActive ? "bg-white/6" : "bg-transparent"
                        )}
                      >
                        <Icon
                          className={classNames(
                            "w-5 h-5",
                            isActive ? "text-blue-400" : "text-gray-300"
                          )}
                        />
                      </div>

                      <span className="text-sm font-medium">{item.name}</span>
                      {/* mini badge no final (exemplo) */}
                      {item.name === "Calendário" && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                          novo
                        </span>
                      )}
                    </motion.a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => {
                // exemplo de ação: abrir página de perfil/settings
                window.location.href = "/profile";
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-white/3 transition"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-transparent">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-sm">Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                // placeholder de logout
                alert("Logout (aqui põe tua lógica)");
              }}
              className="mt-3 w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-red-500/8 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
