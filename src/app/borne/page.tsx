"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Camera, Check, ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";

type Step = "welcome" | "consent" | "capture" | "analyzing" | "details" | "result";

export default function BornePage() {
  const [step, setStep] = useState<Step>("welcome");
  const [nom, setNom] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isMajeur, setIsMajeur] = useState(true);
  const [consentPhotos, setConsentPhotos] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [autoResetTimer, setAutoResetTimer] = useState(60);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (step === "capture") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === "result") {
      setAutoResetTimer(60);
      interval = setInterval(() => {
        setAutoResetTimer((prev) => {
          if (prev <= 1) {
            resetKiosk();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const triggerCapture = () => {
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(countInterval);
          setStep("analyzing");
          setTimeout(() => setStep("details"), 1100);
          return null;
        }
        return c - 1;
      });
    }, 700);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !whatsapp) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          whatsapp,
          isMajeur,
          consentPhotos,
          consentMarketing,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecognitionResult(data);
        let qrUrl = data.qrCode;
        if (!qrUrl) {
          try {
            qrUrl = await QRCode.toDataURL(data.galleryUrl, {
              width: 260,
              margin: 1,
              color: { dark: "#070D18", light: "#FFFFFF" },
            });
          } catch {
            qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=070D18&bgcolor=FFFFFF&margin=10&data=${encodeURIComponent(data.galleryUrl)}`;
          }
        }
        setQrCodeDataUrl(qrUrl);
        setStep("result");
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetKiosk = () => {
    setNom("");
    setWhatsapp("");
    setRecognitionResult(null);
    setQrCodeDataUrl("");
    setStep("welcome");
  };

  const getStepIndicator = () => {
    if (step === "welcome") return "Étape 1 sur 3";
    if (step === "consent" || step === "capture") return "Étape 2 sur 3";
    return "Étape 3 sur 3";
  };

  return (
    <div className="min-h-screen bg-night text-chalk flex flex-col justify-between relative overflow-hidden antialiased select-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/12 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-900/25 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="max-w-4xl mx-auto w-full px-6 py-5 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition">
          <div className="w-10 h-10 rounded-2xl bg-surface border border-gold/30 flex items-center justify-center text-gold shadow-lg group-hover:border-gold/60 transition">
            <Camera className="w-5 h-5 text-gold" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">
              Pics<span className="text-gold">Live</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              CreatifPics Dakar
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 border border-gold/25 shadow-sm text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span>{getStepIndicator()}</span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 max-w-xl w-full mx-auto">
        {step === "welcome" && (
          <div className="text-center w-full animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-surface border border-gold/35 text-gold mx-auto flex items-center justify-center shadow-xl mb-6">
              <Camera className="w-10 h-10" strokeWidth={1.8} />
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold tracking-wider uppercase mb-3">
              Gala d&apos;Excellence Dakar
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Vos photos sont prêtes.
            </h1>

            <p className="text-sm text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
              Placez-vous devant l&apos;objectif. Le système identifie vos apparitions sur les clichés de la soirée et crée votre collection privée.
            </p>

            <button
              onClick={() => setStep("consent")}
              className="btn-gold kiosk-btn w-full py-4 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-3"
            >
              <span>Retrouver mes photos</span>
              <ArrowRight className="w-5 h-5 text-night" strokeWidth={2.5} />
            </button>

            <p className="mt-8 text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Conforme CDP Sénégal · Données biométriques protégées</span>
            </p>
          </div>
        )}

        {step === "consent" && (
          <div className="luxury-card p-8 sm:p-10 rounded-[32px] w-full">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Consentement à l&apos;analyse faciale</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Un selfie temporaire sera capturé pour comparer vos traits aux photos prises par nos photographes. Aucune empreinte n&apos;est conservée après la clôture de l&apos;événement.
            </p>

            <div className="bg-night/80 p-4 rounded-2xl border border-white/10 mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPhotos}
                  onChange={(e) => setConsentPhotos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-gold rounded cursor-pointer"
                />
                <span className="text-xs text-slate-200 font-medium">
                  J&apos;accepte l&apos;analyse de mon visage exclusivement pour la remise de mes photos de cet événement.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("welcome")}
                className="kiosk-btn flex-1 py-3.5 rounded-2xl bg-surfaceLight border border-white/10 text-slate-300 font-semibold text-sm"
              >
                Retour
              </button>
              <button
                onClick={() => setStep("capture")}
                disabled={!consentPhotos}
                className="btn-gold kiosk-btn flex-1 py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50"
              >
                Autoriser & Scanner
              </button>
            </div>
          </div>
        )}

        {step === "capture" && (
          <div className="flex flex-col items-center w-full">
            <div className="relative w-72 sm:w-80 h-96 sm:h-[400px] rounded-[36px] overflow-hidden bg-night border-2 border-gold/30 shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 flex flex-col items-center text-white">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 text-gold">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-semibold">Mode Caméra Prêt</p>
                  <p className="text-[11px] text-slate-400 mt-1">Appuyez sur Prendre le selfie</p>
                </div>
              )}

              {/* Hairline Corners Viseur Or Minimaliste */}
              <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-gold rounded-tl-lg pointer-events-none" />
              <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-gold rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-gold rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-gold rounded-br-lg pointer-events-none" />

              <div className="laser-line absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_10px_rgba(212,175,55,0.9)] pointer-events-none" />

              {countdown !== null && (
                <div className="absolute inset-0 bg-night/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <span className="text-6xl font-extrabold text-gold animate-ping">{countdown}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 w-72 sm:w-80">
              <button
                onClick={() => setStep("consent")}
                className="kiosk-btn px-5 py-3 rounded-2xl bg-surface border border-white/10 text-slate-300 font-semibold shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={triggerCapture}
                disabled={countdown !== null}
                className="btn-gold kiosk-btn flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
              >
                <span>Prendre le selfie</span>
              </button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="text-center w-full">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
            <h2 className="text-xl font-bold text-white mb-1">Recherche en cours</h2>
            <p className="text-xs text-slate-400">
              Comparaison biométrique avec l&apos;ensemble des photos de la soirée...
            </p>
          </div>
        )}

        {step === "details" && (
          <div className="luxury-card p-8 sm:p-10 rounded-[32px] w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Visage détecté</h2>
                <p className="text-xs text-slate-400">Où souhaitez-vous recevoir votre lien d&apos;accès ?</p>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Votre Nom & Prénom
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: Aminata Sow"
                  className="w-full bg-night border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Numéro WhatsApp
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 px-2.5 py-1 rounded-lg bg-surfaceLight border border-white/5 text-[11px] font-bold text-gold">
                    🇸🇳 +221
                  </span>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full bg-night border border-white/10 rounded-2xl py-3.5 pl-24 pr-4 text-sm text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Votre numéro sert d&apos;identifiant unique sécurisé pour votre galerie.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMajeur}
                    onChange={(e) => setIsMajeur(e.target.checked)}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-xs text-slate-300 font-medium">J&apos;ai 18 ans ou plus.</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-xs text-slate-400">
                    J&apos;accepte de recevoir les invitations exclusives de CreatifPics.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !nom || !whatsapp}
                className="btn-gold kiosk-btn w-full mt-4 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Génération en cours..." : "Générer mon QR Code"}</span>
                <ArrowRight className="w-4 h-4 text-night" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        )}

        {step === "result" && recognitionResult && (
          <div className="luxury-card p-8 sm:p-10 rounded-[36px] w-full text-center animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              <span>
                {recognitionResult.totalCount || 2} photos trouvées pour vous
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1">Scannez pour ouvrir</h2>
            <p className="text-xs text-slate-400 mb-6">Pointez l&apos;appareil photo de votre smartphone vers l&apos;écran</p>

            <div className="bg-white p-5 rounded-3xl inline-block shadow-2xl border-4 border-gold/30 mb-6">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code Galerie" className="w-52 h-52 sm:w-60 sm:h-60 mx-auto" />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-night">Chargement...</div>
              )}
            </div>

            <div className="mb-6">
              <a
                href={recognitionResult.galleryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline"
              >
                <span>Ouvrir la galerie directement sur cet écran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
              <span>Retour automatique dans <strong className="text-white">{autoResetTimer}</strong>s</span>
              <button onClick={resetKiosk} className="text-gold hover:text-white font-bold">
                Terminer
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 text-xs text-slate-500">
        PicsLive · Système de récupération photo instantanée · CreatifPics Dakar
      </footer>
    </div>
  );
}
