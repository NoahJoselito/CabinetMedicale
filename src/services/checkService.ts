import axios from 'axios'

export const checkUser = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/checkuser`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const user = response.data.user
    
    let allowedMenus: string[] = []
    
    switch(user.role_id) {
      case 1: // Admin
        allowedMenus = ['dashboard', 'service', 'stocks', 'traitement', 'docteur', 'patient', 'consultation', 'dossierMedical', 'rendezVous']
        break
      case 2: // Docteur
        allowedMenus = ['dashboard', 'patient', 'dossierMedical', 'consultation']
        break
      case 3: // Assistant
        allowedMenus = ['dashboard', 'monDossier', 'rendezVous']
        break
      case 4: // Patient
        allowedMenus = ['dashboard', 'rendezVous', 'dossierMedical']
        break
      default:
        allowedMenus = []
    }
    
    return {
      user: user,
      allowedMenus: allowedMenus
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', error)
    throw error
  }
}