"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Share2,
  Calendar,
  MapPin,
  Sparkles,
  EyeOff,
  Maximize2,
  X,
  CheckCircle,
  Scan,
} from "lucide-react";

export default function GaleriePage() {
  const params = useParams();
  const token = params?.token as string;

  const [galleryData, setGalleryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareWhatsApp = () => {
    const shareText = `Retrouve mes photos de ${galleryData?.evenementNom || "l'événement"} sur ma galerie PicsLive : ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDownloadPhoto = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `picslive_photo_${index + 1}.jpg`;
    a.target = "_blank";
    a.click();
    showToast("Téléchargement lancé");
  };

  const handleRemovePhoto = async (lienId: string) => {
    setRemovedIds((prev) => [...prev, lienId]);
    if (selectedPhoto?.lienId === lienId) {
      setSelectedPhoto(null);
    }
    showToast("Photo retirée de votre galerie");

    try {
      await fetch(`/api/gallery/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_photo", lienId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B192C] flex flex-col items-center justify-center text-[#FDFBF7]">
        <div className="w-12 h-12 rounded-full border-4 border-[#C08A3E]/30 border-t-[#C08A3E] animate-spin mb-4" />
        <p className="text-[#94A3B8] text-sm">Chargement de votre galerie...</p>
      </div>
    );
  }

  if (!galleryData) {
    return (
      <div className="min-h-screen bg-[#0B192C] flex flex-col items-center justify-center p-6 text-center text-[#FDFBF7]">
        <div className="w-16 h-16 rounded-2xl bg-[#132F4C] border border-[#1E3E62] flex items-center justify-center text-[#C08A3E] mb-4">
          <EyeOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Galerie introuvable</h1>
        <p className="text-sm text-[#94A3B8] max-w-sm mb-6">
          Ce lien de galerie est invalide ou la période de disponibilité est expirée.
        </p>
      </div>
    );
  }

  const activePhotos = (galleryData.photos || []).filter(
    (p: any) => !removedIds.includes(p.lienId)
  );

  return (
    <div className="min-h-screen bg-[#0B192C] text-[#FDFBF7] flex flex-col selection:bg-[#C08A3E] selection:text-[#0B192C]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#132F4C] border border-[#C08A3E]/50 text-[#FDFBF7] text-sm font-medium shadow-glow flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#C08A3E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER DE LA GALERIE */}
      <header className="sticky top-0 z-40 bg-[#0B192C]/90 backdrop-blur-md border-b border-[#1E3E62]/70 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C08A3E] flex items-center justify-center shadow-glow">
              <Scan className="w-5 h-5 text-[#0B192C]" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-base font-bold tracking-wider uppercase text-[#FDFBF7]">
                Pics<span className="text-[#C08A3E]">Live</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2 rounded-xl bg-[#25D366] text-[#0B192C] font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager sur WhatsApp</span>
          </button>
        </div>
      </header>

      {/* BANNIÈRE INVITÉ */}
      <section className="px-4 pt-8 pb-6 max-w-4xl mx-auto w-full">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#C08A3E]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#C08A3E]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132F4C] border border-[#C08A3E]/30 text-[#C08A3E] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Galerie Personnelle
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[#FDFBF7]">
            Bienvenue, {galleryData.nom}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] mt-3">
            <span className="flex items-center gap-1.5 font-medium text-[#FDFBF7]">
              {galleryData.evenementNom}
            </span>
            {galleryData.lieu && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C08A3E]" />
                {galleryData.lieu}
              </span>
            )}
            {galleryData.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C08A3E]" />
                {galleryData.date}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* GRILLE DES PHOTOS */}
      <main className="flex-1 px-4 pb-16 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#FDFBF7]">
            Vos photos ({activePhotos.length})
          </h2>
          <span className="text-xs text-[#94A3B8]">
            Se remplit en direct au fil des prises
          </span>
        </div>

        {activePhotos.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center border border-[#1E3E62] my-8">
            <Sparkles className="w-10 h-10 text-[#C08A3E] mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-semibold mb-1">Aucune photo pour l&apos;instant</h3>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
              Nos photographes couvrent actuellement la soirée. Votre galerie s&apos;actualisera automatiquement dès que vous serez pris en photo !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {activePhotos.map((photo: any, index: number) => (
              <div
                key={photo.lienId || photo.id}
                className="group relative rounded-2xl overflow-hidden bg-[#132F4C] border border-[#1E3E62] aspect-[3/4] cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Badge similarité */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#0B192C]/80 backdrop-blur-sm text-[10px] font-bold text-[#C08A3E] border border-[#C08A3E]/30">
                  {photo.similarite ? `${photo.similarite}%` : "Reconnu"}
                </div>

                {/* Overlay actions au survol */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPhoto(photo.url, index);
                    }}
                    className="p-2 rounded-xl bg-[#0B192C]/80 text-[#FDFBF7] hover:text-[#C08A3E] backdrop-blur-sm border border-[#1E3E62]"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(photo.lienId);
                    }}
                    className="p-2 rounded-xl bg-[#0B192C]/80 text-[#94A3B8] hover:text-red-400 backdrop-blur-sm border border-[#1E3E62]"
                    title="Ce n'est pas moi"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODALE LIGHTBOX EN GRAND */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Header Lightbox */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <span className="text-xs text-[#94A3B8]">
              {selectedPhoto.similarite && `Similarité faciale : ${selectedPhoto.similarite}%`}
            </span>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-2 rounded-full bg-[#132F4C] border border-[#1E3E62] text-[#FDFBF7] hover:bg-[#1E3E62]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo centrée */}
          <div className="flex-1 flex items-center justify-center p-2">
            <img
              src={selectedPhoto.url}
              alt="Photo plein écran"
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-[#1E3E62]"
            />
          </div>

          {/* Actions Lightbox */}
          <div className="max-w-md mx-auto w-full flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleDownloadPhoto(selectedPhoto.url, 0)}
              className="flex-1 py-3.5 rounded-xl bg-[#C08A3E] text-[#0B192C] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-glow"
            >
              <Download className="w-4 h-4" />
              <span>Enregistrer la photo</span>
            </button>
            <button
              type="button"
              onClick={() => handleRemovePhoto(selectedPhoto.lienId)}
              className="px-4 py-3.5 rounded-xl bg-[#132F4C] text-[#94A3B8] hover:text-red-400 font-semibold text-xs border border-[#1E3E62] flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              <span>Ce n&apos;est pas moi</span>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full text-center py-6 text-xs text-[#94A3B8]/60 border-t border-[#1E3E62]/40">
        Photos délivrées par PicsLive · CreatifPics Dakar
      </footer>
    </div>
  );
}

