"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Camera, Image as ImageIcon, Users, Phone, TrendingUp, UploadCloud, Plus, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const [eventData, setEventData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = () => {
    Promise.all([
      fetch("/api/event").then((r) => r.json()),
      fetch("/api/photos").then((r) => r.json()),
    ]).then(([ev, ph]) => {
      if (ev.success) {
        setEventData(ev.event);
        setStats(ev.stats);
      }
      if (ph.success) {
        setPhotos(ph.photos);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatus(`Indexation de ${file.name} (${i + 1}/${files.length})...`);
      const base64Data = await readFileAsBase64(file);

      await fetch("/api/photos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          data: base64Data,
          photographeNom: "Canon R6 Mark II (SFTP)",
        }),
      });
    }

    setUploadStatus("Indexation terminée avec succès !");
    setTimeout(() => setUploadStatus(null), 2500);
    setUploading(false);
    loadData();
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    setUploading(true);
    try {
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newPhotoUrl, photographeNom: "Canon R6 Mark II (SFTP)" }),
      });
      setNewPhotoUrl("");
      loadData();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night text-chalk flex flex-col justify-between antialiased selection:bg-gold selection:text-night">
      <header className="border-b border-white/5 bg-night/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-xl bg-surface border border-gold/30 flex items-center justify-center text-gold group-hover:border-gold/60 transition">
              <Camera className="w-5 h-5 text-gold" strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white">
                Pics<span className="text-gold">Live</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-gold border border-gold/30 uppercase">
                Régie Studio
              </span>
            </div>
          </Link>
          <Link
            href="/borne"
            target="_blank"
            className="px-4 py-2 rounded-full bg-surface hover:bg-surfaceLight text-gold border border-gold/30 text-xs font-bold transition"
          >
            Ouvrir la Borne Kiosk &rarr;
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        <div className="luxury-card p-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold">Session en direct</span>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">
              {eventData?.nom || "Gala d'Excellence Dakar 2026"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {eventData?.lieu || "King Fahd Palace, Dakar"} · Code : {eventData?.codeUnique || "GALA-2026"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Indexation Active
            </span>
          </div>
        </div>

        {/* METRIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-5 rounded-[24px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Photos Reçues</span>
              <ImageIcon className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats?.totalPhotos || 5}</p>
            <span className="text-[11px] text-slate-500">Indexées en collection</span>
          </div>

          <div className="luxury-card p-5 rounded-[24px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Invités Reconnus</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-400">{stats?.totalGuests || 1}</p>
            <span className="text-[11px] text-slate-500">Passages borne validés</span>
          </div>

          <div className="luxury-card p-5 rounded-[24px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contacts WhatsApp</span>
              <Phone className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-extrabold text-blue-400">{stats?.totalContacts || 1}</p>
            <span className="text-[11px] text-slate-500">Format E.164 normalisé</span>
          </div>

          <div className="luxury-card p-5 rounded-[24px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Taux d&apos;Opt-in</span>
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-extrabold text-gold">{stats?.marketingOptInRate || 100}%</p>
            <span className="text-[11px] text-slate-500">Consentements marketing</span>
          </div>
        </div>

        {/* ZONE DE DRAG & DROP DE VRAIS FICHIERS */}
        <div className="luxury-card p-7 rounded-[28px] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Ingestion de vraies photos (Fichiers locaux)</h2>
              <p className="text-xs text-slate-400">
                Glissez-déposez vos fichiers JPG ou PNG pour les ajouter au flux de l&apos;événement.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-surfaceLight text-gold font-semibold border border-gold/20">
              Canon SFTP Simulator
            </span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            className={`p-8 rounded-[24px] bg-night/60 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragOver ? "border-gold bg-gold/10 scale-[1.01]" : "border-gold/30 hover:border-gold/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-surface border border-gold/30 flex items-center justify-center text-gold mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-bold text-white mb-1">
              Glissez-déposez vos photos ici, ou <span className="text-gold underline">parcourez vos dossiers</span>
            </p>
            <p className="text-xs text-slate-400">
              Prend en charge JPG, PNG jusqu&apos;à 25 Mo · Optimisation et indexation faciale automatiques
            </p>

            {uploadStatus && (
              <div className="mt-4 text-xs font-semibold text-gold animate-pulse">
                {uploadStatus}
              </div>
            )}
          </div>

          <details className="text-xs text-slate-400 cursor-pointer pt-2">
            <summary className="hover:text-slate-200 transition font-medium">Ou injecter via une URL d&apos;image web</summary>
            <form onSubmit={handleAddPhotoUrl} className="flex flex-col sm:flex-row gap-3 mt-3">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-night border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-gold"
              />
              <button type="submit" disabled={uploading} className="btn-gold px-5 py-2.5 rounded-2xl font-bold text-xs">
                + Indexer par URL
              </button>
            </form>
          </details>
        </div>

        {/* LISTE DES PHOTOS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-200">Galerie de l&apos;événement</h2>
            <span className="text-xs text-slate-400">{photos.length} clichés indexés</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative rounded-[22px] overflow-hidden bg-surface border border-white/10 aspect-square shadow-sm group"
              >
                <img src={p.url} alt="Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-night/85 backdrop-blur-md text-[10px] font-bold text-gold border border-gold/30 shadow-sm">
                  {p.visagesDetectes || 1} visage(s)
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        PicsLive Console Régie · CreatifPics Dakar
      </footer>
    </div>
  );
}
