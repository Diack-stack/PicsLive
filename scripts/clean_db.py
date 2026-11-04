import json
import random

with open("data/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

# Keep only real uploaded photos
real_photos = [
    p for p in db.get("photos", [])
    if not p.get("url", "").startswith("https://images.unsplash.com")
    and not p.get("id", "").startswith("photo_0")
]
print(f"Retained {len(real_photos)} real photos:")
for p in real_photos:
    print(f"  - {p['id']}: {p['url']}")

db["photos"] = real_photos
valid_photo_ids = set(p["id"] for p in real_photos)

# Clean visages and liensPhotos
db["visages"] = [v for v in db.get("visages", []) if v.get("photoId") in valid_photo_ids]
db["liensPhotos"] = [l for l in db.get("liensPhotos", []) if l.get("photoId") in valid_photo_ids]

# Ensure each participation has links to only real photos
for part in db.get("participations", []):
    part_id = part["id"]
    current_links = [l for l in db["liensPhotos"] if l.get("participationId") == part_id]
    if not current_links and real_photos:
        sample = random.sample(real_photos, min(len(real_photos), 2))
        for i, ph in enumerate(sample):
            sim = 96.5 if i == 0 else 89.2
            db["liensPhotos"].append({
                "id": f"lnk_{part_id}_{i}",
                "participationId": part_id,
                "photoId": ph["id"],
                "similarite": sim,
                "zone": "sure" if sim >= 92 else "probable",
                "statut": "actif"
            })

with open("data/db.json", "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("Database successfully updated!")
