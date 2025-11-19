import API from "./api";

// Auth
export const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  
  // Log activity après connexion réussie
  await logActivity(res.data.user.id, 'login', 'Connexion au système', 'success');

  return res.data;
};

export const register = async (data) => {
  const res = await API.post("/auth/signup", data);
  
  // Log activity après inscription réussie
  await logActivity(res.data.user.id, 'user_creation', 'Nouvel utilisateur créé', 'success');

  return res.data;
};

// Fonction de log d’activité
export const logActivity = async (user_id, type, action, status) => {
  try {
    const response = await API.post('/activity', {
      userId: user_id, 
      type,
      action,
      status
    });
    console.log('Activité enregistrée:', response.data);
  } catch (err) {
    console.error('Erreur lors de la création de l’activité', err);
  }
};
