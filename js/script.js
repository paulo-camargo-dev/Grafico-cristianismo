const dataBrasil = {
  2000: {
    nacional: { catolicos: 73.6, evangelicos: 15.4, semReligiao: 7.4, outros: 3.6 },
    regioes: {
      Norte: { catolicos: 71, evangelicos: 21, semReligiao: 5, outros: 3 },
      Nordeste: { catolicos: 79, evangelicos: 12, semReligiao: 6, outros: 3 },
      "Centro-Oeste": { catolicos: 72, evangelicos: 17, semReligiao: 7, outros: 4 },
      Sudeste: { catolicos: 71, evangelicos: 16, semReligiao: 9, outros: 4 },
      Sul: { catolicos: 76, evangelicos: 13, semReligiao: 8, outros: 3 }
    },
    popMilhoes: 146.0
  },
  2010: {
    nacional: { catolicos: 64.6, evangelicos: 22.2, semReligiao: 8.0, outros: 5.2 },
    regioes: {
      Norte: { catolicos: 61, evangelicos: 28, semReligiao: 7, outros: 4 },
      Nordeste: { catolicos: 72, evangelicos: 18, semReligiao: 6, outros: 4 },
      "Centro-Oeste": { catolicos: 61, evangelicos: 27, semReligiao: 7, outros: 5 },
      Sudeste: { catolicos: 60, evangelicos: 24, semReligiao: 10, outros: 6 },
      Sul: { catolicos: 70, evangelicos: 18, semReligiao: 8, outros: 4 }
    },
    popMilhoes: 164.6
  },
  2022: {
    nacional: { catolicos: 56.7, evangelicos: 31.1, semReligiao: 9.7, outros: 2.5 },
    regioes: {
      Norte: { catolicos: 50, evangelicos: 39, semReligiao: 7, outros: 4 },
      Nordeste: { catolicos: 63, evangelicos: 26, semReligiao: 8, outros: 3 },
      "Centro-Oeste": { catolicos: 53, evangelicos: 34, semReligiao: 9, outros: 4 },
      Sudeste: { catolicos: 52, evangelicos: 33, semReligiao: 11, outros: 4 },
      Sul: { catolicos: 60, evangelicos: 29, semReligiao: 8, outros: 3 }
    },
    popMilhoes: 176.6
  }
};

const contagensNacionais = {};
let ultimoAnoOnline = null;
const codigoRegiaoPorNome = {
  Norte: "1",
  Nordeste: "2",
  Sudeste: "3",
  Sul: "4",
  "Centro-Oeste": "5"
};

let noticias = [
  {
    tag: "Fonte local",
    titulo: "Sem conexao para noticias online",
    resumo: "Conecte-se a internet para carregar noticias missionarias em tempo real.",
    data: "-",
    link: "#"
  }
];

const anoSelect = document.getElementById("anoSelect");
const regiaoSelect = document.getElementById("regiaoSelect");
const buscaInput = document.getElementById("buscaInput");
const cardsResumo = document.getElementById("cardsResumo");
const listaNoticias = document.getElementById("listaNoticias");
const tituloPizza = document.getElementById("tituloPizza");
const tituloBarras = document.getElementById("tituloBarras");
const detalheRegiao = document.getElementById("detalheRegiao");
const statusDados = document.getElementById("statusDados");
const statusNoticias = document.getElementById("statusNoticias");

let anos = [];
let regioes = [];

const chartColors = ["#0f4c81", "#12a594", "#f7b32b", "#ea526f"];
const labelsReligiao = ["Catolicos", "Evangelicos", "Sem religiao", "Outros"];

const pizzaChart = new Chart(document.getElementById("graficoPizza"), {
  type: "doughnut",
  data: {
    labels: labelsReligiao,
    datasets: [{ data: [], backgroundColor: chartColors }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: "bottom" }
    }
  }
});

const linhaChart = new Chart(document.getElementById("graficoLinha"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Catolicos", data: [], borderColor: chartColors[0], tension: 0.35 },
      { label: "Evangelicos", data: [], borderColor: chartColors[1], tension: 0.35 },
      { label: "Sem religiao", data: [], borderColor: chartColors[2], tension: 0.35 }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Percentual (%)" }
      }
    }
  }
});

const barrasChart = new Chart(document.getElementById("graficoBarras"), {
  type: "bar",
  data: {
    labels: labelsReligiao,
    datasets: [{ label: "Regiao", data: [], backgroundColor: chartColors }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Percentual (%)" }
      }
    }
  }
});

