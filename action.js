// 1. TABELA DE DENSIDADES (Peso em gramas de 1 xícara padrão de 240ml)
// Como 1 xícara = 16 colheres de sopa = 48 colheres de chá, calculamos tudo a partir daqui!
const DENSIDADES = {
  farinha: { nome: "Farinha / Amido", xicara: 120 },
  acucar: { nome: "Açúcar", xicara: 180 },
  liquido: { nome: "Líquidos (Água, Leite, Óleo)", xicara: 240 },
  manteiga: { nome: "Manteiga / Gordura", xicara: 200 },
  chocolate: { nome: "Chocolate / Cacau em pó", xicara: 90 },
  sal_fermento: { nome: "Sal / Fermento / Especiarias", xicara: 240 },
  padrao: { nome: "Outros ingredientes", xicara: 200 }
};

// 2. RECEITAS INICIAIS (Carregadas na primeira vez que o usuário abre o site)
const RECEITAS_INICIAIS = [
  {
    id: 1,
    titulo: "Bolo Caseiro de Cenoura",
    categoria: "Bolos e Tortas",
    descricao: "Bolo fofinho tradicional com massa leve e sabor marcante de cenoura fresca.",
    tempo: "45 min",
    porcoes: 8,
    imagem: "https://th.bing.com/th/id/OIP.wFmC5Mk2MrifkJ9J5Y679gHaE8?w=213&h=180&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3",
    preparo: "1. Bata no liquidificador as cenouras, os ovos e o óleo.\n2. Despeje em uma tigela e misture o açúcar e a farinha aos poucos.\n3. Adicione o fermento por último.\n4. Asse em forno preaquecido a 180°C por cerca de 40 minutos.",
    ingredientes: [
      { nome: "Cenoura picada", gramas: 250, tipo: "padrao" },
      { nome: "Farinha de trigo", gramas: 240, tipo: "farinha" },
      { nome: "Açúcar", gramas: 270, tipo: "acucar" },
      { nome: "Óleo", gramas: 120, tipo: "liquido" },
      { nome: "Fermento em pó", gramas: 15, tipo: "sal_fermento" }
    ]
  },
  {
    id: 2,
    titulo: "Panqueca Americana Clássica",
    categoria: "Café da Manhã",
    descricao: "Massa alta, macia e dourada, perfeita para servir com mel ou frutas.",
    tempo: "20 min",
    porcoes: 4,
    imagem: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
    preparo: "1. Misture os ingredientes secos em uma tigela.\n2. Adicione o leite, o ovo e a manteiga derretida.\n3. Aqueça uma frigideira untada e despeje pequenas conchas da massa.\n4. Vire quando formarem bolhas na superfície.",
    ingredientes: [
      { nome: "Farinha de trigo", gramas: 180, tipo: "farinha" },
      { nome: "Leite", gramas: 240, tipo: "liquido" },
      { nome: "Açúcar", gramas: 30, tipo: "acucar" },
      { nome: "Manteiga derretida", gramas: 40, tipo: "manteiga" },
      { nome: "Fermento em pó", gramas: 10, tipo: "sal_fermento" }
    ]
  }
];

// 3. FUNÇÕES DO LOCALSTORAGE (Salvar e Ler dados)
const CHAVE_STORAGE = "livro_receitas_digital_v1";

function carregarReceitas() {
  const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
  if (dadosSalvos) {
    return JSON.parse(dadosSalvos);
  }
  // Se for o primeiro acesso, salva as receitas iniciais no navegador
  salvarReceitas(RECEITAS_INICIAIS);
  return RECEITAS_INICIAIS;
}

function salvarReceitas(listaReceitas) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaReceitas));
}

// Variável global que guarda as receitas em memória enquanto usamos o site
let receitas = carregarReceitas();

// 4. RENDERIZAR CATÁLOGO, PESQUISA E FILTROS
const catalogoEl = document.getElementById("catalogo-receitas");
const campoBuscaEl = document.getElementById("campo-busca");
const filtroCategoriaEl = document.getElementById("filtro-categoria");

