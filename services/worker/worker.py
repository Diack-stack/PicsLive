"""
PicsLive - Worker Python (Ingestion, Redimensionnement, Signature, Indexation)
Spécification Cahier des charges v2.1 - Section 2 & Section 10
"""

import os
import sys
import time
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

# Dossiers surveillés
BASE_DIR = Path(__file__).resolve().parent.parent.parent
WATCH_DIR = BASE_DIR / "data" / "sftp_inbox"
PROCESSED_DIR = BASE_DIR / "data" / "processed_photos"
DB_FILE = BASE_DIR / "data" / "db.json"

WATCH_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def apply_picslive_watermark(image: Image.Image, text: str = "PicsLive · CreatifPics") -> Image.Image:
    """Applique une signature discrète dans le coin inférieur droit."""
    img_copy = image.convert("RGBA")
    txt_layer = Image.new("RGBA", img_copy.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt_layer)

    # Coordonnées coin bas droit
    width, height = img_copy.size
    margin = int(width * 0.03)
    font_size = max(16, int(width * 0.022))

    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    # Boîte dorée semi-transparente
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = width - tw - margin
    y = height - th - margin

    # Fond doux
    draw.rectangle([x - 10, y - 6, x + tw + 10, y + th + 6], fill=(11, 25, 44, 160))
    # Texte or PicsLive (#C08A3E)
    draw.text((x, y), text, font=font, fill=(192, 138, 62, 230))

    combined = Image.alpha_composite(img_copy, txt_layer)
    return combined.convert("RGB")


def process_image(file_path: Path) -> dict:
    """Redimensionne en JPEG de travail (2-4 Mo) et appose la signature PicsLive."""
    print(f"[Worker] Traitement de : {file_path.name}")
    try:
        with Image.open(file_path) as img:
            # Orientation EXIF
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # Redimensionnement max 2048px de large
            max_size = 2048
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

            # Filtre identité subtil (Signature maison : léger boost de contraste & chaleur)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.05)

            # Signature
            final_img = apply_picslive_watermark(img)

            # Sauvegarde en JPEG de travail optimisé
            out_filename = f"live_{file_path.stem}.jpg"
            out_path = PROCESSED_DIR / out_filename
            final_img.save(out_path, "JPEG", quality=88, optimize=True)

            print(f"[Worker] Photo optimisée sauvegardée : {out_path}")
            return {
                "success": True,
                "filename": out_filename,
                "path": str(out_path),
                "width": final_img.width,
                "height": final_img.height,
            }
    except Exception as e:
        print(f"[Worker] Erreur traitement {file_path.name}: {e}")
        return {"success": False, "error": str(e)}


def watch_inbox():
    """Surveille le dossier SFTP pour ingestion en direct."""
    print(f"[*] PicsLive Worker démarré.")
    print(f"[*] Dossier d'écoute SFTP : {WATCH_DIR}")
    print(f"[*] Appuyez sur Ctrl+C pour stopper.\n")

    while True:
        try:
            for item in WATCH_DIR.glob("*.*"):
                if item.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    # Laisser le temps au transfert SFTP de se terminer
                    time.sleep(0.5)
                    res = process_image(item)
                    if res.get("success"):
                        # Déplacer ou supprimer de l'inbox
                        item.unlink(missing_ok=True)
            time.sleep(1.0)
        except KeyboardInterrupt:
            print("\n[Worker] Arrêt.")
            break
        except Exception as e:
            print(f"[Worker Error] {e}")
            time.sleep(2.0)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--watch":
        watch_inbox()
    else:
        print("Worker prêt. Lancez avec --watch pour surveiller le dossier SFTP data/sftp_inbox.")

