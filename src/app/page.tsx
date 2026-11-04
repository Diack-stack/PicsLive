import React from "react";
import Link from "next/link";
import { Camera, Smartphone, ShieldCheck, ArrowRight, Sliders, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-night text-chalk flex flex-col justify-between relative overflow-x-hidden antialiased selection:bg-gold selection:text-night">
      {/* Auras atmosphériques or & bleu saphir sombre */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-gold/15 via-blue-900/15 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 -right-20 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* NAVIGATION HEADER */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-surfaceLight to-abyss border border-gold/30 flex items-center justify-center text-gold shadow-lg group-hover:border-gold/60 transition">
            <Camera className="w-5 h-5 text-gold" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Pics<span className="text-gold">Live</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
              by CreatifPics
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-gold/20 shadow-sm text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Version 2.1 Studio</span>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full bg-surface hover:bg-surfaceLight border border-gold/30 text-xs font-semibold text-gold transition shadow-sm"
          >
            Régie Opérateur
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-6 pt-6 pb-16 flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
        {/* BADGE PILULE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/90 border border-gold/25 shadow-sm text-slate-300 text-xs font-semibold mb-6">
          <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
            Live
          </span>
          Reconnaissance faciale instantanée pour événements
        </div>

        {/* TITRE ÉDITORIAL */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          Vos photos d&apos;événement,<br />
          retrouvées en{" "}
          <span className="font-serif italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F5D77F] via-gold to-goldMuted">
            un regard.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed font-normal">
          Une borne tactile raffinée, un selfie instantané et vos clichés haute résolution sont livrés sur votre smartphone en direct.
        </p>

        {/* BOUTONS D'ACTION */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-16 w-full sm:w-auto">
          <Link
            href="/borne"
            className="btn-gold w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2.5"
          >
            <span>Lancer la Borne Invité</span>
            <ArrowRight className="w-4 h-4 text-night" strokeWidth={2.5} />
          </Link>
          <Link
            href="/galerie/pl_demo_token_8a9b7c"
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-surface/80 hover:bg-surfaceLight text-slate-200 border border-gold/25 font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition"
          >
            <span>Voir la Galerie Démo</span>
          </Link>
        </div>

        {/* COMPOSITION EN ÉVENTAIL 3D (PHOTOSTACK) */}
        <div className="relative w-full max-w-3xl h-64 sm:h-76 flex items-center justify-center mb-16">
          {/* Carte Arrière Gauche : Superviseur */}
          <div className="absolute w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 transform -rotate-12 -translate-x-32 sm:-translate-x-44 translate-y-3 transition-transform duration-500 hover:-translate-y-1">
            <img
              src="/uploads/photo_1793814422_105.jpg"
              alt="Superviseur"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white tracking-wide">
              Superviseur
            </span>
          </div>

          {/* Carte Arrière Droite : Jack Photoshoot */}
          <div className="absolute w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 transform rotate-12 translate-x-32 sm:translate-x-44 translate-y-3 transition-transform duration-500 hover:-translate-y-1">
            <img
              src="/uploads/photo_1793814420_156.JPG"
              alt="Gala CreatifPics"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white tracking-wide">
              Gala CreatifPics
            </span>
          </div>

          {/* Carte Centrale En Vedette : Jack (Costume, lunettes, chemise blanche) */}
          <div className="absolute w-48 sm:w-60 h-60 sm:h-72 rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-2 border-gold/50 transform hover:scale-105 transition-all duration-300 z-10">
            <img
              src="/uploads/photo_1793814421_653.JPG"
              alt="Jack"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" />
            <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-night/85 backdrop-blur-md border border-gold/40 text-[10px] font-extrabold text-gold shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Reconnu 98.8%
            </div>
            <div className="absolute bottom-4 left-4 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Jack</span>
              <p className="text-xs font-semibold text-white">4 photos livrées en direct</p>
            </div>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left max-w-5xl">
          <div className="luxury-card luxury-card-hover p-7 rounded-[28px]">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold mb-5">
              <Camera className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Borne Kiosk Tactile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Viseur dynamique avec autofocus simulé. Moins de 30 secondes pour retrouver toutes ses photos.
            </p>
          </div>

          <div className="luxury-card luxury-card-hover p-7 rounded-[28px]">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-5">
              <Smartphone className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Galerie Mobile Live</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accès immédiat par QR Code personnel. Vos clichés s&apos;ajoutent en temps réel pendant la réception.
            </p>
          </div>

          <div className="luxury-card luxury-card-hover p-7 rounded-[28px]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Conformité CDP & Sécurité</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conforme à la législation CDP Sénégal (Loi 2008-12). Consentements horodatés et purge automatique.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>PicsLive, by CreatifPics Studio · Dakar, Sénégal</p>
        <div className="flex items-center gap-6">
          <Link href="/borne" className="hover:text-slate-300 transition">
            Borne Kiosk
          </Link>
          <Link href="/admin" className="hover:text-slate-300 transition">
            Console Régie
          </Link>
          <Link href="/galerie/pl_demo_token_8a9b7c" className="hover:text-slate-300 transition">
            Galerie Démo
          </Link>
        </div>
      </footer>
    </div>
  );
}
