/**
 * Função que faz a requisição para a API do Brasileirão
 * Retorna os dados completos do campeonato ou null em caso de erro
 */
async function fetchData() {
  try {
    const response = await fetch("http://localhost:3000/api/brasileirao");
    const informacoes = await response.json();
    return informacoes;
  } catch (error) {
    console.error("Erro:", error);
    return null;
  }
}

/**
 * Obtém a classificação atual dos times
 * Acessa a fase específica "3908" e retorna o objeto de classificação das equipes
 */
async function PegarClassificacao() {
  const info = await fetchData();
  return info.fases["3908"].classificacao.equipe;
}

/**
 * Ordena os times com base na posição
 * Converte o objeto de classificação em array e ordena usando a propriedade 'pos'
 * @param {Object} classificacao - Objeto contendo a classificação dos times
 * @returns {Array} Array ordenado de times por posição
 */
function OrdenarClassificacoes(classificacao) {
  return Object.values(classificacao).sort(
    (a, b) => Number(a.pos) - Number(b.pos)
  );
}

/**
 * Busca informações detalhadas de todos os times
 * Retorna um array com dados como nome, brasão, URI etc.
 */
async function PegarTimes() {
  const informacoes = await fetchData();
  return Object.values(informacoes.equipes);
}

/**
 * Obtém o resultado dos últimos 5 jogos de um time específico
 * @param {string} timeId - ID do time
 * @param {Object} informacoes - Dados completos do campeonato
 * @returns {Array} Array com resultados (V/E/D) dos últimos 5 jogos
 */
function pegarUltimas5Partidas(timeId, informacoes) {
  const partidas = [];
  const jogos = informacoes.fases["3908"].jogos.id;

  // Ordena os jogos por data
  const filtroJogos = Object.values(jogos).sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );

  // Percorre os jogos ordenados
  filtroJogos.forEach((jogo) => {
    if (jogo.time1 === timeId || jogo.time2 === timeId) {
      let resultado;
      if (jogo.placar1 !== null && jogo.placar2 !== null) {
        if (
          (jogo.time1 === timeId && jogo.placar1 > jogo.placar2) ||
          (jogo.time2 === timeId && jogo.placar2 > jogo.placar1)
        ) {
          resultado = "V"; // Vitória
        } else if (jogo.placar1 === jogo.placar2) {
          resultado = "E"; // Empate
        } else {
          resultado = "D"; // Derrota
        }
        partidas.push(resultado);
      }
    }
  });
  return partidas.slice(-5); // Retorna apenas os últimos 5 resultados
}

/**
 * Combina as informações de classificação com os dados detalhados dos times
 * Adiciona informações como brasão e últimas 5 partidas para cada time
 * @param {Array} classificacao - Array com a classificação dos times
 * @returns {Array} Array com dados completos dos times
 */
async function AddInfoDoTimeParaClassficacao(classificacao) {
  const times = await PegarTimes();
  const info = await fetchData();
  return classificacao.map((classificacoes) => {
    const team = times.find((t) => t.id === classificacoes.id);
    const ultimas5 = pegarUltimas5Partidas(classificacoes.id, info);
    return { ...classificacoes, equipe: team, ultimas5: ultimas5 };
  });
}

/**
 * Gera o HTML para exibir os resultados dos últimos 5 jogos
 * Cria círculos coloridos: Verde (V), Amarelo (E), Vermelho (D)
 * @param {Array} partidas - Array com resultados das últimas partidas
 * @returns {string} HTML formatado com os resultados
 */
function gerarHTMLUltimas5(partidas) {
  return partidas
    .map((resultado) => {
      let cor;
      switch (resultado) {
        case "V":
          cor = "background-color: #28a745"; // Verde
          break;
        case "D":
          cor = "background-color: #dc3545"; // Vermelho
          break;
        case "E":
          cor = "background-color: #ffc107"; // Amarelo
          break;
      }
      return `
        <span style="display: inline-block; width: 20px; height: 20px; ${cor}; color: white; text-align: center; margin: 0 2px; border-radius: 50%;">
          ${resultado}
        </span>
      `;
    })
    .join("");
}

/**
 * Insere os dados dos times na tabela HTML
 * Cria as linhas da tabela com todas as informações de cada time
 * @param {Array} classificacao - Array com dados completos dos times
 */
function AdicionarTimesnaTela(classificacao) {
  const tbody = document.querySelector("tbody");
  classificacao.forEach((team, index) => {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>${index + 1}</td>
        <td class="team-name">
          <img src="${team.equipe.brasao}" alt="Brasão de ${
        team.equipe["nome-comum"]
      }" width="20" height="20" margim="00">
          <a href="${team.equipe.uri}">${team.equipe["nome-comum"]}</a>
        </td>
        <td>${team.pg.total}</td>
        <td>${team.j.total}</td>
        <td>${team.v.total}</td>
        <td>${team.e.total}</td>
        <td>${team.d.total}</td>
        <td>${team.gp.total}</td>
        <td>${team.gc.total}</td>
        <td>${team.sg.total}</td>
        <td class="ultimas-5">${gerarHTMLUltimas5(team.ultimas5)}</td>
      </tr>
    `
    );
  });
}

/**
 * Função principal que coordena todo o processo
 * 1. Obtém a classificação
 * 2. Ordena os times
 * 3. Adiciona informações extras
 * 4. Renderiza na tela
 */
async function MostrarTimesnatela() {
  let classification = await PegarClassificacao();
  classification = OrdenarClassificacoes(classification);
  classification = await AddInfoDoTimeParaClassficacao(classification);
  AdicionarTimesnaTela(classification);
}

// Inicia a aplicação
MostrarTimesnatela();