function renderizarCatalogo() {
  const termoBusca = campoBuscaEl.value.toLowerCase();
  const categoriaEscolhida = filtroCategoriaEl.value;

  const receitasFiltradas = receitas.filter(receita => {
    const bateNome = receita.titulo.toLowerCase().includes(termoBusca);
    const bateCategoria = categoriaEscolhida === "Todas" || receita.categoria === categoriaEscolhida;
    return bateNome && bateCategoria;
  });

  catalogoEl.innerHTML = "";

  if (receitasFiltradas.length === 0) {
    catalogoEl.innerHTML = "<p>Nenhuma receita encontrada com esses filtros.</p>";
    return;
  }

  receitasFiltradas.forEach(receita => {
    const foto = receita.imagem || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80";

    catalogoEl.innerHTML += `
      <article class="cartao" onclick="abrirReceita(${receita.id})">
        <img src="${foto}" alt="${receita.titulo}">
        <div class="cartao-corpo">
          <span class="tag-categoria">${receita.categoria}</span>
          <h3>${receita.titulo}</h3>
          <p>${receita.descricao}</p>
          <div class="cartao-meta">
            ⏱ ${receita.tempo} &nbsp;|&nbsp; 🍽 ${receita.porcoes} porções
          </div>
        </div>
      </article>
    `;
  });
}

// Eventos de pesquisa e filtro em tempo real
campoBuscaEl.addEventListener("input", renderizarCatalogo);
filtroCategoriaEl.addEventListener("change", renderizarCatalogo);

// 5. CONVERSOR DE MEDIDAS E PÁGINA INDIVIDUAL DA RECEITA
const telaCatalogoEl = document.getElementById("tela-catalogo");
const telaDetalhesEl = document.getElementById("tela-detalhes");
const conteudoReceitaEl = document.getElementById("conteudo-receita");

let receitaAtual = null;
let porcoesAtuais = 1;
let unidadeAtual = "gramas";

// Converte gramas usando a densidade específica de cada ingrediente
function converterMedida(gramasAjustadas, tipo, unidade) {
  if (unidade === "gramas") {
    return `${Math.round(gramasAjustadas)}g`;
  }

  const infoDensidade = DENSIDADES[tipo] || DENSIDADES.padrao;
  const pesoUmaXicara = infoDensidade.xicara;

  if (unidade === "xicaras") {
    const xicaras = gramasAjustadas / pesoUmaXicara;
    return `${xicaras.toFixed(2).replace(/\.00$/, "")} xícara(s)`;
  }

  if (unidade === "colheres_sopa") {
    // 1 xícara = 16 colheres de sopa
    const colheresSopa = (gramasAjustadas / pesoUmaXicara) * 16;
    return `${colheresSopa.toFixed(1).replace(/\.0$/, "")} colher(es) de sopa`;
  }

  if (unidade === "colheres_cha") {
    // 1 xícara = 48 colheres de chá
    const colheresCha = (gramasAjustadas / pesoUmaXicara) * 48;
    return `${Math.round(colheresCha)} colher(es) de chá`;
  }
}

// Abre a página da receita selecionada
function abrirReceita(id) {
  receitaAtual = receitas.find(r => r.id === id);
  if (!receitaAtual) return;

  porcoesAtuais = receitaAtual.porcoes;
  unidadeAtual = "gramas";

  telaCatalogoEl.classList.add("oculto");
  telaDetalhesEl.classList.remove("oculto");
  window.scrollTo(0, 0);

  renderizarDetalhesReceita();
}

