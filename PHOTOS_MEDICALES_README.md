# Fonctionnalité Photos Médicales

## Description
Cette fonctionnalité permet d'ajouter, visualiser et gérer les photos médicales des patients dans leur dossier médical.

## Fonctionnalités

### 1. Upload de Photos
- **Types de photos supportés** : Radiographie, Échographie, Scanner, IRM, Photo clinique, Photo de blessure, Photo de cicatrice, Autre
- **Format d'images acceptés** : PNG, JPG, JPEG
- **Taille maximale** : 10MB
- **Champs obligatoires** : Type de photo, Fichier image
- **Champs optionnels** : Description, Date d'upload (par défaut : date actuelle)

### 2. Gestion des Photos
- **Visualisation** : Grille responsive avec aperçu des photos
- **Zoom** : Clic sur une photo pour l'afficher en plein écran
- **Suppression** : Bouton de suppression avec confirmation
- **Informations affichées** : Type, date d'upload, description

### 3. Interface Utilisateur
- **Design moderne** : Interface intuitive avec animations
- **Responsive** : Adaptation mobile et desktop
- **Accessibilité** : Icônes explicites et textes descriptifs
- **Feedback visuel** : États de chargement et messages d'erreur

## Structure Technique

### Services
- `medicalPhotoService.ts` : Service pour gérer les opérations CRUD des photos
- Endpoints configurés dans `config.ts`

### Composants
- Formulaire d'upload avec validation
- Grille d'affichage des photos
- Modal de visualisation plein écran
- Gestion des erreurs et états de chargement

### API Endpoints
```typescript
MEDICAL_PHOTOS: {
  LIST: (patientId: number) => `/medical-photos/patient/${patientId}`,
  UPLOAD: '/medical-photos/upload',
  DELETE: (id: number) => `/medical-photos/${id}`,
  GET_BY_ID: (id: number) => `/medical-photos/${id}`,
}
```

## Utilisation

### Pour les Médecins
1. Accéder au dossier médical d'un patient
2. Cliquer sur "Ajouter une photo" dans la section "Photos médicales"
3. Remplir le formulaire :
   - Sélectionner le type de photo
   - Choisir la date (optionnel, par défaut aujourd'hui)
   - Ajouter une description (optionnel)
   - Sélectionner le fichier image
4. Cliquer sur "Uploader la photo"

### Visualisation
- Cliquer sur une photo pour l'agrandir
- Utiliser le bouton X pour fermer la vue agrandie
- Utiliser le bouton de suppression (rouge) pour supprimer une photo

## Sécurité
- Validation des types de fichiers côté client et serveur
- Limitation de la taille des fichiers
- Confirmation avant suppression
- Gestion des erreurs avec messages utilisateur

## Maintenance
- Les photos sont stockées avec métadonnées complètes
- Historique des uploads avec dates
- Possibilité d'ajouter de nouveaux types de photos dans le code

## Évolutions Futures Possibles
- Compression automatique des images
- Tags et catégorisation avancée
- Comparaison avant/après
- Export des photos
- Intégration avec d'autres systèmes médicaux
