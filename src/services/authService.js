import API from "./api";

// Auth
export const login = async (email, password) => {
  try {
    const res = await API.post("/auth/login", { email, password });

    // Log activity only if login succeeds
    await logActivity(res.data.user.id, 'login', 'Connexion au système', 'success');

    return res.data;

  } catch (error) {
    // If backend returned JSON error → throw it cleanly
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Login failed");
    }

    // Otherwise generic error
    throw new Error("Une erreur est survenue lors de la connexion");
  }
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