// Desenha o conteúdo da receita recalculando porções e medidas
function renderizarDetalhesReceita() {
  const foto = receitaAtual.imagem || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80";
  const fatorMultiplicador = porcoesAtuais / receitaAtual.porcoes;

  const itensHTML = receitaAtual.ingredientes.map(ing => {
    const gramasProporcionais = ing.gramas * fatorMultiplicador;
    const textoMedida = converterMedida(gramasProporcionais, ing.tipo, unidadeAtual);
    return `<li><strong>${textoMedida}</strong> — ${ing.nome}</li>`;
  }).join("");

  conteudoReceitaEl.innerHTML = `
    <span class="tag-categoria">${receitaAtual.categoria}</span>
    <h2>${receitaAtual.titulo}</h2>
    <p>${receitaAtual.descricao}</p>
    <img src="${foto}" alt="${receitaAtual.titulo}" class="detalhes-capa">

    <div class="detalhes-info">
      <span>⏱ Tempo de preparo: ${receitaAtual.tempo}</span>
      <span>🍽 Rendimento original: ${receitaAtual.porcoes} porções</span>
    </div>

    <div class="painel-controles">
      <div class="controle-grupo">
        <strong>Ajustar Porções:</strong>
        <button class="btn-porcao" onclick="alterarPorcoes(-1)">-</button>
        <span style="font-size: 1.1rem; min-width: 85px; text-align: center;">
          <strong>${porcoesAtuais}</strong> porções
        </span>
        <button class="btn-porcao" onclick="alterarPorcoes(1)">+</button>
      </div>

      <div class="controle-grupo">
        <label for="seletor-medida"><strong>Medida:</strong></label>
        <select id="seletor-medida" onchange="alterarUnidade(this.value)">
          <option value="gramas" ${unidadeAtual === "gramas" ? "selected" : ""}>Gramas (g)</option>
          <option value="xicaras" ${unidadeAtual === "xicaras" ? "selected" : ""}>Xícaras</option>
          <option value="colheres_sopa" ${unidadeAtual === "colheres_sopa" ? "selected" : ""}>Colheres de sopa</option>
          <option value="colheres_cha" ${unidadeAtual === "colheres_cha" ? "selected" : ""}>Colheres de chá</option>
        </select>
      </div>
    </div>

    <h3>Ingredientes</h3>
    <ul class="lista-ingredientes">${itensHTML}</ul>

    <h3>Modo de Preparo</h3>
    <div class="modo-preparo">${receitaAtual.preparo}</div>
  `;
}

function alterarPorcoes(delta) {
  if (porcoesAtuais + delta >= 1) {
    porcoesAtuais += delta;
    renderizarDetalhesReceita();
  }
}

function alterarUnidade(novaUnidade) {
  unidadeAtual = novaUnidade;
  renderizarDetalhesReceita();
}

// Botão de voltar ao catálogo
document.getElementById("btn-voltar").addEventListener("click", () => {
  telaDetalhesEl.classList.add("oculto");
  telaCatalogoEl.classList.remove("oculto");
});

// 6. ADICIONAR, EDITAR E EXCLUIR RECEITAS
const telaFormularioEl = document.getElementById("tela-formulario");
const formReceitaEl = document.getElementById("form-receita");
const containerInputsIngEl = document.getElementById("container-inputs-ingredientes");

// Cria uma linha de inputs para um ingrediente no formulário
function adicionarLinhaIngrediente(nome = "", gramas = "", tipo = "padrao") {
  const div = document.createElement("div");
  div.className = "linha-ingrediente-form";
  div.innerHTML = `
    <input type="text" class="ing-nome" placeholder="Ingrediente (ex: Farinha)" value="${nome}" required>
    <input type="number" class="ing-gramas" placeholder="Gramas/ml" min="1" value="${gramas}" required>
    <select class="ing-tipo">
      <option value="farinha" ${tipo === "farinha" ? "selected" : ""}>Farinha / Amido</option>
      <option value="acucar" ${tipo === "acucar" ? "selected" : ""}>Açúcar</option>
      <option value="liquido" ${tipo === "liquido" ? "selected" : ""}>Líquidos (Leite/Água/Óleo)</option>
      <option value="manteiga" ${tipo === "manteiga" ? "selected" : ""}>Manteiga / Gordura</option>
      <option value="chocolate" ${tipo === "chocolate" ? "selected" : ""}>Chocolate / Cacau</option>
      <option value="sal_fermento" ${tipo === "sal_fermento" ? "selected" : ""}>Sal / Fermento</option>
      <option value="padrao" ${tipo === "padrao" ? "selected" : ""}>Outros</option>
    </select>
    <button type="button" class="btn-remover-ing" onclick="this.parentElement.remove()">X</button>
  `;
  containerInputsIngEl.appendChild(div);
}

document.getElementById("btn-add-ingrediente").addEventListener("click", () => {
  adicionarLinhaIngrediente();
});

