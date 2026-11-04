"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, Camera, EyeOff, Share2 } from "lucide-react";

export default function GaleriePage() {
  const params = useParams();
  const token = params?.token as string;

  const [galleryData, setGalleryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/gallery/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGalleryData(data.gallery);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const shareWhatsApp = () => {
    const txt = `Retrouve mes photos de ${galleryData?.evenementNom || "l'événement"} sur PicsLive : ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const removePhoto = async (lienId: string) => {
    setRemovedIds((prev) => [...prev, lienId]);
    await fetch(`/api/gallery/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_photo", lienId }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin mb-4" />
        <p className="text-slate-400 text-xs">Chargement de votre collection...</p>
      </div>
    );
  }

  const activePhotos = (galleryData?.photos || []).filter(
    (p: any) => !removedIds.includes(p.lienId)
  );

  return (
    <div className="min-h-screen bg-night text-chalk flex flex-col justify-between antialiased selection:bg-gold selection:text-night relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-night/85 backdrop-blur-md border-b border-white/5 px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface border border-gold/30 flex items-center justify-center text-gold">
              <Camera className="w-4 h-4 text-gold" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              Pics<span className="text-gold">Live</span>
            </span>
          </div>

          <button
            onClick={shareWhatsApp}
            className="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partager</span>
          </button>
        </div>
      </header>

      {/* BANNIÈRE DE COLLECTION */}
      <section className="px-5 pt-6 pb-4 max-w-2xl mx-auto w-full">
        <div className="luxury-card p-6 rounded-[32px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 text-[11px] font-bold">
              Collection Personnelle
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">{galleryData?.date || "15 Nov 2026"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bienvenue, {galleryData?.nom || "Invité"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {galleryData?.evenementNom || "Gala d'Excellence Dakar"} · {galleryData?.lieu || "King Fahd Palace"}
          </p>
        </div>
      </section>

      {/* GRILLE DE PHOTOS */}
      <main className="flex-1 px-5 pb-24 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between my-3 px-1">
          <h2 className="text-sm font-bold text-slate-200">
            {activePhotos.length} photos retenues
          </h2>
          <span className="text-xs text-slate-400 font-medium">Actualisation en direct</span>
        </div>

        {activePhotos.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-12">
            Aucune photo pour le moment. Votre galerie se remplira dès que les photographes captureront votre visage.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {activePhotos.map((p: any) => (
              <div
                key={p.lienId || p.id}
                className="group relative rounded-[26px] overflow-hidden bg-surface border border-white/10 aspect-[3/4] shadow-md"
              >
                <img src={p.url} alt="Photo" className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-night/85 backdrop-blur-md text-[10px] font-extrabold text-gold border border-gold/30 shadow-sm">
                  {p.similarite ? `${p.similarite}%` : "Reconnu"}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="px-2.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-100 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Enregistrer</span>
                  </a>
                  <button
                    onClick={() => removePhoto(p.lienId)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface/90 text-slate-300 text-xs hover:text-rose-400 font-medium border border-white/10"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BARRE FLOTTANTE D'ACTION */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 floating-bar rounded-full px-5 py-2.5 flex items-center gap-3">
        <button
          onClick={shareWhatsApp}
          className="px-4 py-2 rounded-full bg-[#25D366] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Partager WhatsApp</span>
        </button>
        <span className="text-xs text-slate-400">·</span>
        <span className="text-xs text-slate-300 font-medium">
          {activePhotos.length} photos
        </span>
      </div>

      <footer className="max-w-2xl mx-auto w-full text-center py-6 text-xs text-slate-500 border-t border-white/5">
        Photos délivrées par PicsLive · CreatifPics Dakar
      </footer>
    </div>
  );
}
