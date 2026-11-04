"""
PicsLive - Serveur MVP Haute Couture (Dark Luxury + Drag & Drop)
Direction Artistique : ADN Bleu Nuit Profond & Or (Cahier des charges)
avec Drag & Drop de fichiers locaux réels (JPG, PNG) et indexation automatique.
"""

import sys
import os
import json
import time
import random
import base64
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# Import Pillow pour le traitement d'image réel si disponible
try:
    from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
DB_FILE = DATA_DIR / "db.json"
PORT = 3000

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

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

def optimize_and_sign_image(input_path: Path, output_path: Path):
    """Optimise et appose la signature PicsLive si Pillow est disponible."""
    if not PIL_AVAILABLE:
        return
    try:
        with Image.open(input_path) as img:
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass
            max_size = 1800
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Signature subtile
            img_rgba = img.convert("RGBA")
            txt_layer = Image.new("RGBA", img_rgba.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(txt_layer)
            w, h = img_rgba.size
            font_size = max(14, int(w * 0.02))
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()
            
            text = "PicsLive · CreatifPics"
            bbox = draw.textbbox((0, 0), text, font=font)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            margin = int(w * 0.025)
            x = w - tw - margin
            y = h - th - margin
            draw.rectangle([x - 8, y - 5, x + tw + 8, y + th + 5], fill=(7, 13, 24, 175))
            draw.text((x, y), text, font=font, fill=(212, 175, 55, 235))
            
            combined = Image.alpha_composite(img_rgba, txt_layer)
            combined.convert("RGB").save(output_path, "JPEG", quality=88, optimize=True)
    except Exception as e:
        print(f"Erreur d'optimisation image: {e}")

# ==============================================================================
# PAGES HTML - BLEU NUIT OBSIDIENNE & OR PRESTIGE
# ==============================================================================

HTML_HUB = """<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PicsLive · by CreatifPics</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            serif: ['"Playfair Display"', 'serif'],
          },
          colors: {
            night: '#070D18',
            abyss: '#0C1427',
            surface: '#111C35',
            surfaceLight: '#182747',
            gold: '#D4AF37',
            goldMuted: '#C08A3E',
            goldAmber: '#F59E0B',
            chalk: '#F8FAFC',
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #070D18; color: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; }
    .luxury-card {
      background: rgba(17, 28, 53, 0.72);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(212, 175, 55, 0.16);
      box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.08);
    }
    .luxury-card-hover {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .luxury-card-hover:hover {
      border-color: rgba(212, 175, 55, 0.4);
      transform: translateY(-3px);
      box-shadow: 0 25px 60px -15px rgba(212, 175, 55, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    }
    .btn-gold {
      background: linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #B8860B 100%);
      color: #070D18;
      box-shadow: 0 12px 28px -6px rgba(212, 175, 55, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.6);
      transition: all 0.25s ease;
    }
    .btn-gold:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
      box-shadow: 0 16px 36px -6px rgba(212, 175, 55, 0.48), inset 0 1px 1px rgba(255, 255, 255, 0.8);
    }
    .btn-gold:active {
      transform: scale(0.98);
    }
    .photo-stack { perspective: 1200px; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between relative overflow-x-hidden antialiased selection:bg-[#D4AF37] selection:text-[#070D18]">
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#D4AF37]/15 via-[#1E3A8A]/15 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>
  <div class="absolute top-96 -right-20 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

  <!-- NAVIGATION HEADER -->
  <header class="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#182747] to-[#0C1427] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-lg">
        <svg class="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
        </svg>
      </div>
      <div>
        <span class="text-lg font-extrabold tracking-tight text-white">Pics<span class="text-[#D4AF37]">Live</span></span>
        <span class="block text-[10px] text-slate-400 font-semibold tracking-widest uppercase">by CreatifPics</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111C35]/80 border border-[#D4AF37]/20 shadow-sm text-xs font-semibold text-slate-300">
        <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        <span>Version 2.1 Studio</span>
      </div>
      <a href="/admin" class="px-4 py-2 rounded-full bg-[#111C35] hover:bg-[#182747] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] transition shadow-sm">
        Régie Opérateur
      </a>
    </div>
  </header>

  <!-- HERO SECTION -->
  <main class="max-w-6xl mx-auto px-6 pt-6 pb-16 flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111C35]/90 border border-[#D4AF37]/25 shadow-sm text-slate-300 text-xs font-semibold mb-6">
      <span class="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">Live</span>
      Reconnaissance faciale instantanée pour événements
    </div>

    <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
      Vos photos d'événement,<br>
      retrouvées en <span class="font-serif italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#C08A3E]">un regard.</span>
    </h1>

    <p class="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed font-normal">
      Une borne tactile raffinée, un selfie instantané et vos clichés haute résolution sont livrés sur votre smartphone en direct.
    </p>

    <div class="flex flex-col sm:flex-row items-center gap-3.5 mb-16 w-full sm:w-auto">
      <a href="/borne" class="btn-gold w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2.5">
        <span>Lancer la Borne Invité</span>
        <svg class="w-4 h-4 text-[#070D18]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </a>
      <a href="/galerie/pl_demo_token_8a9b7c" class="w-full sm:w-auto px-7 py-4 rounded-full bg-[#111C35]/80 hover:bg-[#182747] text-slate-200 border border-[#D4AF37]/25 font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition">
        <span>Voir la Galerie Démo</span>
      </a>
    </div>

    <!-- COMPOSITION EN ÉVENTAIL 3D -->
    <div class="relative w-full max-w-3xl h-64 sm:h-76 flex items-center justify-center mb-16 photo-stack">
      <div class="absolute w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 transform -rotate-12 -translate-x-32 sm:-translate-x-44 translate-y-3 transition-transform duration-500 hover:-translate-y-1">
        <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#070D18]/85 via-transparent to-transparent"></div>
        <span class="absolute bottom-3 left-3 text-[11px] font-bold text-white tracking-wide">Gala Dakar 2026</span>
      </div>

      <div class="absolute w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 transform rotate-12 translate-x-32 sm:translate-x-44 translate-y-3 transition-transform duration-500 hover:-translate-y-1">
        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#070D18]/85 via-transparent to-transparent"></div>
        <span class="absolute bottom-3 left-3 text-[11px] font-bold text-white tracking-wide">Soirée Privée</span>
      </div>

      <div class="absolute w-48 sm:w-60 h-60 sm:h-72 rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-2 border-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300 z-10">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#070D18]/90 via-transparent to-transparent"></div>
        <div class="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-[#070D18]/85 backdrop-blur-md border border-[#D4AF37]/40 text-[10px] font-extrabold text-[#D4AF37] shadow-sm flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          Reconnu 98.4%
        </div>
        <div class="absolute bottom-4 left-4 text-left">
          <span class="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">Mariama Ba</span>
          <p class="text-xs font-semibold text-white">2 photos livrées en direct</p>
        </div>
      </div>
    </div>

    <!-- BENTO GRID -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left max-w-5xl">
      <div class="luxury-card luxury-card-hover p-7 rounded-[28px]">
        <div class="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] mb-5">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
            <circle cx="12" cy="13" r="3"></circle>
          </svg>
        </div>
        <h3 class="text-base font-bold text-white mb-1.5">Borne Kiosk Tactile</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Viseur dynamique avec autofocus simulé. Moins de 30 secondes pour retrouver toutes ses photos.
        </p>
      </div>

      <div class="luxury-card luxury-card-hover p-7 rounded-[28px]">
        <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-5">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>
        <h3 class="text-base font-bold text-white mb-1.5">Galerie Mobile Live</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Accès immédiat par QR Code personnel. Vos clichés s'ajoutent en temps réel pendant la réception.
        </p>
      </div>

      <div class="luxury-card luxury-card-hover p-7 rounded-[28px]">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <h3 class="text-base font-bold text-white mb-1.5">Conformité CDP & Sécurité</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Conforme à la législation CDP Sénégal (Loi 2008-12). Consentements horodatés et purge automatique.
        </p>
      </div>
    </div>
  </main>

  <footer class="max-w-6xl mx-auto w-full px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
    <p>PicsLive, by CreatifPics Studio · Dakar, Sénégal</p>
    <div class="flex items-center gap-6">
      <a href="/borne" class="hover:text-slate-300 transition">Borne Kiosk</a>
      <a href="/admin" class="hover:text-slate-300 transition">Console Régie</a>
      <a href="/galerie/pl_demo_token_8a9b7c" class="hover:text-slate-300 transition">Galerie Démo</a>
    </div>
  </footer>
</body>
</html>
"""

# HTML_BORNE and HTML_GALERIE remain unchanged from previous high-end versions

HTML_BORNE = """<!DOCTYPE html>
<html lang="fr" class="dark">
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
    body { background-color: #070D18; color: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; user-select: none; }
    .luxury-card {
      background: rgba(17, 28, 53, 0.82);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(212, 175, 55, 0.2);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.08);
    }
    .btn-gold {
      background: linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #B8860B 100%);
      color: #070D18;
      box-shadow: 0 12px 28px -6px rgba(212, 175, 55, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.6);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-gold:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .btn-gold:active { transform: scale(0.98); }
    .kiosk-btn { min-height: 58px; touch-action: manipulation; }
    @keyframes goldLaser { 0%, 100% { top: 7%; opacity: 0.7; } 50% { top: 89%; opacity: 1; } }
    .laser-line { animation: goldLaser 2.3s ease-in-out infinite; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between relative overflow-hidden antialiased">
  <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#D4AF37]/12 rounded-full blur-[120px] pointer-events-none -z-10"></div>
  <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1E3A8A]/25 rounded-full blur-[120px] pointer-events-none -z-10"></div>

  <header class="max-w-4xl mx-auto w-full px-6 py-5 flex items-center justify-between z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-[#111C35] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-lg">
        <svg class="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
        </svg>
      </div>
      <div>
        <span class="text-base font-extrabold tracking-tight text-white">Pics<span class="text-[#D4AF37]">Live</span></span>
        <span class="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">CreatifPics Dakar</span>
      </div>
    </div>
    <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111C35]/90 border border-[#D4AF37]/25 shadow-sm text-xs font-semibold text-slate-300">
      <span class="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
      <span id="stepIndicator">Étape 1 sur 3</span>
    </div>
  </header>

  <main class="flex-1 flex items-center justify-center p-6 z-10 max-w-xl w-full mx-auto" id="mainContainer">
    <!-- ÉTAPE 1 : ACCUEIL -->
    <div id="stepWelcome" class="text-center w-full animate-fadeIn">
      <div class="w-20 h-20 rounded-3xl bg-[#111C35] border border-[#D4AF37]/35 text-[#D4AF37] mx-auto flex items-center justify-center shadow-xl mb-6">
        <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
      <span class="inline-block px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold tracking-wider uppercase mb-3">
        Gala d'Excellence Dakar
      </span>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
        Vos photos sont prêtes.
      </h1>
      <p class="text-sm text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
        Placez-vous devant l'objectif. Le système identifie vos apparitions sur les clichés de la soirée et crée votre collection privée.
      </p>
      <button onclick="goToStep('consent')" class="btn-gold kiosk-btn w-full py-4 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-3">
        <span>Retrouver mes photos</span>
        <svg class="w-5 h-5 text-[#070D18]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>
      <p class="mt-8 text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>Conforme CDP Sénégal · Données biométriques protégées</span>
      </p>
    </div>

    <!-- ÉTAPE 2 : CONSENTEMENT -->
    <div id="stepConsent" class="luxury-card p-8 sm:p-10 rounded-[32px] w-full hidden">
      <div class="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center mb-5">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      </div>
      <h2 class="text-xl font-bold text-white mb-2">Consentement à l'analyse faciale</h2>
      <p class="text-xs text-slate-400 leading-relaxed mb-6">
        Un selfie temporaire sera capturé pour comparer vos traits aux photos prises par nos photographes. Aucune empreinte n'est conservée après la clôture de l'événement.
      </p>
      <div class="bg-[#070D18]/80 p-4 rounded-2xl border border-white/10 mb-8">
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" id="chkConsentPhotos" checked class="mt-0.5 w-4 h-4 accent-[#D4AF37] rounded cursor-pointer">
          <span class="text-xs text-slate-200 font-medium">J'accepte l'analyse de mon visage exclusivement pour la remise de mes photos de cet événement.</span>
        </label>
      </div>
      <div class="flex gap-3">
        <button onclick="goToStep('welcome')" class="kiosk-btn flex-1 py-3.5 rounded-2xl bg-[#182747] border border-white/10 text-slate-300 font-semibold text-sm">Retour</button>
        <button onclick="startCaptureFlow()" class="btn-gold kiosk-btn flex-1 py-3.5 rounded-2xl font-bold text-sm">Autoriser & Scanner</button>
      </div>
    </div>

    <!-- ÉTAPE 3 : CAPTURE CAMERA -->
    <div id="stepCapture" class="flex flex-col items-center w-full hidden">
      <div class="relative w-72 sm:w-80 h-96 sm:h-[400px] rounded-[36px] overflow-hidden bg-[#070D18] border-2 border-[#D4AF37]/30 shadow-2xl flex items-center justify-center">
        <video id="webcamVideo" autoplay playsinline muted class="w-full h-full object-cover transform scale-x-[-1]"></video>
        <div id="cameraFallback" class="hidden text-center p-6 flex flex-col items-center text-white">
          <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 text-[#D4AF37]">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <p class="text-xs font-semibold">Mode Caméra Prêt</p>
          <p class="text-[11px] text-slate-400 mt-1">Appuyez sur Prendre le selfie</p>
        </div>
        <div class="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-lg pointer-events-none"></div>
        <div class="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-lg pointer-events-none"></div>
        <div class="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-lg pointer-events-none"></div>
        <div class="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] rounded-br-lg pointer-events-none"></div>
        <div class="laser-line absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_10px_rgba(212,175,55,0.9)] pointer-events-none"></div>
        <div id="countdownBox" class="absolute inset-0 bg-[#070D18]/80 backdrop-blur-sm flex items-center justify-center hidden z-20">
          <span id="countdownNumber" class="text-6xl font-extrabold text-[#D4AF37] animate-ping">3</span>
        </div>
      </div>
      <div class="mt-6 flex gap-3 w-72 sm:w-80">
        <button onclick="goToStep('consent')" class="kiosk-btn px-5 py-3 rounded-2xl bg-[#111C35] border border-white/10 text-slate-300 font-semibold shadow-sm">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button onclick="triggerPhoto()" class="btn-gold kiosk-btn flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
          <span>Prendre le selfie</span>
        </button>
      </div>
    </div>

    <!-- ÉTAPE 4 : CHARGEMENT -->
    <div id="stepAnalyzing" class="text-center w-full hidden">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
      <h2 class="text-xl font-bold text-white mb-1">Recherche en cours</h2>
      <p class="text-xs text-slate-400">Comparaison biométrique avec l'ensemble des photos de la soirée...</p>
    </div>

    <!-- ÉTAPE 5 : FORMULAIRE -->
    <div id="stepDetails" class="luxury-card p-8 sm:p-10 rounded-[32px] w-full hidden">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">Visage détecté</h2>
          <p class="text-xs text-slate-400">Où souhaitez-vous recevoir votre lien d'accès ?</p>
        </div>
      </div>
      <form onsubmit="handleFormSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Votre Nom & Prénom</label>
          <input type="text" id="inpNom" required placeholder="ex: Aminata Sow" class="w-full bg-[#070D18] border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition shadow-inner">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Numéro WhatsApp</label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 px-2.5 py-1 rounded-lg bg-[#182747] border border-white/5 text-[11px] font-bold text-[#D4AF37]">🇸🇳 +221</span>
            <input type="tel" id="inpTel" required placeholder="77 123 45 67" class="w-full bg-[#070D18] border border-white/10 rounded-2xl py-3.5 pl-24 pr-4 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition shadow-inner">
          </div>
          <p class="text-[11px] text-slate-400 mt-1.5">Votre numéro sert d'identifiant unique sécurisé pour votre galerie.</p>
        </div>
        <div class="pt-2 space-y-2">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" id="chkMajeur" checked class="w-4 h-4 accent-[#D4AF37] rounded">
            <span class="text-xs text-slate-300 font-medium">J'ai 18 ans ou plus.</span>
          </label>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" id="chkMarketing" class="w-4 h-4 accent-[#D4AF37] rounded">
            <span class="text-xs text-slate-400">J'accepte de recevoir les invitations exclusives de CreatifPics.</span>
          </label>
        </div>
        <button type="submit" id="btnSubmitForm" class="btn-gold kiosk-btn w-full mt-4 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
          <span>Générer mon QR Code</span>
          <svg class="w-4 h-4 text-[#070D18]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </form>
    </div>

    <!-- ÉTAPE 6 : REMISE QR CODE -->
    <div id="stepResult" class="luxury-card p-8 sm:p-10 rounded-[36px] w-full text-center hidden animate-fadeIn">
      <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold mb-3">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span id="badgeFound">2 photos trouvées pour vous</span>
      </div>
      <h2 class="text-2xl font-extrabold text-white mb-1">Scannez pour ouvrir</h2>
      <p class="text-xs text-slate-400 mb-6">Pointez l'appareil photo de votre smartphone vers l'écran</p>
      <div class="bg-white p-5 rounded-3xl inline-block shadow-2xl border-4 border-[#D4AF37]/30 mb-6">
        <canvas id="qrCanvas" class="w-52 h-52 sm:w-60 sm:h-60 mx-auto"></canvas>
      </div>
      <div class="mb-6">
        <a id="lnkDirectGallery" href="#" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline">
          <span>Ouvrir la galerie directement sur cet écran</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
        <span>Retour automatique dans <strong id="resetSec" class="text-white">60</strong>s</span>
        <button onclick="resetKiosk()" class="text-[#D4AF37] hover:text-white font-bold">Terminer</button>
      </div>
    </div>
  </main>

  <footer class="max-w-4xl mx-auto w-full text-center py-4 text-xs text-slate-500">
    PicsLive · Système de récupération photo instantanée · CreatifPics Dakar
  </footer>

  <script>
    let currentStream = null;
    let resetInterval = null;

    function goToStep(step) {
      ['welcome', 'consent', 'capture', 'analyzing', 'details', 'result'].forEach(s => {
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
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PicsLive · Ma Galerie Personnelle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #070D18; color: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; }
    .luxury-card {
      background: rgba(17, 28, 53, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(212, 175, 55, 0.18);
      box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.7);
    }
    .floating-bar {
      background: rgba(17, 28, 53, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(212, 175, 55, 0.25);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.15);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased selection:bg-[#D4AF37] selection:text-[#070D18]">
  <div class="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

  <header class="sticky top-0 z-40 bg-[#070D18]/85 backdrop-blur-md border-b border-white/5 px-5 py-4">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-[#111C35] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
          <svg class="w-4 h-4 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"></circle><path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path></svg>
        </div>
        <span class="text-sm font-extrabold tracking-tight text-white">Pics<span class="text-[#D4AF37]">Live</span></span>
      </div>

      <button onclick="shareWhatsApp()" class="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95">
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.146-.541-1.859-.77-3.045-2.664-3.138-2.787-.092-.122-.751-.998-.751-1.905 0-.907.476-1.352.645-1.536.17-.184.37-.23.493-.23.123 0 .247.002.354.007.112.006.262-.042.41.314.154.37.524 1.277.57 1.37.046.092.077.2.015.323-.062.123-.092.2-.185.307-.092.108-.195.242-.278.325-.093.093-.19.195-.082.38.108.185.479.79 1.028 1.279.707.63 1.303.825 1.488.918.185.092.293.077.4-.046.108-.123.462-.538.585-.723.123-.185.246-.154.415-.092.17.061 1.077.508 1.262.6.185.092.308.138.354.215.046.077.046.446-.098.851z"/></svg>
        <span>Partager</span>
      </button>
    </div>
  </header>

  <section class="px-5 pt-6 pb-4 max-w-2xl mx-auto w-full">
    <div class="luxury-card p-6 rounded-[32px]">
      <div class="flex items-center gap-2 mb-2">
        <span class="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[11px] font-bold">Collection Personnelle</span>
        <span class="text-xs text-slate-500">·</span>
        <span class="text-xs text-slate-400" id="eventDate">15 Nov 2026</span>
      </div>

      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" id="guestName">
        Bienvenue
      </h1>
      <p class="text-xs text-slate-400 mt-1" id="eventInfo">Gala d'Excellence Dakar · King Fahd Palace</p>
    </div>
  </section>

  <main class="flex-1 px-5 pb-24 max-w-2xl mx-auto w-full">
    <div class="flex items-center justify-between my-3 px-1">
      <h2 class="text-sm font-bold text-slate-200" id="photoCountTitle">Vos photos</h2>
      <span class="text-xs text-slate-400 font-medium">Actualisation en direct</span>
    </div>

    <div class="grid grid-cols-2 gap-3.5" id="galleryGrid"></div>
  </main>

  <div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 floating-bar rounded-full px-5 py-2.5 flex items-center gap-3">
    <button onclick="shareWhatsApp()" class="px-4 py-2 rounded-full bg-[#25D366] text-white font-bold text-xs flex items-center gap-2 shadow-sm">
      <span>Partager WhatsApp</span>
    </button>
    <span class="text-xs text-slate-400">·</span>
    <span class="text-xs text-slate-300 font-medium" id="floatingCount">2 photos</span>
  </div>

  <footer class="max-w-2xl mx-auto w-full text-center py-6 text-xs text-slate-500 border-t border-white/5">
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
          document.getElementById('floatingCount').innerText = `${data.gallery.photos.length} photos`;

          const grid = document.getElementById('galleryGrid');
          if (data.gallery.photos.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-xs text-slate-400 py-12">Aucune photo pour le moment. Votre galerie se remplira dès que les photographes captureront votre visage.</p>';
          } else {
            grid.innerHTML = data.gallery.photos.map(p => `
              <div class="group relative rounded-[26px] overflow-hidden bg-[#111C35] border border-white/10 aspect-[3/4] shadow-md" id="card_${p.lienId}">
                <img src="${p.url}" class="w-full h-full object-cover">
                <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#070D18]/85 backdrop-blur-md text-[10px] font-extrabold text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm">
                  ${p.similarite ? p.similarite + '%' : 'Reconnu'}
                </span>
                
                <div class="absolute inset-0 bg-gradient-to-t from-[#070D18]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <a href="${p.url}" target="_blank" download class="px-2.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-100">
                    Enregistrer
                  </a>
                  <button onclick="removePhoto('${p.lienId}')" class="px-2.5 py-1.5 rounded-xl bg-[#111C35]/90 text-slate-300 text-xs hover:text-rose-400 font-medium border border-white/10">
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

# ==============================================================================
# HTML_ADMIN AVEC ZONE DE DRAG & DROP DE VRAIS FICHIERS LOCAUX
# ==============================================================================

HTML_ADMIN = """<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PicsLive · Console Régie</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #070D18; color: #F8FAFC; font-family: 'Plus Jakarta Sans', sans-serif; }
    .luxury-card {
      background: rgba(17, 28, 53, 0.72);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(212, 175, 55, 0.16);
      box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.6);
    }
    .btn-gold {
      background: linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #B8860B 100%);
      color: #070D18;
      transition: all 0.2s ease;
    }
    .btn-gold:hover { filter: brightness(1.08); }
    
    /* Zone de Drag & Drop */
    .drop-zone {
      border: 2px dashed rgba(212, 175, 55, 0.3);
      transition: all 0.25s ease;
    }
    .drop-zone.dragover {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.08);
      transform: scale(1.01);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased selection:bg-[#D4AF37] selection:text-[#070D18]">
  <header class="border-b border-white/5 bg-[#070D18]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#111C35] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
          <svg class="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"></circle><path d="M3 9a2 2 0 0 1 2-2h1.5a2 2 0 0 0 1.6-.8L9 4h6l.9 2.2a2 2 0 0 0 1.6.8H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path></svg>
        </div>
        <div>
          <span class="text-base font-extrabold tracking-tight text-white">Pics<span class="text-[#D4AF37]">Live</span></span>
          <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#111C35] text-[#D4AF37] border border-[#D4AF37]/30 uppercase">Régie Studio</span>
        </div>
      </div>
      <a href="/borne" target="_blank" class="px-4 py-2 rounded-full bg-[#111C35] hover:bg-[#182747] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold transition">
        Ouvrir la Borne Kiosk &rarr;
      </a>
    </div>
  </header>

  <main class="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
    <div class="luxury-card p-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Session en direct</span>
        <h1 class="text-2xl font-extrabold text-white mt-0.5" id="evName">Gala d'Excellence Dakar 2026</h1>
        <p class="text-xs text-slate-400 mt-1" id="evDetails">King Fahd Palace, Dakar · Code : GALA-2026</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3.5 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          Indexation Active
        </span>
      </div>
    </div>

    <!-- METRIQUES BENTO -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="luxury-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Photos Reçues</span>
        <p class="text-3xl font-extrabold text-white mt-1" id="cntPhotos">5</p>
        <span class="text-[11px] text-slate-500">Indexées en collection</span>
      </div>
      <div class="luxury-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Invités Reconnus</span>
        <p class="text-3xl font-extrabold text-[#10B981] mt-1" id="cntGuests">1</p>
        <span class="text-[11px] text-slate-500">Passages borne validés</span>
      </div>
      <div class="luxury-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contacts WhatsApp</span>
        <p class="text-3xl font-extrabold text-blue-400 mt-1" id="cntContacts">1</p>
        <span class="text-[11px] text-slate-500">Format E.164 normalisé</span>
      </div>
      <div class="luxury-card p-5 rounded-[24px]">
        <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Taux d'Opt-in</span>
        <p class="text-3xl font-extrabold text-[#D4AF37] mt-1" id="rateOptIn">100%</p>
        <span class="text-[11px] text-slate-500">Consentements marketing</span>
      </div>
    </div>

    <!-- ZONE DE DRAG & DROP DE VRAIS FICHIERS LOCAUX -->
    <div class="luxury-card p-7 rounded-[28px] space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-white">Ingestion de vraies photos (Fichiers locaux)</h2>
          <p class="text-xs text-slate-400">Glissez-déposez vos fichiers JPG ou PNG pour les ajouter au flux de l'événement.</p>
        </div>
        <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#182747] text-[#D4AF37] font-semibold border border-[#D4AF37]/20">
          Canon SFTP Simulator
        </span>
      </div>

      <!-- Zone Drag and Drop -->
      <div id="dropZone" class="drop-zone p-8 rounded-[24px] bg-[#070D18]/60 flex flex-col items-center justify-center text-center cursor-pointer group">
        <input type="file" id="filePicker" multiple accept="image/jpeg,image/png,image/webp" class="hidden">
        
        <div class="w-14 h-14 rounded-2xl bg-[#111C35] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3 group-hover:scale-105 transition-transform">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        
        <p class="text-sm font-bold text-white mb-1">
          Glissez-déposez vos photos ici, ou <span class="text-[#D4AF37] underline">parcourez vos dossiers</span>
        </p>
        <p class="text-xs text-slate-400">Prend en charge JPG, PNG jusqu'à 25 Mo par fichier · Optimisation et indexation faciale automatiques</p>
        
        <div id="uploadStatus" class="mt-4 text-xs font-semibold text-[#D4AF37] hidden">
          Traitement en cours...
        </div>
      </div>

      <!-- Option alternative : URL -->
      <details class="text-xs text-slate-400 cursor-pointer pt-2">
        <summary class="hover:text-slate-200 transition font-medium">Ou injecter via une URL d'image web</summary>
        <form onsubmit="handleAddPhotoUrl(event)" class="flex flex-col sm:flex-row gap-3 mt-3">
          <input type="url" id="inpPhotoUrl" placeholder="https://images.unsplash.com/..." class="flex-1 bg-[#070D18] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]">
          <button type="submit" id="btnUploadUrl" class="btn-gold px-5 py-2.5 rounded-2xl font-bold text-xs">
            + Indexer par URL
          </button>
        </form>
      </details>
    </div>

    <!-- LISTE DES PHOTOS -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-bold text-slate-200">Galerie de l'événement</h2>
        <span class="text-xs text-slate-400" id="galleryCountLabel">5 clichés indexés</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5" id="photoGrid"></div>
    </div>
  </main>

  <footer class="border-t border-white/5 py-4 text-center text-xs text-slate-500">
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
        document.getElementById('galleryCountLabel').innerText = `${evData.stats.totalPhotos} clichés indexés`;
      }

      const phRes = await fetch('/api/photos');
      const phData = await phRes.json();
      if (phData.success) {
        const grid = document.getElementById('photoGrid');
        grid.innerHTML = phData.photos.map(p => `
          <div class="relative rounded-[22px] overflow-hidden bg-[#111C35] border border-white/10 aspect-square shadow-sm group">
            <img src="${p.url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#070D18]/85 backdrop-blur-md text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm">
              ${p.visagesDetectes || 1} visage(s)
            </span>
          </div>
        `).join('');
      }
    }

    // Gestion du Drag & Drop
    const dropZone = document.getElementById('dropZone');
    const filePicker = document.getElementById('filePicker');
    const uploadStatus = document.getElementById('uploadStatus');

    dropZone.addEventListener('click', () => filePicker.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) uploadFiles(files);
    });

    filePicker.addEventListener('change', () => {
      if (filePicker.files.length > 0) uploadFiles(filePicker.files);
    });

    async function uploadFiles(files) {
      uploadStatus.classList.remove('hidden');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uploadStatus.innerText = `Indexation de ${file.name} (${i + 1}/${files.length})...`;
        
        const base64Data = await readFileAsBase64(file);
        await fetch('/api/photos/upload', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            filename: file.name,
            data: base64Data,
            photographeNom: 'Canon R6 Mark II (SFTP)'
          })
        });
      }
      uploadStatus.innerText = 'Indexation terminée avec succès !';
      setTimeout(() => uploadStatus.classList.add('hidden'), 2500);
      loadData();
    }

    function readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    async function handleAddPhotoUrl(e) {
      e.preventDefault();
      const url = document.getElementById('inpPhotoUrl').value;
      const btn = document.getElementById('btnUploadUrl');
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
        btn.innerText = '+ Indexer par URL';
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

        # SERVIR LES FICHIERS UPLOADÉS LOCAUX /uploads/<filename>
        if path.startswith("/uploads/"):
            filename = path.replace("/uploads/", "")
            file_path = UPLOADS_DIR / filename
            if file_path.exists() and file_path.is_file():
                self.send_response(200)
                ext = file_path.suffix.lower()
                content_type = "image/jpeg"
                if ext == ".png":
                    content_type = "image/png"
                elif ext == ".webp":
                    content_type = "image/webp"
                self.send_header("Content-Type", content_type)
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.end_headers()
                return

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

        # NOUVEAU : UPLOAD DE VRAIS FICHIERS LOCAUX
        if path == "/api/photos/upload":
            raw_data = data.get("data", "")
            orig_filename = data.get("filename", "upload.jpg")
            
            # Découper le format Data URL base64
            if "," in raw_data:
                header, encoded = raw_data.split(",", 1)
            else:
                encoded = raw_data

            file_bytes = base64.b64decode(encoded)
            ext = Path(orig_filename).suffix or ".jpg"
            safe_name = f"photo_{int(time.time())}_{random.randint(100, 999)}{ext}"
            saved_path = UPLOADS_DIR / safe_name

            with open(saved_path, "wb") as f:
                f.write(file_bytes)

            # Optimisation avec Pillow
            optimize_and_sign_image(saved_path, saved_path)

            db = get_db()
            event = db["events"][0]
            new_photo = {
                "id": f"photo_{int(time.time())}_{random.randint(10, 99)}",
                "evenementId": event["id"],
                "photographeNom": data.get("photographeNom", "Canon R6 Mark II (SFTP)"),
                "priseLe": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "url": f"/uploads/{safe_name}",
                "statut": "indexée",
                "visagesDetectes": random.randint(1, 3),
            }
            db["photos"].insert(0, new_photo)
            save_db(db)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "photo": new_photo}).encode("utf-8"))
            return

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

        # API POST /api/photos (via URL)
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
    print(f"PicsLive Dark Luxury Server actif sur http://localhost:{PORT}")
    httpd = HTTPServer(("0.0.0.0", PORT), PicsLiveHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
