import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Teste de conexão com MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Rota de teste
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend funcionando!", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📋 Teste: http://localhost:${PORT}/api/test`);
});