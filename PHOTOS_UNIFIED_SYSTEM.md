# Système de Photos Unifié avec Relations Polymorphiques

## Vue d'ensemble

Le nouveau système de photos unifié utilise une seule table `photos` avec des relations polymorphiques pour gérer à la fois les photos de profil des utilisateurs et les photos médicales des patients. Cette approche est plus propre, extensible et maintient la cohérence des données.

## Structure de la Base de Données

### Table `photos`
```sql
CREATE TABLE photos (
    id BIGINT PRIMARY KEY,
    photoable_id BIGINT NOT NULL,
    photoable_type VARCHAR(255) NOT NULL, -- 'User' ou 'Patient'
    category VARCHAR(255) NOT NULL,       -- 'profile' ou 'medical'
    photo_path VARCHAR(255) NOT NULL,
    photo_type VARCHAR(255),              -- Pour les photos médicales uniquement
    upload_date DATE,
    description TEXT,                     -- Optionnel
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## API Endpoints

### Upload de Photo de Profil
```http
POST /api/photos/upload
Content-Type: multipart/form-data

{
  "photoable_id": 1,
  "photoable_type": "User",
  "category": "profile",
  "photo": (fichier image)
}
```

### Upload de Photo Médicale
```http
POST /api/photos/upload
Content-Type: multipart/form-data

{
  "photoable_id": 5,
  "photoable_type": "Patient",
  "category": "medical",
  "photo_type": "Scanner",
  "upload_date": "2025-09-05",
  "description": "Scanner thoracique",
  "photo": (fichier image)
}
```

### Lister les Photos d'un Patient
```http
GET /api/photos/patient/5
```

### Lister la Photo de Profil d'un Utilisateur
```http
GET /api/photos/user/1
```

### Supprimer une Photo
```http
DELETE /api/photos/{id}
```

## Services Frontend

### `photoService.ts`
Service principal qui gère toutes les opérations sur les photos :

```typescript
import { photoService } from '@/services/photoService';

// Upload photo de profil
const profilePhoto = await photoService.uploadProfilePhoto({
  user_id: 1,
  photo: file
});

// Upload photo médicale
const medicalPhoto = await photoService.uploadMedicalPhoto({
  patient_id: 5,
  photo_type: "Scanner",
  photo: file,
  description: "Scanner thoracique",
  upload_date: "2025-09-05"
});

// Récupérer photos d'un patient
const patientPhotos = await photoService.getPatientPhotos(5);

// Récupérer photo de profil d'un utilisateur
const userPhoto = await photoService.getUserProfilePhoto(1);
```

### Services Spécialisés

#### `profilService.ts`
Fonctions spécifiques pour la gestion des photos de profil :

```typescript
import { uploadProfilePhoto, getUserProfilePhoto, deleteProfilePhoto } from '@/services/profilService';

// Upload photo de profil
const photo = await uploadProfilePhoto(userId, photoFile);

// Récupérer photo de profil
const photo = await getUserProfilePhoto(userId);

// Supprimer photo de profil
await deleteProfilePhoto(photoId);
```

#### `dossierService.ts`
Fonctions spécifiques pour la gestion des photos médicales :

```typescript
import { dossierService } from '@/services/dossierService';

// Récupérer photos médicales d'un patient
const photos = await dossierService.getPatientPhotos(patientId);

// Upload photo médicale
const photo = await dossierService.uploadMedicalPhoto({
  patient_id: 5,
  photo_type: "Scanner",
  photo: file,
  description: "Scanner thoracique"
});

