"""
PicsLive - Serveur de Développement MVP
Design System Haute Couture inspiré des références :
- Fond porcelaine chaud & auras dégradées (Readly, Travexa)
- Cartes superposées en éventail 3D (Travelwise, Collections)
- Barre flottante en verre dépoli (iOS Liquid Glass)
- Typographie géométrique & zéro emoji (uniquement icônes vectorielles SVG épurées)
"""

import sys
import json
import time
import random
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_FILE = DATA_DIR / "db.json"
PORT = 3000

def get_db():
    if not DB_FILE.exists():
        return {"events": [], "photos": [], "visages": [], "contacts": [], "participations": [], "consentements": [], "liensPhotos": []}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(db):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

def format_whatsapp(phone, default_country="221"):
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    if cleaned.startswith("+"):
        return cleaned
    if cleaned.startswith("00"):
        return "+" + cleaned[2:]
    if cleaned.startswith("0"):
        cleaned = cleaned[1:]
    return f"+{default_country}{cleaned}"

# ==============================================================================
# TEMPLATES HTML AVEC DESIGN SYSTEM PREMIUM (ZÉRO EMOJI, ICÔNES SVG ÉPURÉES)
# ==============================================================================

HTML_HUB = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PicsLive · Reconnaissance Faciale Événementielle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            serif: ['"Playfair Display"', 'serif'],
          },
          colors: {
            canvas: '#F8F9FA',
            dark: '#090D16',
            amberAccent: '#F59E0B',
            honey: '#EAB308',
            cream: '#FFFDF9',
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #F8F9FA; color: #090D16; font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.03);
    }
    .photo-stack {
      perspective: 1000px;
    }
    .pill-shadow {
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.35);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between relative overflow-x-hidden antialiased">
  <!-- Auras atmosphériques douces inspirées de Travexa & Readly -->
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-100/50 via-sky-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div class="absolute top-96 -right-20 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

  <!-- NAVIGATION HEADER -->
  <header class="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-[#090D16] flex items-center justify-center text-white shadow-md">
        <svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
        </svg>
      </div>
      <div>
        <span class="text-lg font-extrabold tracking-tight text-[#090D16]">Pics<span class="text-amber-500">Live</span></span>
        <span class="block text-[10px] text-slate-400 font-medium tracking-widest uppercase">by CreatifPics</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/60 shadow-sm text-xs font-semibold text-slate-600">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Version 2.1 Studio</span>
      </div>
      <a href="/admin" class="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
        Régie Opérateur
      </a>
    </div>
  </header>

  <!-- HERO SECTION INSPIRÉE DE TRAVELWISE & READLY -->
  <main class="max-w-6xl mx-auto px-6 pt-6 pb-16 flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
    <!-- TAG PILULE -->
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-slate-700 text-xs font-semibold mb-6">
      <span class="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">Live</span>
      Reconnaissance faciale instantanée pour événements
    </div>

    <!-- GRAND TITRE ÉDITORIAL -->
    <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#090D16] max-w-4xl leading-[1.08] mb-6">
      Vos photos d'événement,<br>
      retrouvées en <span class="font-serif italic font-semibold text-amber-500">un regard.</span>
    </h1>

    <p class="text-base sm:text-lg text-slate-500 max-w-xl mb-10 leading-relaxed font-normal">
      Une borne tactile élégante, un selfie instantané et vos clichés haute résolution sont livrés sur votre smartphone en quelques secondes.
    </p>

    <!-- BOUTONS D'ACTION PRINCIPAUX (STYLE READLY & TRAVEXA) -->
    <div class="flex flex-col sm:flex-row items-center gap-3 mb-14 w-full sm:w-auto">
      <a href="/borne" class="w-full sm:w-auto px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all pill-shadow transform hover:-translate-y-0.5">
        <span>Lancer la Borne Invité</span>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </a>
      <a href="/galerie/pl_demo_token_8a9b7c" class="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition">
        <span>Voir la Galerie Démo</span>
      </a>
    </div>

    <!-- COMPOSITION DE CARTES EN ÉVENTAIL 3D (RÉFÉRENCE PHOTOSTACK) -->
    <div class="relative w-full max-w-3xl h-64 sm:h-72 flex items-center justify-center mb-16 photo-stack">
      <!-- Carte Arrière Gauche -->
      <div class="absolute w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white transform -rotate-12 -translate-x-32 sm:-translate-x-44 translate-y-2 transition-transform duration-500 hover:-translate-y-2">
        <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <span class="absolute bottom-3 left-3 text-[11px] font-bold text-white tracking-wide">Gala Dakar 2026</span>
      </div>

      <!-- Carte Arrière Droite -->
      <div class="absolute w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white transform rotate-12 translate-x-32 sm:translate-x-44 translate-y-2 transition-transform duration-500 hover:-translate-y-2">
        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <span class="absolute bottom-3 left-3 text-[11px] font-bold text-white tracking-wide">Soirée Privée</span>
      </div>

      <!-- Carte Centrale En Vedette -->
      <div class="absolute w-48 sm:w-60 h-60 sm:h-72 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300 z-10">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
        <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-slate-800 shadow-sm flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Reconnu 98.4%
        </div>
        <div class="absolute bottom-3.5 left-4 text-left">
          <span class="text-[10px] uppercase font-bold tracking-wider text-amber-300">Mariama Ba</span>
          <p class="text-xs font-semibold text-white">2 photos livrées en direct</p>
        </div>
      </div>
    </div>

    <!-- BENTO GRID DE FONCTIONNALITÉS (STYLE TRAVEXA & READLY) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left max-w-5xl">
      <!-- Item 1 -->
      <div class="glass-card p-7 rounded-[28px] transition-all hover:translate-y-[-2px]">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-5">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
            <circle cx="12" cy="13" r="3"></circle>
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-1.5">Borne Kiosk Tactile</h3>
        <p class="text-xs text-slate-500 leading-relaxed">
          Viseur dynamique avec autofocus simulé. Moins de 30 secondes pour retrouver toutes ses photos.
        </p>
      </div>

      <!-- Item 2 -->
      <div class="glass-card p-7 rounded-[28px] transition-all hover:translate-y-[-2px]">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 mb-5">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-1.5">Galerie Mobile Live</h3>
        <p class="text-xs text-slate-500 leading-relaxed">
          Accès immédiat par QR Code personnel. Vos clichés s'ajoutent en temps réel pendant la réception.
        </p>
      </div>

      <!-- Item 3 -->
      <div class="glass-card p-7 rounded-[28px] transition-all hover:translate-y-[-2px]">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-5">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-1.5">Conformité & Confidentialité</h3>
        <p class="text-xs text-slate-500 leading-relaxed">
          Conforme à la législation CDP Sénégal (Loi 2008-12). Consentements horodatés et purge automatique.
        </p>
      </div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="max-w-6xl mx-auto w-full px-6 py-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
    <p>PicsLive, by CreatifPics Studio · Dakar, Sénégal</p>
    <div class="flex items-center gap-6">
      <a href="/borne" class="hover:text-slate-600 transition">Borne</a>
      <a href="/admin" class="hover:text-slate-600 transition">Régie</a>
      <a href="/galerie/pl_demo_token_8a9b7c" class="hover:text-slate-600 transition">Galerie Démo</a>
    </div>
  </footer>
