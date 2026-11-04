# PicsLive · by CreatifPics

Système de récupération de photos d'événement par reconnaissance faciale en temps réel.  
Basé sur le **Cahier des Charges v2.1** (Novembre 2026).

---

## 🌟 Le Design System & Moodboard

* **Palette Chromatique** :
  * **Bleu Nuit Profond** (`#0B192C`) : Immersion, prestige et fond de scène.
  * **Bleu Nuit Abyssal** (`#132F4C`) : Cartes, panneaux et conteneurs glassmorphism (`backdrop-blur-md`).
  * **Or Signature CreatifPics** (`#C08A3E`, dégradé vers `#D4AF37`) : Viseur de scan, boutons tactiles primaires, accents.
  * **Blanc Ivoire / Craie** (`#FDFBF7`) : Typographie haute lisibilité et confort visuel.
* **Typographie** : **Jost** (Google Fonts), géométrique, inspirée des grands boîtiers photographiques télémétriques.
* **Ergonomie Kiosk** :
  * Viseur signature avec coins photographiques dorés et balayage laser animé.
  * Boutons tactiles haute taille (56px minimum) pour iPad / tablettes sur pied antivol.
  * Parcours Kiosk optimisé en moins de 30 secondes pour éviter les files d'attente.

---

## 🏗️ Architecture du MVP

```
PicsLive/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Hub d'accueil et présentation
│   │   ├── borne/page.tsx         # Borne tactile Kiosk (Webcam, Viseur, WhatsApp, QR)
│   │   ├── galerie/[token]/       # Galerie personnelle de l'invité
│   │   ├── admin/page.tsx         # Console Régie (Upload photos, Stats, Moteur)
│   │   └── api/                   # API Routes Next.js
│   │       ├── event/             # Événement en cours & seuils
│   │       ├── photos/            # Ingestion & indexation
│   │       ├── recognize/         # Reconnaissance faciale & création du lot
│   │       └── gallery/[token]/   # Accès galerie & retrait ("Ce n'est pas moi")
│   └── lib/
│       ├── db.ts                  # Base de données locale (data/db.json)
│       ├── engine/                # Moteur biométrique unifié
│       │   ├── types.ts           # Interface FaceEngine
│       │   ├── simulator.ts       # Simulateur biométrique local (calibré v2.1)
│       │   └── rekognition.ts     # Adaptateur AWS Rekognition prêt pour la prod
│       └── utils.ts               # Formatage WhatsApp E.164 (+221 Sénégal)
├── services/
│   └── worker/
│       └── worker.py              # Worker Python Pillow (Redimensionnement, Watermark, Ingestion)
└── data/
    └── db.json                    # Base locale pré-remplie (Événement Gala Dakar 2026)
```

---

## 🚀 Démarrage Rapide

### 1. Variables d'environnement
Le fichier `.env` est déjà configuré en mode **SIMULATOR** (zéro compte cloud requis pour tester) :
```env
FACE_ENGINE_MODE=SIMULATOR
SIMILARITY_THRESHOLD_SURE=92
SIMILARITY_THRESHOLD_PROBABLE=82
NEXT_PUBLIC_DEFAULT_EVENT_CODE=GALA-2026
```

### 2. Lancer le serveur Web (Next.js)
```bash
npm run dev
```
Rendez-vous sur [http://localhost:3000](http://localhost:3000) pour tester :
* **/borne** : Borne Kiosk invité
* **/galerie/pl_demo_token_8a9b7c** : Exemple de galerie personnelle livrée
* **/admin** : Console Régie de l'opérateur

### 3. Lancer le Worker Python (Optionnel)
Pour tester le traitement d'image et le filigrane automatique :
```bash
python services/worker/worker.py --watch
```
Déposez une photo dans `data/sftp_inbox` pour la voir automatiquement redimensionnée, signée et prête pour l'indexation.