// Abre o formulário vazio para uma nova receita
document.getElementById("btn-nova-receita").addEventListener("click", () => {
  formReceitaEl.reset();
  document.getElementById("receita-id-edicao").value = "";
  document.getElementById("titulo-formulario").textContent = "Adicionar Nova Receita";
  containerInputsIngEl.innerHTML = "";
  adicionarLinhaIngrediente(); // Começa com 1 linha pronta

  telaCatalogoEl.classList.add("oculto");
  telaDetalhesEl.classList.add("oculto");
  telaFormularioEl.classList.remove("oculto");
});

// Cancela o formulário e volta ao catálogo
document.getElementById("btn-cancelar-form").addEventListener("click", () => {
  telaFormularioEl.classList.add("oculto");
  telaCatalogoEl.classList.remove("oculto");
});

// Preenche o formulário para EDITAR a receita aberta
document.getElementById("btn-editar-atual").addEventListener("click", () => {
  if (!receitaAtual) return;

  document.getElementById("receita-id-edicao").value = receitaAtual.id;
  document.getElementById("titulo-formulario").textContent = "Editar Receita";
  document.getElementById("input-titulo").value = receitaAtual.titulo;
  document.getElementById("input-categoria").value = receitaAtual.categoria;
  document.getElementById("input-tempo").value = receitaAtual.tempo;
  document.getElementById("input-porcoes").value = receitaAtual.porcoes;
  document.getElementById("input-imagem").value = receitaAtual.imagem || "";
  document.getElementById("input-descricao").value = receitaAtual.descricao;
  document.getElementById("input-preparo").value = receitaAtual.preparo;

  containerInputsIngEl.innerHTML = "";
  receitaAtual.ingredientes.forEach(ing => {
    adicionarLinhaIngrediente(ing.nome, ing.gramas, ing.tipo);
  });

  telaDetalhesEl.classList.add("oculto");
  telaFormularioEl.classList.remove("oculto");
});

// EXCLUIR a receita aberta
document.getElementById("btn-excluir-atual").addEventListener("click", () => {
  if (!receitaAtual) return;

  const confirmar = confirm(`Tem certeza que deseja excluir "${receitaAtual.titulo}"?`);
  if (confirmar) {
    receitas = receitas.filter(r => r.id !== receitaAtual.id);
    salvarReceitas(receitas);
    renderizarCatalogo();

    telaDetalhesEl.classList.add("oculto");
    telaCatalogoEl.classList.remove("oculto");
  }
});

// Salva nova receita ou atualização no LocalStorage
formReceitaEl.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const linhas = document.querySelectorAll(".linha-ingrediente-form");
  const ingredientesColetados = [];

  linhas.forEach(linha => {
    const nome = linha.querySelector(".ing-nome").value.trim();
    const gramas = parseFloat(linha.querySelector(".ing-gramas").value);
    const tipo = linha.querySelector(".ing-tipo").value;

    if (nome && gramas > 0) {
      ingredientesColetados.push({ nome, gramas, tipo });
    }
  });

  if (ingredientesColetados.length === 0) {
    alert("Adicione pelo menos um ingrediente válido!");
    return;
  }

  const idEdicao = document.getElementById("receita-id-edicao").value;

  const dadosReceita = {
    id: idEdicao ? Number(idEdicao) : Date.now(),
    titulo: document.getElementById("input-titulo").value.trim(),
    categoria: document.getElementById("input-categoria").value,
    tempo: document.getElementById("input-tempo").value.trim(),
    porcoes: parseInt(document.getElementById("input-porcoes").value),
    imagem: document.getElementById("input-imagem").value.trim(),
    descricao: document.getElementById("input-descricao").value.trim(),
    preparo: document.getElementById("input-preparo").value.trim(),
    ingredientes: ingredientesColetados
  };

  if (idEdicao) {
    // Atualiza a receita existente
    const indice = receitas.findIndex(r => r.id === Number(idEdicao));
    if (indice !== -1) receitas[indice] = dadosReceita;
  } else {
    // Adiciona nova receita no topo da lista
    receitas.unshift(dadosReceita);
  }

  salvarReceitas(receitas);
  renderizarCatalogo();

  telaFormularioEl.classList.add("oculto");
  abrirReceita(dadosReceita.id);
});
