const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let poolCreating = false;

const createPool = () => {
  if (poolCreating) return;
  poolCreating = true;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  pool.on('connection', (connection) => {
    console.log('Nouvelle connexion établie:', connection.threadId);

    const keepAliveInterval = 60 * 60 * 1000; // 1h

    const intervalId = setInterval(() => {
      connection.ping((err) => {
        if (err) {
          console.error('Erreur ping MySQL:', err);
        } else {
          console.log(`Ping effectué sur la connexion ${connection.threadId}`);
        }
      });
    }, keepAliveInterval);

    connection.on('end', () => clearInterval(intervalId));
    connection.on('error', () => clearInterval(intervalId));
  });

  pool.on('error', (err) => {
    console.error('Erreur du pool MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Connexion perdue, tentative de reconnexion...');
      if (!poolCreating) createPool();
    }
  });

  poolCreating = false;
  console.log('Pool de connexions MySQL créé avec succès !');
};

const executeQuery = async (query, params = []) => {
    if (!pool) {
      throw new Error("Le pool MySQL n'est pas encore créé");
    }
    try {
      const [results] = await pool.execute(query, params);
      return results;
    } catch (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      throw err;
    }
  };

module.exports = {
  createPool,
  getPool: () => pool,
  executeQuery,
};