// Supprimer photo médicale
await dossierService.deleteMedicalPhoto(photoId);
```

## Migration et Compatibilité

### Stratégie de Migration
Le système implémente une stratégie de migration progressive avec fallback :

1. **Nouveau système en priorité** : Toutes les nouvelles opérations utilisent le nouveau système
2. **Fallback automatique** : En cas d'erreur, le système retombe sur l'ancien système
3. **Coexistence temporaire** : Les deux systèmes coexistent pendant la période de transition

### Exemple de Fallback
```typescript
// Dans la page profil
try {
  // Essayer le nouveau système
  const photo = await getUserProfilePhoto(userId);
  if (photo) {
    setProfileImage(photo.photo_path);
  }
} catch (error) {
  // Fallback vers l'ancien système
  if (userData.photo_url) {
    setProfileImage(userData.photo_url);
  }
}
```

## Types TypeScript

### Interface `Photo`
```typescript
export interface Photo {
  id: number;
  photoable_id: number;
  photoable_type: 'User' | 'Patient';
  category: 'profile' | 'medical';
  photo_path: string;
  photo_type?: string; // Pour les photos médicales uniquement
  upload_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### Types d'Upload
```typescript
// Upload photo de profil
export interface UploadProfilePhotoData {
  photoable_id: number;
  photoable_type: 'User';
  category: 'profile';
  photo: File;
}

// Upload photo médicale
export interface UploadMedicalPhotoData {
  photoable_id: number;
  photoable_type: 'Patient';
  category: 'medical';
  photo_type: string;
  upload_date?: string;
  description?: string;
  photo: File;
}
```

## Avantages du Nouveau Système

### 1. **Unification**
- Une seule table pour tous les types de photos
- API unifiée pour toutes les opérations
- Code plus maintenable et cohérent

### 2. **Extensibilité**
- Facile d'ajouter de nouveaux types de photos (ex: photos de produits, documents, etc.)
- Relations polymorphiques permettent d'associer des photos à n'importe quel modèle

### 3. **Performance**
- Requêtes plus efficaces avec des index appropriés
- Moins de tables à joindre
- Cache plus simple à implémenter

### 4. **Flexibilité**
- Filtrage facile par `category` et `photoable_type`
- Possibilité d'ajouter des métadonnées spécifiques par type
- Gestion centralisée des permissions

## Configuration

### Endpoints dans `config.ts`
```typescript
export const ENDPOINTS = {
  // Nouveau système de photos unifié
  PHOTOS: {
    UPLOAD: '/photos/upload',
    PATIENT: (patientId: number) => `/photos/patient/${patientId}`,
    USER: (userId: number) => `/photos/user/${userId}`,
    DELETE: (id: number) => `/photos/${id}`,
    GET_BY_ID: (id: number) => `/photos/${id}`,
  },
  // Ancien système (à supprimer progressivement)
  MEDICAL_PHOTOS: {
    LIST: (patientId: number) => `/medical-photos/patient/${patientId}`,
    UPLOAD: '/medical-photos/upload',
    DELETE: (id: number) => `/medical-photos/${id}`,
    GET_BY_ID: (id: number) => `/medical-photos/${id}`,
  },
};
```

## Utilisation dans les Composants

### Page Profil
```typescript
// Chargement de la photo de profil
useEffect(() => {
  const fetchUserData = async () => {
    const data = await getUserProfile();
    setUserData(data);
    
    // Essayer le nouveau système
    try {
      const photo = await getUserProfilePhoto(data.id);
      if (photo) {
        setProfileImage(photo.photo_path);
      }
    } catch (error) {
      // Fallback vers l'ancien système
      if (data.photo_url) {
        setProfileImage(data.photo_url);
      }
    }
  };
  fetchUserData();
}, []);

// Upload de photo
const handleUpload = async () => {
  if (fileInputRef.current?.files?.[0]) {
    try {
      const uploadedPhoto = await uploadProfilePhoto(userData.id, fileInputRef.current.files[0]);
      setProfileImage(uploadedPhoto.photo_path);
    } catch (error) {
      // Fallback vers l'ancien système
      // ...
    }
  }
};
```

### Page Dossier Médical
```typescript
// Chargement des photos médicales
useEffect(() => {
  const fetchPatientDetails = async () => {
    const data = await dossierService.getPatientDetails(patientId);
    setPatient(data);
    
    // Essayer le nouveau système
    try {
      const photos = await dossierService.getPatientPhotos(data.patient.id);
      setPhotos(photos);
    } catch (error) {
      // Fallback vers l'ancien système
      const legacyPhotos = await medicalPhotoService.getPatientPhotos(data.patient.id);
      setLegacyPhotos(legacyPhotos);
    }
  };
  fetchPatientDetails();
}, [patientId]);
```

## Migration des Données Existantes

### Script de Migration (Backend)
```sql
-- Migrer les photos médicales existantes
INSERT INTO photos (photoable_id, photoable_type, category, photo_path, photo_type, upload_date, description, created_at, updated_at)
SELECT 
    patient_id as photoable_id,
    'Patient' as photoable_type,
    'medical' as category,
    photo_path,
    photo_type,
    upload_date,
    description,
    created_at,
    updated_at
FROM medical_photos;

-- Migrer les photos de profil existantes
INSERT INTO photos (photoable_id, photoable_type, category, photo_path, created_at, updated_at)
SELECT 
    id as photoable_id,
    'User' as photoable_type,
    'profile' as category,
    photo_url as photo_path,
    created_at,
    updated_at
FROM users 
WHERE photo_url IS NOT NULL;
```

## Tests

### Tests Unitaires
```typescript
describe('photoService', () => {
  it('should upload profile photo', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await photoService.uploadProfilePhoto({
      user_id: 1,
      photo: mockFile
    });
    
    expect(result.photoable_type).toBe('User');
    expect(result.category).toBe('profile');
  });

  it('should upload medical photo', async () => {
    const mockFile = new File(['test'], 'scan.jpg', { type: 'image/jpeg' });
    const result = await photoService.uploadMedicalPhoto({
      patient_id: 5,
      photo_type: 'Scanner',
      photo: mockFile,
      description: 'Test scan'
    });
    
    expect(result.photoable_type).toBe('Patient');
    expect(result.category).toBe('medical');
    expect(result.photo_type).toBe('Scanner');
  });
});
```

## Maintenance et Évolution

### Prochaines Étapes
1. **Migration complète** : Migrer toutes les données existantes
2. **Suppression de l'ancien système** : Une fois la migration terminée
3. **Optimisations** : Ajout d'index, cache, compression d'images
4. **Nouvelles fonctionnalités** : Tags, albums, partage, etc.

### Monitoring
- Surveiller les erreurs de fallback
- Mesurer les performances du nouveau système
- Vérifier la cohérence des données après migration

## Conclusion

Le nouveau système de photos unifié offre une architecture plus propre et extensible pour gérer tous les types de photos dans l'application. La stratégie de migration progressive avec fallback garantit une transition en douceur sans interruption de service.












