// Função para buscar dados da API
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

// Função para pegar as classificações
async function PegarClassificacao() {
  const info = await fetchData();
  return info.fases["3908"].classificacao.equipe;
}

// Ordenar Classificações por posição
function OrdenarClassificacoes(classificacao) {
  return Object.values(classificacao).sort(
    (a, b) => Number(a.pos) - Number(b.pos)
  );
}

// Pegar informações dos times
async function PegarTimes() {
  const informacoes = await fetchData();
  return Object.values(informacoes.equipes);
}

// Função para retornar os últimos 5 jogos de um time
function pegarUltimas5Partidas(teamId, informacoes) {
  const matches = [];
  const jogos = informacoes.fases["3908"].jogos.id;

  const sortedGames = Object.values(jogos).sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );

  sortedGames.forEach((jogo) => {
    if (jogo.time1 === teamId || jogo.time2 === teamId) {
      let resultado;
      if (jogo.placar1 !== null && jogo.placar2 !== null) {
        if (
          (jogo.time1 === teamId && jogo.placar1 > jogo.placar2) ||
          (jogo.time2 === teamId && jogo.placar2 > jogo.placar1)
        ) {
          resultado = "V";
        } else if (jogo.placar1 === jogo.placar2) {
          resultado = "E";
        } else {
          resultado = "D";
        }
        matches.push(resultado);
      }
    }
  });
  return matches.slice(-5);
}

// Mesclar informações dos times com as classificações
async function AddInfoDoTimeParaClassficacao(classificacao) {
  const times = await PegarTimes();
  const info = await fetchData();
  return classificacao.map((classification) => {
    const team = times.find((t) => t.id === classification.id);
    const ultimas5 = pegarUltimas5Partidas(classification.id, info);
    return { ...classification, equipe: team, ultimas5: ultimas5 };
  });
}

// Gerar HTML das últimas partidas
function gerarHTMLUltimas5(partidas) {
  return partidas
    .map((resultado) => {
      let cor;
      switch (resultado) {
        case "V":
          cor = "background-color: #28a745";
          break;
        case "D":
          cor = "background-color: #dc3545";
          break;
        case "E":
          cor = "background-color: #ffc107";
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

// Adicionar times na tela
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

// Função principal assíncrona
async function MostrarTimesnatela() {
  let classification = await PegarClassificacao();
  classification = OrdenarClassificacoes(classification);
  classification = await AddInfoDoTimeParaClassficacao(classification);
  AdicionarTimesnaTela(classification);
}

// Executar a função main
MostrarTimesnatela();
