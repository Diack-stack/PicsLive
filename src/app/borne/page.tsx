"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  User,
  Phone,
  Lock,
  ChevronLeft,
  Scan,
} from "lucide-react";

type Step = "welcome" | "consent" | "capture" | "analyzing" | "details" | "result";

export default function BornePage() {
  const [step, setStep] = useState<Step>("welcome");
  const [eventData, setEventData] = useState<any>(null);
  const [selfieSrc, setSelfieSrc] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Formulaire invité
  const [nom, setNom] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isMajeur, setIsMajeur] = useState(true);
  const [consentPhotos, setConsentPhotos] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentPartage, setConsentPartage] = useState(false);

  // Résultat
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [autoResetTimer, setAutoResetTimer] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Charger les données de l'événement
  useEffect(() => {
    fetch("/api/event")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEventData(data.event);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Gestion du flux Webcam
  useEffect(() => {
    if (step === "capture") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  // Décompte de réinitialisation automatique sur l'écran final
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Webcam non accessible, bascule en mode simulation photo", err);
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
          executePhotoCapture();
          return null;
        }
        return c - 1;
      });
    }, 800);
  };

  const executePhotoCapture = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setSelfieSrc(dataUrl);
      }
    } else {
      // Mock selfie si webcam non dispo
      setSelfieSrc("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
    }
    setStep("analyzing");
    performMatching();
  };

  const performMatching = async () => {
    // Étape d'analyse visuelle élégante pendant 1.5s
    setTimeout(() => {
      setStep("details");
    }, 1500);
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
          consentPartage,
          selfieBase64: selfieSrc,
          evenementId: eventData?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecognitionResult(data);
        // Générer le QR Code
        const qrUrl = await QRCode.toDataURL(data.galleryUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: "#0B192C",
            light: "#FDFBF7",
          },
        });
        setQrCodeDataUrl(qrUrl);
        setStep("result");
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetKiosk = () => {
    setNom("");
    setWhatsapp("");
    setSelfieSrc(null);
    setRecognitionResult(null);
    setQrCodeDataUrl("");
    setStep("welcome");
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-[#FDFBF7] flex flex-col justify-between select-none relative overflow-hidden">
      {/* Halo de fond or & bleu nuit */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C08A3E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#1E3E62]/40 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER DE LA BORNE */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C08A3E] to-[#8F6428] flex items-center justify-center shadow-glow">
            <Scan className="w-6 h-6 text-[#0B192C]" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider uppercase text-[#FDFBF7]">
              Pics<span className="text-[#C08A3E]">Live</span>
            </span>
            <span className="block text-xs text-[#94A3B8] tracking-widest uppercase font-medium">
              by CreatifPics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#94A3B8]">Événement officiel</p>
            <p className="text-sm font-semibold text-[#FDFBF7]">{eventData?.nom || "Gala Dakar 2026"}</p>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-[#132F4C] border border-[#C08A3E]/30 text-[#C08A3E] font-medium tracking-wide">
            FR | EN
          </span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL PAR ÉTAPE */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 max-w-4xl w-full mx-auto">
        {/* ÉCRAN 1 : BIENVENUE */}
        {step === "welcome" && (
          <div className="text-center max-w-xl animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132F4C] border border-[#C08A3E]/30 text-[#C08A3E] text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Reconnaissance Faciale Instantanée
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Retrouvez toutes vos photos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C08A3E] via-[#D4AF37] to-[#C08A3E]">un instant</span>
            </h1>

            <p className="text-lg text-[#94A3B8] mb-10 leading-relaxed">
              Présentez-vous devant la caméra. Vos photos prises par les photographes de la soirée seront immédiatement retrouvées et livrées sur votre téléphone.
            </p>

            <button
              onClick={() => setStep("consent")}
              className="kiosk-btn w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#C08A3E] to-[#D4AF37] text-[#0B192C] font-bold text-xl flex items-center justify-center gap-3 shadow-glow mx-auto hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Retrouver mes photos</span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <p className="mt-8 text-xs text-[#94A3B8]/70 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C08A3E]" />
              Conformité stricte CDP & protection des données biométriques
            </p>
          </div>
        )}

        {/* ÉCRAN 2 : CONSENTEMENT BIOMÉTRIQUE */}
        {step === "consent" && (
          <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-xl w-full animate-fadeIn border border-[#C08A3E]/30">
            <h2 className="text-2xl font-bold mb-4 text-[#FDFBF7] flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-[#C08A3E]" />
              Analyse de votre visage
            </h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              Pour rechercher vos clichés, nous allons capturer un selfie temporaire. Vos empreintes faciales sont analysées en temps réel et supprimées automatiquement à la clôture de l&apos;événement.
            </p>

            <div className="bg-[#0B192C]/60 p-4 rounded-xl border border-[#1E3E62] mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPhotos}
                  onChange={(e) => setConsentPhotos(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-[#C08A3E] rounded cursor-pointer"
                />
                <span className="text-sm text-[#FDFBF7]">
                  J&apos;accepte l&apos;analyse de mon visage pour retrouver mes photos de cet événement conformément à la charte de confidentialité.
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep("welcome")}
                className="kiosk-btn flex-1 py-4 rounded-xl bg-[#132F4C] text-[#FDFBF7] font-semibold border border-[#1E3E62] hover:bg-[#1E3E62]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!consentPhotos}
                onClick={() => setStep("capture")}
                className="kiosk-btn flex-1 py-4 rounded-xl bg-[#C08A3E] text-[#0B192C] font-bold text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 3 : CAPTURE WEBCAM / VISEUR */}
        {step === "capture" && (
          <div className="flex flex-col items-center w-full max-w-md animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Cadrez votre visage</h2>
              <p className="text-sm text-[#94A3B8]">Placez-vous au centre sans masque ni lunettes de soleil</p>
            </div>

            {/* Viseur de caméra signature PicsLive */}
            <div className="relative w-80 h-96 sm:w-96 sm:h-[420px] rounded-3xl overflow-hidden border-2 border-[#1E3E62] bg-[#132F4C] shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 flex flex-col items-center">
                  <Camera className="w-16 h-16 text-[#C08A3E] mb-3 animate-pulse" />
                  <p className="text-sm text-[#94A3B8]">Simulation webcam active</p>
                  <p className="text-xs text-[#94A3B8]/60 mt-1">Cliquez sur Capturer pour le selfie test</p>
                </div>
              )}

              {/* Coins du viseur or */}
              <div className="viewfinder-corner top-4 left-4 border-t-4 border-l-4" />
              <div className="viewfinder-corner top-4 right-4 border-t-4 border-r-4" />
              <div className="viewfinder-corner bottom-4 left-4 border-b-4 border-l-4" />
              <div className="viewfinder-corner bottom-4 right-4 border-b-4 border-r-4" />

              {/* Ligne de scan animée */}
              <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#C08A3E] to-transparent shadow-[0_0_12px_#C08A3E] animate-scanLine pointer-events-none" />

              {/* Compte à rebours */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-[#0B192C]/70 backdrop-blur-sm flex items-center justify-center z-20">
                  <span className="text-7xl font-bold text-[#C08A3E] animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4 w-full">
              <button
                type="button"
                onClick={() => setStep("consent")}
                className="kiosk-btn px-6 py-4 rounded-xl bg-[#132F4C] text-[#FDFBF7] font-semibold border border-[#1E3E62]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={triggerCapture}
                disabled={countdown !== null}
                className="kiosk-btn flex-1 py-4 rounded-xl bg-gradient-to-r from-[#C08A3E] to-[#D4AF37] text-[#0B192C] font-bold text-xl flex items-center justify-center gap-3 shadow-glow"
              >
                <Camera className="w-6 h-6" />
                <span>Prendre le selfie</span>
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 4 : ANALYSE BIOMÉTRIQUE EN COURS */}
        {step === "analyzing" && (
          <div className="text-center max-w-md animate-fadeIn">
            <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#C08A3E]/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#C08A3E] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <Scan className="w-12 h-12 text-[#C08A3E]" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Reconnaissance en cours...</h2>
            <p className="text-[#94A3B8] text-sm">
              Comparaison faciale avec l&apos;ensemble des photos de l&apos;événement.
            </p>
          </div>
        )}

        {/* ÉCRAN 5 : COORDONNÉES & CONSENTEMENTS */}
        {step === "details" && (
          <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-xl w-full animate-fadeIn border border-[#C08A3E]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#FDFBF7]">Visage analysé avec succès</h2>
                <p className="text-xs text-[#94A3B8]">Où devons-nous vous livrer votre galerie personnelle ?</p>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Prénom & Nom *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="ex: Aminata Sow"
                    className="w-full bg-[#0B192C]/80 border border-[#1E3E62] rounded-xl py-3.5 pl-12 pr-4 text-[#FDFBF7] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#C08A3E] text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Numéro WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="77 123 45 67 ou +221..."
                    className="w-full bg-[#0B192C]/80 border border-[#1E3E62] rounded-xl py-3.5 pl-12 pr-4 text-[#FDFBF7] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#C08A3E] text-base"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8]/70 mt-1">
                  Format international ou numéro local (+221 par défaut)
                </p>
              </div>

              {/* Consentements */}
              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMajeur}
                    onChange={(e) => setIsMajeur(e.target.checked)}
                    className="w-4 h-4 accent-[#C08A3E] rounded"
                  />
                  <span className="text-xs text-[#94A3B8]">J&apos;ai 18 ans ou plus.</span>
                </label>

                {isMajeur && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentMarketing}
                      onChange={(e) => setConsentMarketing(e.target.checked)}
                      className="w-4 h-4 accent-[#C08A3E] rounded"
                    />
                    <span className="text-xs text-[#94A3B8]">
                      J&apos;accepte de recevoir des offres et invitations de CreatifPics.
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !nom || !whatsapp}
                className="kiosk-btn w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-[#C08A3E] to-[#D4AF37] text-[#0B192C] font-bold text-lg flex items-center justify-center gap-2 shadow-glow hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Création de votre galerie...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à mes photos</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ÉCRAN 6 : QR CODE & SUCCÈS */}
        {step === "result" && recognitionResult && (
          <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-xl w-full text-center animate-fadeIn border border-[#C08A3E]/30">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold mb-4">
              <CheckCircle2 className="w-4 h-4" />
              {recognitionResult.matchedSureCount > 0
                ? `${recognitionResult.matchedSureCount} photo(s) trouvée(s) pour vous !`
                : "Galerie créée avec succès"}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Scannez pour ouvrir votre galerie
            </h2>
            <p className="text-sm text-[#94A3B8] mb-6">
              Pointez l&apos;appareil photo de votre smartphone vers l&apos;écran
            </p>

            {/* QR Code Container */}
            <div className="bg-[#FDFBF7] p-4 rounded-2xl inline-block shadow-2xl mb-6">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code Galerie"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-[#0B192C]">
                  Chargement...
                </div>
              )}
            </div>

            {/* Lien direct clickable pour le test sur desktop */}
            <div className="mb-6">
              <a
                href={recognitionResult.galleryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#C08A3E] hover:underline flex items-center justify-center gap-1.5"
              >
                <span>Ouvrir la galerie dans un nouvel onglet (Lien direct)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Barre de retour auto */}
            <div className="flex items-center justify-between text-xs text-[#94A3B8] border-t border-[#1E3E62] pt-4">
              <span>Retour à l&apos;accueil dans {autoResetTimer}s</span>
              <button
                type="button"
                onClick={resetKiosk}
                className="text-[#C08A3E] hover:text-[#D4AF37] font-semibold"
              >
                Terminer maintenant
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER DISCRET */}
      <footer className="w-full text-center py-4 text-xs text-[#94A3B8]/60 z-10">
        PicsLive v2.1 · Borne tactile sécurisée · CreatifPics Dakar
      </footer>
    </div>
  );
}

