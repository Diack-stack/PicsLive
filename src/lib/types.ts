export interface EventData {
  id: string;
  nom: string;
  type: string;
  lieu: string;
  date: string;
  statut: "planifié" | "test" | "en_cours" | "clos" | "archivé";
  codeUnique: string;
  collectionMoteur: string;
  banniereUrl?: string;
  fenetreJours: number;
  modeJeunesse: boolean;
  optionPartageOrganisateur: boolean;
  langues: string[];
  seuils: {
    sur?: number;
    sure?: number;
    probable: number;
  };
  clientNom: string;
}

export interface PhotoData {
  id: string;
  evenementId: string;
  photographeNom: string;
  priseLe: string;
  url: string;
  statut: "reçue" | "traitée" | "indexée" | "erreur";
  visagesDetectes: number;
  largeur?: number;
  hauteur?: number;
}

export interface VisageData {
  id: string;
  faceIdMoteur: string;
  photoId: string;
  evenementId: string;
  cadre: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export interface ContactData {
  id: string;
  nom: string;
  whatsappE164: string;
  email?: string;
  majeur: boolean;
  creeLe: string;
}

export interface ConsentementData {
  id: string;
  participationId: string;
  type: "photos" | "marketing" | "partage_organisateur";
  accepte: boolean;
  versionTexte: string;
  horodatage: string;
  borneId: string;
}

export interface ParticipationData {
  id: string;
  contactId: string;
  evenementId: string;
  jetonGalerie: string;
  nom?: string;
  reconnuLe: string;
  nbPhotos: number;
  statutRecuperation: string;
  selfieUrl?: string;
}

export interface LienPhotoData {
  id: string;
  participationId: string;
  photoId: string;
  similarite: number;
  zone: "sure" | "probable";
  statut: "actif" | "retire_invite" | "retire_admin";
}

export interface DatabaseSchema {
  events: EventData[];
  photos: PhotoData[];
  visages: VisageData[];
  contacts: ContactData[];
  participations: ParticipationData[];
  consentements: ConsentementData[];
  liensPhotos: LienPhotoData[];
}