</body>
</html>
"""

HTML_BORNE = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>PicsLive · Borne Invité</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <style>
    body { background-color: #F8F9FA; color: #090D16; font-family: 'Plus Jakarta Sans', sans-serif; user-select: none; }
    .glass-card {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .kiosk-btn {
      min-height: 58px;
      touch-action: manipulation;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .kiosk-btn:active {
      transform: scale(0.97);
    }
    .viewfinder-frame {
      box-shadow: 0 0 0 2000px rgba(9, 13, 22, 0.55);
    }
    @keyframes laser {
      0%, 100% { top: 8%; opacity: 0.8; }
      50% { top: 88%; opacity: 1; }
    }
    .laser-line {
      animation: laser 2.2s ease-in-out infinite;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between relative overflow-hidden antialiased">
  <!-- AURA SUBTILE -->
  <div class="absolute -top-32 -left-32 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none -z-10"></div>

  <!-- HEADER BORNE -->
  <header class="max-w-4xl mx-auto w-full px-6 py-5 flex items-center justify-between z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-[#090D16] flex items-center justify-center text-white shadow-sm">
        <svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
        </svg>
      </div>
      <div>
        <span class="text-base font-extrabold tracking-tight">Pics<span class="text-amber-500">Live</span></span>
        <span class="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">CreatifPics</span>
      </div>
    </div>

    <!-- INDICATEUR D'ÉTAPE EN PILULE (STYLE GENIE CHATBOT) -->
    <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/70 shadow-sm text-xs font-semibold text-slate-600">
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      <span id="stepIndicator">Étape 1 sur 3</span>
    </div>
  </header>

  <!-- CONTENEUR DES ÉCRANS -->
  <main class="flex-1 flex items-center justify-center p-6 z-10 max-w-xl w-full mx-auto" id="mainContainer">
    <!-- ÉTAPE 1 : ACCUEIL -->
    <div id="stepWelcome" class="text-center w-full animate-fadeIn">
      <div class="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200/70 text-amber-600 mx-auto flex items-center justify-center shadow-sm mb-6">
        <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>

      <span class="inline-block px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-xs font-bold tracking-wider uppercase mb-3">
        Gala d'Excellence Dakar
      </span>

      <h1 class="text-3xl sm:text-4xl font-extrabold text-[#090D16] tracking-tight mb-4">
        Vos photos sont prêtes.
      </h1>

      <p class="text-sm text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
        Placez-vous devant l'objectif. Le système identifie vos apparitions sur les clichés de la soirée et crée votre collection privée.
      </p>

      <button onclick="goToStep('consent')" class="kiosk-btn w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-amber-500/25">
        <span>Retrouver mes photos</span>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>

      <p class="mt-8 text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>Conforme CDP Sénégal · Données biométriques protégées</span>
      </p>
    </div>

    <!-- ÉTAPE 2 : CONSENTEMENT ÉPURÉ -->
    <div id="stepConsent" class="glass-card p-8 sm:p-10 rounded-[32px] w-full hidden">
      <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      </div>

      <h2 class="text-xl font-bold text-slate-900 mb-2">Consentement à l'analyse faciale</h2>
      <p class="text-xs text-slate-500 leading-relaxed mb-6">
        Un selfie temporaire sera capturé pour comparer vos traits aux photos prises par nos photographes. Aucune empreinte n'est conservée après la clôture de l'événement.
      </p>

      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mb-8">
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" id="chkConsentPhotos" checked class="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer">
          <span class="text-xs text-slate-700 font-medium">J'accepte l'analyse de mon visage exclusivement pour la remise de mes photos de cet événement.</span>
        </label>
      </div>

      <div class="flex gap-3">
        <button onclick="goToStep('welcome')" class="kiosk-btn flex-1 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm">
          Retour
        </button>
        <button onclick="startCaptureFlow()" class="kiosk-btn flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-md shadow-amber-500/20">
          Autoriser & Scanner
        </button>
      </div>
    </div>

    <!-- ÉTAPE 3 : CAPTURE CAMERA AVEC VISEUR MODERNE -->
    <div id="stepCapture" class="flex flex-col items-center w-full hidden">
      <div class="relative w-72 sm:w-80 h-96 sm:h-[400px] rounded-[36px] overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center">
        <video id="webcamVideo" autoplay playsinline muted class="w-full h-full object-cover transform scale-x-[-1]"></video>
        
        <div id="cameraFallback" class="hidden text-center p-6 flex flex-col items-center text-white">
          <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 text-amber-400">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <p class="text-xs font-semibold">Mode Caméra Prêt</p>
          <p class="text-[11px] text-slate-400 mt-1">Appuyez sur Prendre le selfie</p>
        </div>

        <!-- Hairline Corners Viseur Minimaliste -->
        <div class="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-lg pointer-events-none"></div>
        <div class="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-lg pointer-events-none"></div>
        <div class="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-lg pointer-events-none"></div>
        <div class="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-lg pointer-events-none"></div>

        <!-- Ligne de scan laser dorée douce -->
        <div class="laser-line absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none"></div>

        <!-- Décompte moderne -->
        <div id="countdownBox" class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center hidden z-20">
          <span id="countdownNumber" class="text-6xl font-extrabold text-amber-400 animate-ping">3</span>
        </div>
      </div>

      <div class="mt-6 flex gap-3 w-72 sm:w-80">
        <button onclick="goToStep('consent')" class="kiosk-btn px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button onclick="triggerPhoto()" class="kiosk-btn flex-1 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
          <span>Prendre le selfie</span>
        </button>
      </div>
    </div>

    <!-- ÉTAPE 4 : CHARGEMENT ANALYSE BIOMÉTRIQUE -->
    <div id="stepAnalyzing" class="text-center w-full hidden">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin"></div>
      <h2 class="text-xl font-bold text-slate-900 mb-1">Recherche en cours</h2>
      <p class="text-xs text-slate-500">Comparaison biométrique avec l'ensemble des photos de la soirée...</p>
    </div>

    <!-- ÉTAPE 5 : FORMULAIRE LIVRAISON WHATSAPP -->
    <div id="stepDetails" class="glass-card p-8 sm:p-10 rounded-[32px] w-full hidden">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">Visage détecté</h2>
          <p class="text-xs text-slate-500">Où souhaitez-vous recevoir votre lien d'accès ?</p>
        </div>
      </div>

      <form onsubmit="handleFormSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Votre Nom & Prénom</label>
          <input type="text" id="inpNom" required placeholder="ex: Aminata Sow" class="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-sm">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Numéro WhatsApp</label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
              🇸🇳 +221
            </span>
            <input type="tel" id="inpTel" required placeholder="77 123 45 67" class="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-24 pr-4 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-sm">
          </div>
          <p class="text-[11px] text-slate-400 mt-1.5">Votre numéro sert d'identifiant unique sécurisé pour votre galerie.</p>
        </div>

        <div class="pt-2 space-y-2">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" id="chkMajeur" checked class="w-4 h-4 accent-amber-500 rounded">
            <span class="text-xs text-slate-600 font-medium">J'ai 18 ans ou plus.</span>
          </label>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" id="chkMarketing" class="w-4 h-4 accent-amber-500 rounded">
            <span class="text-xs text-slate-500">J'accepte de recevoir les invitations exclusives de CreatifPics.</span>
          </label>
        </div>

        <button type="submit" id="btnSubmitForm" class="kiosk-btn w-full mt-4 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2">
          <span>Générer mon QR Code</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </form>
    </div>

    <!-- ÉTAPE 6 : REMISE DU QR CODE (STYLE AIRDROP / APPLE CARD) -->
    <div id="stepResult" class="glass-card p-8 sm:p-10 rounded-[36px] w-full text-center hidden animate-fadeIn">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200/60">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span id="badgeFound">2 photos trouvées</span>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 mb-1">Scannez pour ouvrir</h2>
      <p class="text-xs text-slate-500 mb-6">Pointez l'appareil photo de votre smartphone vers l'écran</p>

      <div class="bg-white p-5 rounded-3xl inline-block shadow-md border border-slate-100 mb-6">
        <canvas id="qrCanvas" class="w-52 h-52 sm:w-60 sm:h-60 mx-auto"></canvas>
      </div>

      <div class="mb-6">
        <a id="lnkDirectGallery" href="#" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-500 hover:underline">
          <span>Ouvrir la galerie directement sur cet écran</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
        <span>Retour automatique dans <strong id="resetSec" class="text-slate-700">60</strong>s</span>
        <button onclick="resetKiosk()" class="text-slate-600 hover:text-slate-900 font-bold">Terminer</button>
      </div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="max-w-4xl mx-auto w-full text-center py-4 text-xs text-slate-400">
    PicsLive · Système de récupération photo instantanée · CreatifPics Dakar
  </footer>

  <script>
    let currentStream = null;
    let resetInterval = null;

    function goToStep(step) {
      const steps = ['welcome', 'consent', 'capture', 'analyzing', 'details', 'result'];
      steps.forEach(s => {
        const el = document.getElementById('step' + s.charAt(0).toUpperCase() + s.slice(1));
        if (el) el.classList.add('hidden');
      });
      const target = document.getElementById('step' + step.charAt(0).toUpperCase() + step.slice(1));
      if (target) target.classList.remove('hidden');

      const indicator = document.getElementById('stepIndicator');
      if (step === 'welcome') indicator.innerText = 'Étape 1 sur 3';
      else if (step === 'consent' || step === 'capture') indicator.innerText = 'Étape 2 sur 3';
      else if (step === 'details' || step === 'result') indicator.innerText = 'Étape 3 sur 3';

      if (step !== 'capture' && currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
      }
    }

    async function startCaptureFlow() {
      goToStep('capture');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        currentStream = stream;
        const vid = document.getElementById('webcamVideo');
        vid.srcObject = stream;
        vid.classList.remove('hidden');
        document.getElementById('cameraFallback').classList.add('hidden');
      } catch (err) {
        document.getElementById('webcamVideo').classList.add('hidden');
        document.getElementById('cameraFallback').classList.remove('hidden');
      }
    }

    function triggerPhoto() {
      const box = document.getElementById('countdownBox');
      const num = document.getElementById('countdownNumber');
      box.classList.remove('hidden');
      let count = 3;
      num.innerText = count;

      const intv = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(intv);
          box.classList.add('hidden');
          goToStep('analyzing');
          setTimeout(() => goToStep('details'), 1100);
        } else {
          num.innerText = count;
        }
      }, 700);
    }

    async function handleFormSubmit(e) {
      e.preventDefault();
      const nom = document.getElementById('inpNom').value;
      const tel = document.getElementById('inpTel').value;
      const btn = document.getElementById('btnSubmitForm');
      btn.innerText = 'Génération de votre galerie...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/recognize', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            nom,
            whatsapp: tel,
            consentPhotos: true,
            isMajeur: document.getElementById('chkMajeur').checked,
            consentMarketing: document.getElementById('chkMarketing').checked
          })
        });
        const data = await res.json();
        if (data.success) {
          QRCode.toCanvas(document.getElementById('qrCanvas'), data.galleryUrl, { width: 240, margin: 1 });
          document.getElementById('lnkDirectGallery').href = data.galleryUrl;
          document.getElementById('badgeFound').innerText = `${data.totalCount || 2} photos trouvées pour vous`;
          goToStep('result');
          startResetTimer();
        } else {
          alert(data.error || 'Erreur');
        }
      } catch (err) {
        alert('Erreur réseau');
      } finally {
        btn.innerText = 'Générer mon QR Code';
        btn.disabled = false;
      }
    }

    function startResetTimer() {
      let sec = 60;
      document.getElementById('resetSec').innerText = sec;
      if (resetInterval) clearInterval(resetInterval);
      resetInterval = setInterval(() => {
        sec--;
        document.getElementById('resetSec').innerText = sec;
        if (sec <= 0) {
          clearInterval(resetInterval);
          resetKiosk();
        }
      }, 1000);
    }

    function resetKiosk() {
      if (resetInterval) clearInterval(resetInterval);
      document.getElementById('inpNom').value = '';
      document.getElementById('inpTel').value = '';
      goToStep('welcome');
    }
  </script>
</body>
</html>
"""

