"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Users,
  CheckCircle,
  Plus,
  RefreshCw,
  Scan,
  TrendingUp,
  Shield,
  Layers,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const [eventData, setEventData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire d'ajout de photo
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [photographerName, setPhotographerName] = useState("Canon R6 Mark II (SFTP)");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/event").then((r) => r.json()),
      fetch("/api/photos").then((r) => r.json()),
    ])
      .then(([evData, phData]) => {
        if (evData.success) {
          setEventData(evData.event);
          setStats(evData.stats);
        }
        if (phData.success) {
          setPhotos(phData.photos);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    setUploading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newPhotoUrl,
          photographeNom: photographerName,
          evenementId: eventData?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Photo indexée avec succès !");
        setNewPhotoUrl("");
        loadData();
      } else {
        setMessage(data.error || "Erreur d'indexation");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur réseau");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-[#FDFBF7] flex flex-col">
      {/* HEADER ADMIN */}
      <header className="border-b border-[#1E3E62] bg-[#0B192C]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C08A3E] flex items-center justify-center shadow-glow">
              <Scan className="w-5 h-5 text-[#0B192C]" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wider uppercase text-[#FDFBF7]">
                Pics<span className="text-[#C08A3E]">Live</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#132F4C] text-[#C08A3E] border border-[#C08A3E]/30 uppercase">
                Console Régie
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/borne"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#132F4C] hover:bg-[#1E3E62] border border-[#C08A3E]/30 text-xs text-[#C08A3E] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Ouvrir la Borne Kiosk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* EN-TÊTE ÉVÉNEMENT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-[#C08A3E]/20">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C08A3E]">
              Événement en direct
            </span>
            <h1 className="text-2xl font-bold mt-1">{eventData?.nom || "Chargement..."}</h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              {eventData?.lieu} · Code unique : <span className="font-mono text-[#FDFBF7]">{eventData?.codeUnique}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-[#132F4C] text-[#94A3B8] hover:text-[#FDFBF7] border border-[#1E3E62]"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              Moteur actif
            </span>
          </div>
        </div>

        {/* STATISTIQUES EN DIRECT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-[#1E3E62]">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs font-medium uppercase">Photos Reçues</span>
              <ImageIcon className="w-4 h-4 text-[#C08A3E]" />
            </div>
            <p className="text-3xl font-bold text-[#FDFBF7]">{stats?.totalPhotos || 0}</p>
            <span className="text-[11px] text-[#94A3B8]">Indexées par le moteur</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#1E3E62]">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs font-medium uppercase">Invités Reconnus</span>
              <Users className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-3xl font-bold text-[#FDFBF7]">{stats?.totalGuests || 0}</p>
            <span className="text-[11px] text-[#94A3B8]">Passages à la borne</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#1E3E62]">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs font-medium uppercase">Base Contacts</span>
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-[#FDFBF7]">{stats?.totalContacts || 0}</p>
            <span className="text-[11px] text-[#94A3B8]">Numéros WhatsApp E.164</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#1E3E62]">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs font-medium uppercase">Opt-in Marketing</span>
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-3xl font-bold text-[#C08A3E]">{stats?.marketingOptInRate || 0}%</p>
            <span className="text-[11px] text-[#94A3B8]">Consentements vérifiés</span>
          </div>
        </div>

        {/* SIMULATEUR D'INGESTION PHOTO (SFTP / Boîtier) */}
        <div className="glass-panel p-6 rounded-2xl border border-[#C08A3E]/30">
          <div className="flex items-center gap-3 mb-4">
            <UploadCloud className="w-6 h-6 text-[#C08A3E]" />
            <div>
              <h2 className="text-lg font-bold">Ingestion de photo (Simulateur SFTP / Boîtier)</h2>
              <p className="text-xs text-[#94A3B8]">
                Injectez une photo dans le flux pour tester immédiatement la détection et l&apos;indexation des visages
              </p>
            </div>
          </div>

          <form onSubmit={handleAddPhoto} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="url"
              required
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="URL de l'image (ex: https://images.unsplash.com/...)"
              className="md:col-span-2 bg-[#0B192C] border border-[#1E3E62] rounded-xl px-4 py-3 text-sm text-[#FDFBF7] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#C08A3E]"
            />
            <button
              type="submit"
              disabled={uploading || !newPhotoUrl}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#C08A3E] to-[#D4AF37] text-[#0B192C] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 shadow-glow"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Indexation en cours...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Indexez la photo</span>
                </>
              )}
            </button>
          </form>

          {message && (
            <p className="text-xs mt-3 text-[#10B981] flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4" />
              {message}
            </p>
          )}
        </div>

        {/* LISTE DES PHOTOS DU LOT */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C08A3E]" />
              Photos de l&apos;événement ({photos.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative rounded-xl overflow-hidden bg-[#132F4C] border border-[#1E3E62] aspect-square group"
              >
                <img
                  src={photo.url}
                  alt="Photo événement"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0B192C]/80 text-[10px] font-medium text-[#C08A3E] border border-[#C08A3E]/30">
                  {photo.visagesDetectes || 1} visage(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1E3E62] py-4 text-center text-xs text-[#94A3B8]/60">
        PicsLive Console Régie · CreatifPics Dakar
      </footer>
    </div>
  );
}

