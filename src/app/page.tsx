import React from "react";
import Link from "next/link";
import {
  Scan,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sliders,
  Camera,
  CheckCircle2,
  Database,
  Cpu,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B192C] text-[#FDFBF7] flex flex-col selection:bg-[#C08A3E] selection:text-[#0B192C] relative overflow-hidden">
      {/* Halos de lumière signature PicsLive */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C08A3E]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#1E3E62]/40 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C08A3E] to-[#8F6428] flex items-center justify-center shadow-glow">
            <Scan className="w-6 h-6 text-[#0B192C]" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider uppercase text-[#FDFBF7]">
              Pics<span className="text-[#C08A3E]">Live</span>
            </span>
            <span className="block text-[11px] text-[#94A3B8] tracking-widest uppercase font-medium">
              by CreatifPics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#132F4C] border border-[#C08A3E]/30 text-xs text-[#C08A3E] font-medium">
            MVP v2.1 Ready
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col justify-center items-center text-center z-10 w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132F4C] border border-[#C08A3E]/30 text-[#C08A3E] text-xs sm:text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Système de reconnaissance faciale en temps réel pour événements
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          L&apos;élégance de la photo, la précision du{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08A3E] via-[#D4AF37] to-[#C08A3E]">
            temps réel.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mb-12 leading-relaxed">
          PicsLive retrouve et livre automatiquement à chaque invité ses photos par reconnaissance faciale.
          Testez le parcours complet de bout en bout dès maintenant.
        </p>

        {/* 3 CARTES D'ACCÈS RAPIDE MVP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left max-w-5xl mb-16">
          {/* CARTE 1 : BORNE KIOSK */}
          <Link
            href="/borne"
            className="group glass-panel glass-panel-hover p-8 rounded-3xl border border-[#C08A3E]/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C08A3E]/20 border border-[#C08A3E]/40 flex items-center justify-center text-[#C08A3E] mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C08A3E] text-[#0B192C] mb-2">
                Interface Borne iPad
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#FDFBF7]">Borne Invité (Kiosk)</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
                Capture de selfie par webcam, reconnaissance biométrique instantanée, et génération du QR Code personnel.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#C08A3E] group-hover:translate-x-1 transition-transform">
              <span>Lancer la Borne</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* CARTE 2 : CONSOLE RÉGIE / ADMIN */}
          <Link
            href="/admin"
            className="group glass-panel glass-panel-hover p-8 rounded-3xl border border-[#1E3E62] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#1E3E62] border border-[#C08A3E]/30 flex items-center justify-center text-[#C08A3E] mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#132F4C] text-[#C08A3E] border border-[#C08A3E]/30 mb-2">
                Opérateur / Régie
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#FDFBF7]">Console Régie</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
                Ajoutez des photos de test, visualisez les visages indexés et suivez les statistiques en temps réel.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#C08A3E] group-hover:translate-x-1 transition-transform">
              <span>Ouvrir la Console</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* CARTE 3 : ARCHITECTURE & MOODBOARD */}
          <div className="glass-panel p-8 rounded-3xl border border-[#1E3E62] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/20 text-[#10B981] mb-2">
                Socle Technique
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#FDFBF7]">Architecture MVP</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
                Base locale JSON persistante, simulateur biométrique modulaire interchangeable avec AWS Rekognition.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Zéro dépendance cloud requise</span>
            </div>
          </div>
        </div>

        {/* PILLIERS PICS LIVE */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C08A3E]" />
            Conforme CDP Sénégal & RGPD
          </span>
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#C08A3E]" />
            QR Code & WhatsApp E.164
          </span>
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C08A3E]" />
            Prêt pour Supabase & AWS
          </span>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 text-xs text-[#94A3B8]/60 border-t border-[#1E3E62]/40 z-10">
        PicsLive, by CreatifPics · Système de reconnaissance faciale événementielle · Dakar, Sénégal
      </footer>
    </div>
  );
}