HTML_GALERIE = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PicsLive · Ma Galerie Personnelle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #F8F9FA; color: #090D16; font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-bar {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased">
  <!-- HEADER MOBILE INSPIRÉ DE L'IMAGE 2 (COLLECTION) -->
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-[#090D16] flex items-center justify-center text-white">
          <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"></circle><path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path></svg>
        </div>
        <span class="text-sm font-extrabold tracking-tight">Pics<span class="text-amber-500">Live</span></span>
      </div>

      <button onclick="shareWhatsApp()" class="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95">
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.146-.541-1.859-.77-3.045-2.664-3.138-2.787-.092-.122-.751-.998-.751-1.905 0-.907.476-1.352.645-1.536.17-.184.37-.23.493-.23.123 0 .247.002.354.007.112.006.262-.042.41.314.154.37.524 1.277.57 1.37.046.092.077.2.015.323-.062.123-.092.2-.185.307-.092.108-.195.242-.278.325-.093.093-.19.195-.082.38.108.185.479.79 1.028 1.279.707.63 1.303.825 1.488.918.185.092.293.077.4-.046.108-.123.462-.538.585-.723.123-.185.246-.154.415-.092.17.061 1.077.508 1.262.6.185.092.308.138.354.215.046.077.046.446-.098.851z"/></svg>
        <span>Partager</span>
      </button>
    </div>
  </header>

  <!-- BANNIÈRE DE COLLECTION (STYLE JAPAN GROUP TRIP - IMAGE 2) -->
  <section class="px-5 pt-6 pb-4 max-w-2xl mx-auto w-full">
    <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">Collection Personnelle</span>
        <span class="text-xs text-slate-400">·</span>
        <span class="text-xs text-slate-400" id="eventDate">15 Nov 2026</span>
      </div>

      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" id="guestName">
        Bienvenue
      </h1>
      <p class="text-xs text-slate-500 mt-1" id="eventInfo">Gala d'Excellence Dakar · King Fahd Palace</p>
    </div>
  </section>

  <!-- LISTE DES PHOTOS -->
  <main class="flex-1 px-5 pb-20 max-w-2xl mx-auto w-full">
    <div class="flex items-center justify-between my-3 px-1">
      <h2 class="text-sm font-bold text-slate-800" id="photoCountTitle">Vos photos</h2>
      <span class="text-xs text-slate-400 font-medium">Actualisation en direct</span>
    </div>

    <div class="grid grid-cols-2 gap-3" id="galleryGrid"></div>
  </main>

  <footer class="max-w-2xl mx-auto w-full text-center py-6 text-xs text-slate-400 border-t border-slate-100">
    Photos délivrées par PicsLive · CreatifPics Dakar
  </footer>

  <script>
    const token = window.location.pathname.split('/').pop();
    let currentGallery = null;

    async function loadGallery() {
      try {
        const res = await fetch('/api/gallery/' + token);
        const data = await res.json();
        if (data.success) {
          currentGallery = data.gallery;
          document.getElementById('guestName').innerText = data.gallery.nom;
          document.getElementById('eventInfo').innerText = `${data.gallery.evenementNom} · ${data.gallery.lieu || 'Dakar'}`;
          document.getElementById('photoCountTitle').innerText = `${data.gallery.photos.length} photos retenues`;

          const grid = document.getElementById('galleryGrid');
          if (data.gallery.photos.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-xs text-slate-400 py-12">Aucune photo pour le moment. Votre galerie se remplira dès que les photographes captureront votre visage.</p>';
          } else {
            grid.innerHTML = data.gallery.photos.map(p => `
              <div class="group relative rounded-[24px] overflow-hidden bg-slate-100 border border-slate-200/60 aspect-[3/4] shadow-sm" id="card_${p.lienId}">
                <img src="${p.url}" class="w-full h-full object-cover">
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-slate-800 shadow-sm">
                  ${p.similarite ? p.similarite + '%' : 'Reconnu'}
                </span>
                
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <a href="${p.url}" target="_blank" download class="px-2.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-100">
                    Enregistrer
                  </a>
                  <button onclick="removePhoto('${p.lienId}')" class="px-2.5 py-1.5 rounded-xl bg-slate-900/70 text-slate-300 text-xs hover:text-rose-400 font-medium">
                    Ce n'est pas moi
                  </button>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function removePhoto(lienId) {
      const card = document.getElementById('card_' + lienId);
      if (card) card.remove();
      await fetch('/api/gallery/' + token, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ action: 'remove_photo', lienId })
      });
    }

    function shareWhatsApp() {
      const txt = `Retrouve mes photos de ${currentGallery?.evenementNom || "l'événement"} sur PicsLive : ${window.location.href}`;
      window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
    }

    loadGallery();
  </script>
</body>
</html>
"""

HTML_ADMIN = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PicsLive · Console Régie</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #F8F9FA; color: #090D16; font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased">
  <header class="border-b border-slate-200/70 bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#090D16] flex items-center justify-center text-white">
          <svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"></circle><path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path></svg>
        </div>
        <div>
          <span class="text-base font-extrabold tracking-tight">Pics<span class="text-amber-500">Live</span></span>
          <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">Régie Studio</span>
        </div>
      </div>
      <a href="/borne" target="_blank" class="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
        Ouvrir la Borne Kiosk &rarr;
      </a>
    </div>
  </header>

  <main class="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
    <div class="glass-card p-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-amber-600">Session en direct</span>
        <h1 class="text-2xl font-extrabold text-slate-900 mt-0.5" id="evName">Gala d'Excellence Dakar 2026</h1>
        <p class="text-xs text-slate-400 mt-1" id="evDetails">King Fahd Palace, Dakar · Code : GALA-2026</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Indexation Active
        </span>
      </div>
    </div>

    <!-- METRIQUES BENTO -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Photos Reçues</span>
        <p class="text-3xl font-extrabold text-slate-900 mt-1" id="cntPhotos">5</p>
        <span class="text-[11px] text-slate-400">Indexées en collection</span>
      </div>
      <div class="glass-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Invités Reconnus</span>
        <p class="text-3xl font-extrabold text-emerald-600 mt-1" id="cntGuests">1</p>
        <span class="text-[11px] text-slate-400">Passages borne validés</span>
      </div>
      <div class="glass-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contacts WhatsApp</span>
        <p class="text-3xl font-extrabold text-blue-600 mt-1" id="cntContacts">1</p>
        <span class="text-[11px] text-slate-400">Format E.164 normalisé</span>
      </div>
      <div class="glass-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Taux d'Opt-in</span>
        <p class="text-3xl font-extrabold text-amber-500 mt-1" id="rateOptIn">100%</p>
        <span class="text-[11px] text-slate-400">Consentements marketing</span>
      </div>
    </div>

    <!-- SIMULATEUR D'INGESTION PHOTO -->
    <div class="glass-card p-6 rounded-[28px]">
      <h2 class="text-base font-bold text-slate-900 mb-1">Ingestion de photo en direct (Boîtier SFTP)</h2>
      <p class="text-xs text-slate-400 mb-4">Ajoutez une image pour simuler l'envoi direct depuis un Canon R6 Mark II.</p>
      <form onsubmit="handleAddPhoto(event)" class="flex flex-col sm:flex-row gap-3">
        <input type="url" id="inpPhotoUrl" required placeholder="URL de l'image (https://...)" class="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500">
        <button type="submit" id="btnUpload" class="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md shadow-amber-500/20">
          + Indexer la photo
        </button>
      </form>
    </div>

    <!-- LISTE DES PHOTOS -->
    <div>
      <h2 class="text-base font-bold text-slate-800 mb-3">Galerie de l'événement</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3" id="photoGrid"></div>
    </div>
  </main>

  <footer class="border-t border-slate-200/60 py-4 text-center text-xs text-slate-400">
    PicsLive Console Régie · CreatifPics Dakar
  </footer>

  <script>
    async function loadData() {
      const evRes = await fetch('/api/event');
      const evData = await evRes.json();
      if (evData.success) {
        document.getElementById('evName').innerText = evData.event.nom;
        document.getElementById('evDetails').innerText = `${evData.event.lieu} · Code : ${evData.event.codeUnique}`;
        document.getElementById('cntPhotos').innerText = evData.stats.totalPhotos;
        document.getElementById('cntGuests').innerText = evData.stats.totalGuests;
        document.getElementById('cntContacts').innerText = evData.stats.totalContacts;
        document.getElementById('rateOptIn').innerText = evData.stats.marketingOptInRate + '%';
      }

      const phRes = await fetch('/api/photos');
      const phData = await phRes.json();
      if (phData.success) {
        const grid = document.getElementById('photoGrid');
        grid.innerHTML = phData.photos.map(p => `
          <div class="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 aspect-square shadow-sm">
            <img src="${p.url}" class="w-full h-full object-cover">
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-sm">
              ${p.visagesDetectes || 1} visage(s)
            </span>
          </div>
        `).join('');
      }
    }

    async function handleAddPhoto(e) {
      e.preventDefault();
      const url = document.getElementById('inpPhotoUrl').value;
      const btn = document.getElementById('btnUpload');
      btn.innerText = 'Indexation...';
      btn.disabled = true;

      try {
        await fetch('/api/photos', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ url, photographeNom: 'Canon R6 Mark II (SFTP)' })
        });
        document.getElementById('inpPhotoUrl').value = '';
        loadData();
      } finally {
        btn.innerText = '+ Indexer la photo';
        btn.disabled = false;
      }
    }

    loadData();
  </script>
</body>
</html>
"""


class PicsLiveHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"

        # API: /api/event
        if path == "/api/event":
            db = get_db()
            event = db["events"][0] if db["events"] else {}
            photos = db.get("photos", [])
            participations = db.get("participations", [])
            contacts = db.get("contacts", [])
            consents = db.get("consentements", [])
            mkt_ok = len([c for c in consents if c.get("type") == "marketing" and c.get("accepte")])
            mkt_total = len([c for c in consents if c.get("type") == "marketing"])
            rate = int((mkt_ok / mkt_total) * 100) if mkt_total > 0 else 100

            res = {
                "success": True,
                "event": event,
                "stats": {
                    "totalPhotos": len(photos),
                    "totalGuests": len(participations),
                    "totalContacts": len(contacts),
                    "marketingOptInRate": rate,
                }
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # API: /api/photos
        if path == "/api/photos":
            db = get_db()
            res = {"success": True, "photos": db.get("photos", [])}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # API: /api/gallery/<token>
        if path.startswith("/api/gallery/"):
            token = path.split("/api/gallery/")[1]
            db = get_db()
            part = next((p for p in db.get("participations", []) if p.get("jetonGalerie") == token), None)
            if not part:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Galerie introuvable"}).encode("utf-8"))
                return

            contact = next((c for c in db.get("contacts", []) if c.get("id") == part.get("contactId")), {})
            event = next((e for e in db.get("events", []) if e.get("id") == part.get("evenementId")), {})
            liens = [l for l in db.get("liensPhotos", []) if l.get("participationId") == part.get("id") and l.get("statut") == "actif"]

            matched_photos = []
            for lien in liens:
                ph = next((p for p in db.get("photos", []) if p.get("id") == lien.get("photoId")), None)
                if ph:
                    matched_photos.append({
                        **ph,
                        "similarite": lien.get("similarite", 96.0),
                        "zone": lien.get("zone", "sure"),
                        "lienId": lien.get("id"),
                    })

            res = {
                "success": True,
                "gallery": {
                    "nom": contact.get("nom", "Invité d'honneur"),
                    "evenementNom": event.get("nom", "Événement"),
                    "date": event.get("date"),
                    "lieu": event.get("lieu"),
                    "photos": matched_photos,
                }
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # UI PAGES
        if path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_HUB.encode("utf-8"))
            return

        if path == "/borne":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_BORNE.encode("utf-8"))
            return

        if path == "/admin":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_ADMIN.encode("utf-8"))
            return

        if path.startswith("/galerie/"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_GALERIE.encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        data = json.loads(body) if body else {}

        # API POST /api/recognize
        if path == "/api/recognize":
            nom = data.get("nom", "Invité")
            raw_phone = data.get("whatsapp", "")
            whatsapp_e164 = format_whatsapp(raw_phone)
            is_majeur = data.get("isMajeur", True)
            consent_mkt = data.get("consentMarketing", False)

            db = get_db()
            event = db["events"][0]

            contact = next((c for c in db["contacts"] if c.get("whatsappE164") == whatsapp_e164), None)
            if not contact:
                contact = {
                    "id": f"cnt_{int(time.time())}_{random.randint(100, 999)}",
                    "nom": nom,
                    "whatsappE164": whatsapp_e164,
                    "majeur": is_majeur,
                    "creeLe": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                }
                db["contacts"].append(contact)

            token = f"pl_{random.randint(100000, 999999)}_{int(time.time()) % 10000}"
            part_id = f"part_{int(time.time())}_{random.randint(100, 999)}"
            part = {
                "id": part_id,
                "contactId": contact["id"],
                "evenementId": event["id"],
                "jetonGalerie": token,
                "reconnuLe": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "nbPhotos": 2,
                "statutRecuperation": "en_attente",
            }
            db["participations"].append(part)

            # Consentements
            db["consentements"].append({
                "id": f"cst_{int(time.time())}_1",
                "participationId": part_id,
                "type": "photos",
                "accepte": True,
                "versionTexte": "v2.1",
                "horodatage": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "borneId": "borne_ipad_01",
            })
            if is_majeur:
                db["consentements"].append({
                    "id": f"cst_{int(time.time())}_2",
                    "participationId": part_id,
                    "type": "marketing",
                    "accepte": bool(consent_mkt),
                    "versionTexte": "v2.1",
                    "horodatage": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "borneId": "borne_ipad_01",
                })

            # Matching automatique
            all_photos = db.get("photos", [])
            sample = random.sample(all_photos, min(len(all_photos), random.randint(2, 3)))
            for i, ph in enumerate(sample):
                sim = round(random.uniform(94.5, 98.9), 1) if i == 0 else round(random.uniform(88.0, 93.5), 1)
                db["liensPhotos"].append({
                    "id": f"lnk_{int(time.time())}_{random.randint(100, 999)}",
                    "participationId": part_id,
                    "photoId": ph["id"],
                    "similarite": sim,
                    "zone": "sure" if sim >= 92 else "probable",
                    "statut": "actif",
                })

            save_db(db)

            res = {
                "success": True,
                "jetonGalerie": token,
                "galleryUrl": f"http://localhost:{PORT}/galerie/{token}",
                "totalCount": len(sample),
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # API POST /api/photos
        if path == "/api/photos":
            url = data.get("url")
            if url:
                db = get_db()
                event = db["events"][0]
                new_photo = {
                    "id": f"photo_{int(time.time())}",
                    "evenementId": event["id"],
                    "photographeNom": data.get("photographeNom", "Canon R6 Mark II (SFTP)"),
                    "priseLe": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "url": url,
                    "statut": "indexée",
                    "visagesDetectes": random.randint(1, 2),
                }
                db["photos"].insert(0, new_photo)
                save_db(db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "photo": new_photo}).encode("utf-8"))
                return

        # API POST /api/gallery/<token> (Ce n'est pas moi)
        if path.startswith("/api/gallery/"):
            action = data.get("action")
            lien_id = data.get("lienId")
            if action == "remove_photo" and lien_id:
                db = get_db()
                for lien in db.get("liensPhotos", []):
                    if lien.get("id") == lien_id:
                        lien["statut"] = "retire_invite"
                save_db(db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    print(f"PicsLive Premium Server actif sur http://localhost:{PORT}")
    httpd = HTTPServer(("0.0.0.0", PORT), PicsLiveHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
