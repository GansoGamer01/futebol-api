const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const port = 3000;

// Habilita CORS
app.use(cors());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Rota para buscar dados do Brasileirão
app.get("/api/brasileirao", async (req, res) => {
  try {
    const response = await fetch(
      "http://jsuol.com.br/c/monaco/utils/gestor/commons.js?file=commons.uol.com.br/sistemas/esporte/modalidades/futebol/campeonatos/dados/2024/30/dados.json"
    );
    const informacoes = await response.json();
    res.json(informacoes);
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