function formatPercent(value) {
  return `${Number(value).toFixed(1).replace(".", ",")}%`;
}

function parseNumero(value) {
  return Number(String(value).replace(",", "."));
}

function toMilhoes(value) {
  return `${(Number(value) / 1_000_000).toFixed(1).replace(".", ",")} mi`;
}

function normalizarRegiao(nome) {
  if (nome === "Centro-Oeste") return "Centro-Oeste";
  return nome;
}

function rebuildSelects() {
  anos = Object.keys(dataBrasil).sort((a, b) => Number(a) - Number(b));
  const ultimoAno = anos[anos.length - 1];
  const anoAtual = anoSelect.value;

  anoSelect.innerHTML = "";
  anos.forEach((ano) => {
    const option = document.createElement("option");
    option.value = ano;
    option.textContent = ano === ultimoAno ? `${ano} (atual)` : ano;
    anoSelect.appendChild(option);
  });

  anoSelect.value = anos.includes(anoAtual) ? anoAtual : ultimoAno;
  atualizarRegioesPorAno(regiaoSelect.value);
}

function atualizarRegioesPorAno(regiaoPreferida = "") {
  const ano = anoSelect.value;
  regioes = Object.keys(dataBrasil[ano].regioes);

  regiaoSelect.innerHTML = "";
  regioes.forEach((regiao) => {
    const option = document.createElement("option");
    option.value = regiao;
    option.textContent = regiao;
    regiaoSelect.appendChild(option);
  });

  const fallbackRegiao = regioes.includes("Sudeste") ? "Sudeste" : regioes[0];
  regiaoSelect.value = regioes.includes(regiaoPreferida) ? regiaoPreferida : fallbackRegiao;
}

function renderCards(ano) {
  const dados = dataBrasil[ano].nacional;
  const contagens = contagensNacionais[ano];

  const cards = [
    {
      label: "Catolicos",
      value: formatPercent(dados.catolicos),
      meta: contagens ? toMilhoes(contagens.catolicos) : `${(dataBrasil[ano].popMilhoes * dados.catolicos / 100).toFixed(1)} mi`
    },
    {
      label: "Evangelicos",
      value: formatPercent(dados.evangelicos),
      meta: contagens ? toMilhoes(contagens.evangelicos) : `${(dataBrasil[ano].popMilhoes * dados.evangelicos / 100).toFixed(1)} mi`
    },
    {
      label: "Sem religiao",
      value: formatPercent(dados.semReligiao),
      meta: contagens ? toMilhoes(contagens.semReligiao) : `${(dataBrasil[ano].popMilhoes * dados.semReligiao / 100).toFixed(1)} mi`
    },
    {
      label: "Outros",
      value: formatPercent(dados.outros),
      meta: contagens ? toMilhoes(contagens.outros) : `${(dataBrasil[ano].popMilhoes * dados.outros / 100).toFixed(1)} mi`
    }
  ];

  cardsResumo.innerHTML = cards
    .map((item) => `
      <div class="card">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
        <div class="meta">Publico estimado: ${item.meta}</div>
      </div>
    `)
    .join("");
}

function renderNoticias(filtro = "") {
  const termo = filtro.trim().toLowerCase();
  const base = noticias.filter((n) => {
    if (!termo) return true;
    return (`${n.tag} ${n.titulo} ${n.resumo}`).toLowerCase().includes(termo);
  });

  if (!base.length) {
    listaNoticias.innerHTML = `<div class="news-item"><h3>Nenhuma noticia encontrada</h3><p>Tente outro termo de busca missionaria.</p></div>`;
    return;
  }

  listaNoticias.innerHTML = base
    .map((n) => `
      <article class="news-item">
        <span class="tag">${n.tag}</span>
        <h3><a href="${n.link}" target="_blank" rel="noopener noreferrer">${n.titulo}</a></h3>
        <p>${n.resumo}</p>
        <div class="date">${n.data}</div>
      </article>
    `)
    .join("");
}

function renderLinha() {
  linhaChart.data.labels = anos;
  linhaChart.data.datasets[0].data = anos.map((ano) => dataBrasil[ano].nacional.catolicos);
  linhaChart.data.datasets[1].data = anos.map((ano) => dataBrasil[ano].nacional.evangelicos);
  linhaChart.data.datasets[2].data = anos.map((ano) => dataBrasil[ano].nacional.semReligiao);
  linhaChart.update();
}

