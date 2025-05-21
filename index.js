const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://logdesempenhodevice-default-rtdb.firebaseio.com",
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Rota para obter todos os logs
app.get('/api/logs', async (req, res) => {
  try {
    const db = admin.database();
    const snapshot = await db.ref('logs').once('value');
    res.json(snapshot.val());
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    res.status(500).send('Erro ao buscar logs');
  }
});

// Rota para buscar logs por ID de device
app.get('/api/logs/:deviceId', async (req, res) => {
  try {
    const db = admin.database();
    const deviceId = req.params.deviceId;
    const snapshot = await db.ref(`logs/${deviceId}`).once('value');
    res.json(snapshot.val());
  } catch (error) {
    console.error("Erro ao buscar logs por device:", error);
    res.status(500).send('Erro ao buscar logs');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em https://site-log-device.onrender.com:${PORT}`);
});
