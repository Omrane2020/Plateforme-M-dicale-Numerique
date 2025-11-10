/**
 * Configuration de la base de données MySQL
 * 
 * BACKEND ONLY - Ce fichier doit être exécuté uniquement côté serveur
 * 
 * Pour la production, utilisez des variables d'environnement:
 * - VITE_DB_HOST (pour Vite)
 * - VITE_DB_PORT
 * - VITE_DB_USER
 * - VITE_DB_PASSWORD
 * - VITE_DB_NAME
 */

// Helper pour accéder aux variables d'environnement de manière sûre
const getEnv = (key: string, defaultValue: string = ''): string => {
  try {
    // Pour Vite - utiliser import.meta.env si disponible
    if (typeof import.meta !== 'undefined') {
      const env = (import.meta as any).env;
      if (env && env[key]) {
        return env[key] as string;
      }
    }
  } catch (e) {
    // Ignorer l'erreur et utiliser la valeur par défaut
  }
  
  // Valeur par défaut pour le développement
  return defaultValue;
};

// Configuration MySQL pour le backend
export const dbConfig = {
  host: getEnv('VITE_DB_HOST', 'localhost'),
  port: parseInt(getEnv('VITE_DB_PORT', '3306')),
  user: getEnv('VITE_DB_USER', 'root'),
  password: getEnv('VITE_DB_PASSWORD', ''),
  database: getEnv('VITE_DB_NAME', 'medical_platform'),
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};

/**
 * NOTE IMPORTANTE:
 * Dans un environnement Node.js, vous utiliseriez mysql2:
 * 
 * import mysql from 'mysql2/promise';
 * 
 * export const pool = mysql.createPool(dbConfig);
 * 
 * Pour ce projet frontend, nous simulons les appels à la base de données.
 * Dans une vraie application, ce fichier serait dans le backend (serveur Node.js/Express)
 */

// Fonction helper pour simuler une connexion (pour le développement frontend)
export function simulateDbConnection() {
  console.log('[DB Simulation] Connexion à MySQL simulée:', {
    host: dbConfig.host,
    database: dbConfig.database,
    port: dbConfig.port
  });
  return true;
}

// Types pour les réponses de la base de données
export interface DbResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