async function obterRegiaoOnline(ano, regiao) {
  if (!ultimoAnoOnline || ano !== ultimoAnoOnline) {
    return null;
  }

  const codigoRegiao = codigoRegiaoPorNome[regiao];
  if (!codigoRegiao) {
    return null;
  }

  const url = `https://apisidra.ibge.gov.br/values/t/6417/n2/${codigoRegiao}/v/13495/p/${ano}/c86/95251/c2/6794/c133/95278,95263,95277,2836`;
  const rows = await fetchJson(url);
  const mapa = mapReligiaoRows(rows.slice(1));

  return {
    catolicos: mapa["95263"] || 0,
    evangelicos: mapa["95277"] || 0,
    semReligiao: mapa["2836"] || 0,
    outros: Math.max(0, (mapa["95278"] || 0) - (mapa["95263"] || 0) - (mapa["95277"] || 0) - (mapa["2836"] || 0))
  };
}

async function atualizarPainel() {
  const ano = anoSelect.value;
  const regiaoSelecionada = regiaoSelect.value;
  const nacional = dataBrasil[ano].nacional;
  const regional = dataBrasil[ano].regioes[regiaoSelecionada];
  const regiao = regional ? regiaoSelecionada : Object.keys(dataBrasil[ano].regioes)[0];
  let regionalValida = regional || dataBrasil[ano].regioes[regiao];

  if (regiaoSelect.value !== regiao) {
    regiaoSelect.value = regiao;
  }

  try {
    const regionalOnline = await obterRegiaoOnline(ano, regiao);
    if (regionalOnline) {
      regionalValida = regionalOnline;
      dataBrasil[ano].regioes[regiao] = regionalOnline;
    }
  } catch (error) {
    console.error("Erro ao buscar regiao online:", error);
  }

  renderCards(ano);

  pizzaChart.data.datasets[0].data = [
    nacional.catolicos,
    nacional.evangelicos,
    nacional.semReligiao,
    nacional.outros
  ];
  pizzaChart.update();
  tituloPizza.textContent = `Percentual estimado no Brasil em ${ano}`;

  barrasChart.data.labels = [...labelsReligiao];
  barrasChart.data.datasets = [
    {
      label: regiao,
      data: [
        regionalValida.catolicos,
        regionalValida.evangelicos,
        regionalValida.semReligiao,
        regionalValida.outros
      ],
      backgroundColor: chartColors
    }
  ];
  barrasChart.update();
  tituloBarras.textContent = `Regiao selecionada: ${regiao} (${ano})`;
  detalheRegiao.innerHTML = `
    <span>Catolicos: ${formatPercent(regionalValida.catolicos)}</span>
    <span>Evangelicos: ${formatPercent(regionalValida.evangelicos)}</span>
    <span>Sem religiao: ${formatPercent(regionalValida.semReligiao)}</span>
    <span>Outros: ${formatPercent(regionalValida.outros)}</span>
  `;

  renderLinha();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha HTTP ${response.status}`);
  }
  return response.json();
}

function mapReligiaoRows(rows) {
  const mapa = {};
  rows.forEach((row) => {
    mapa[row.D6C] = parseNumero(row.V);
  });
  return mapa;
}

async function carregarDadosIBGE() {
  const descriptorUrl = "https://apisidra.ibge.gov.br/DescritoresTabela/t/6417";
  const baseUrl = "https://apisidra.ibge.gov.br/values/t/6417";

  const descriptor = await fetchJson(descriptorUrl);
  const ultimoAno = String(descriptor.Periodos[descriptor.Periodos.length - 1].Codigo);
  ultimoAnoOnline = ultimoAno;

  const brPercentUrl = `${baseUrl}/n1/1/v/13495/p/${ultimoAno}/c86/95251/c2/6794/c133/95278,95263,95277,2836`;
  const brCountUrl = `${baseUrl}/n1/1/v/140/p/${ultimoAno}/c86/95251/c2/6794/c133/95278,95263,95277,2836`;
  const regPercentUrl = `${baseUrl}/n2/all/v/13495/p/${ultimoAno}/c86/95251/c2/6794/c133/95278,95263,95277,2836`;

  const [brPercentRaw, brCountRaw, regPercentRaw] = await Promise.all([
    fetchJson(brPercentUrl),
    fetchJson(brCountUrl),
    fetchJson(regPercentUrl)
  ]);

  const brPercent = mapReligiaoRows(brPercentRaw.slice(1));
  const brCount = mapReligiaoRows(brCountRaw.slice(1));

  const nacional = {
    catolicos: brPercent["95263"] || 0,
    evangelicos: brPercent["95277"] || 0,
    semReligiao: brPercent["2836"] || 0,
    outros: Math.max(0, (brPercent["95278"] || 0) - (brPercent["95263"] || 0) - (brPercent["95277"] || 0) - (brPercent["2836"] || 0))
  };

  const totalCount = brCount["95278"] || 0;
  const catCount = brCount["95263"] || 0;
  const evCount = brCount["95277"] || 0;
  const semCount = brCount["2836"] || 0;
  const outrosCount = Math.max(0, totalCount - catCount - evCount - semCount);

  const regioesDinamicas = {};
  const agrupado = {};

  regPercentRaw.slice(1).forEach((row) => {
    const nomeRegiao = normalizarRegiao(row.D1N);
    if (!agrupado[nomeRegiao]) {
      agrupado[nomeRegiao] = {};
    }
    agrupado[nomeRegiao][row.D6C] = parseNumero(row.V);
  });

  Object.keys(agrupado).forEach((nomeRegiao) => {
    const item = agrupado[nomeRegiao];
    regioesDinamicas[nomeRegiao] = {
      catolicos: item["95263"] || 0,
      evangelicos: item["95277"] || 0,
      semReligiao: item["2836"] || 0,
      outros: Math.max(0, (item["95278"] || 0) - (item["95263"] || 0) - (item["95277"] || 0) - (item["2836"] || 0))
    };
  });

  dataBrasil[ultimoAno] = {
    nacional,
    regioes: regioesDinamicas,
    popMilhoes: totalCount / 1_000_000
  };

  contagensNacionais[ultimoAno] = {
    total: totalCount,
    catolicos: catCount,
    evangelicos: evCount,
    semReligiao: semCount,
    outros: outrosCount
  };

  const dtAtualizacao = descriptor.DataAtualizacao ? descriptor.DataAtualizacao.split(" ")[0] : "-";
  statusDados.textContent = `Dados online carregados do IBGE (tabela 6417). Ultima atualizacao da base: ${dtAtualizacao}`;
}

function extrairDominio(link) {
  try {
    return new URL(link).hostname.replace("www.", "");
  } catch (error) {
    return "Fonte externa";
  }
}

function formatarDataNoticia(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(data);
}

async function carregarNoticiasOnline() {
  const query = encodeURIComponent("cristianismo brasil evangelicos catolicos missoes");
  const feed = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed)}`;

  const response = await fetch(proxy);
  if (!response.ok) {
    throw new Error(`Falha HTTP ${response.status}`);
  }

  const xmlText = await response.text();
  const xml = new DOMParser().parseFromString(xmlText, "text/xml");
  const itens = Array.from(xml.querySelectorAll("item")).slice(0, 8);

  if (!itens.length) {
    throw new Error("Sem itens no feed");
  }

  noticias = itens.map((item) => {
    const titulo = (item.querySelector("title")?.textContent || "Sem titulo").replace(/\s-\s[^-]+$/, "");
    const link = item.querySelector("link")?.textContent || "#";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    const source = item.querySelector("source")?.textContent || extrairDominio(link);
    const descricao = item.querySelector("description")?.textContent || "Leia a materia completa no link.";

    const textoLimpo = descricao.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    return {
      tag: source,
      titulo,
      resumo: textoLimpo.slice(0, 140) + (textoLimpo.length > 140 ? "..." : ""),
      data: formatarDataNoticia(pubDate),
      link
    };
  });

  statusNoticias.textContent = "Noticias carregadas automaticamente da internet (Google News RSS).";
}

async function inicializar() {
  rebuildSelects();
  renderNoticias();
  await atualizarPainel();

  try {
    await carregarDadosIBGE();
    rebuildSelects();
    await atualizarPainel();
  } catch (error) {
    statusDados.textContent = "Nao foi possivel atualizar online agora. Exibindo base local de contingencia.";
    console.error("Erro ao carregar dados do IBGE:", error);
  }

  try {
    await carregarNoticiasOnline();
  } catch (error) {
    statusNoticias.textContent = "Nao foi possivel carregar noticias online agora. Exibindo base local.";
    console.error("Erro ao carregar noticias:", error);
  }

  renderNoticias(buscaInput.value);
}

anoSelect.addEventListener("change", () => {
  atualizarRegioesPorAno(regiaoSelect.value);
  atualizarPainel();
});
regiaoSelect.addEventListener("change", atualizarPainel);
buscaInput.addEventListener("input", (e) => renderNoticias(e.target.value));

inicializar();

