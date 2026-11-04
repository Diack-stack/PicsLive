"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, Image as ImageIcon, Users, Phone, TrendingUp, Plus, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const [eventData, setEventData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handleAddPhoto = async (e: React.FormEvent) => {
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface border border-gold/30 flex items-center justify-center text-gold">
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
          </div>
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

        {/* SIMULATEUR D'INGESTION */}
        <div className="luxury-card p-6 rounded-[28px]">
          <h2 className="text-base font-bold text-white mb-1">Ingestion de photo en direct (Boîtier SFTP)</h2>
          <p className="text-xs text-slate-400 mb-4">
            Ajoutez une image pour simuler l&apos;envoi direct depuis un Canon R6 Mark II.
          </p>
          <form onSubmit={handleAddPhoto} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="URL de l'image (https://...)"
              className="flex-1 bg-night border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={uploading}
              className="btn-gold px-6 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Indexer la photo</span>
            </button>
          </form>
        </div>

        {/* GALLERIE DES PHOTOS */}
        <div>
          <h2 className="text-base font-bold text-slate-200 mb-3">Galerie de l&apos;événement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative rounded-2xl overflow-hidden bg-surface border border-white/10 aspect-square shadow-sm"
              >
                <img src={p.url} alt="Photo" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-night/85 backdrop-blur-md text-[10px] font-bold text-gold border border-gold/30 shadow-sm">
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
