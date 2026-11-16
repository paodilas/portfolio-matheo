const topo = document.getElementById('topo');
const abrirMenu = document.getElementById('abrirMenu');
const navegacao = document.getElementById('navegacao');
const voltar = document.getElementById('voltar');
const links = document.querySelectorAll('.navegacao a[href^="#"]');
const secoes = document.querySelectorAll('main section[id]');

let esperandoQuadro = false;

window.addEventListener('scroll', () => {
  if (esperandoQuadro) return;
  esperandoQuadro = true;

  requestAnimationFrame(() => {
    const y = window.scrollY;
    topo.classList.toggle('fixado', y > 40);
    voltar.classList.toggle('visivel', y > 500);
    marcarLinkAtual(y);
    esperandoQuadro = false;
  });
}, { passive: true });

function marcarLinkAtual(y) {
  let atual = '';
  secoes.forEach(secao => {
    if (y >= secao.offsetTop - 140) atual = secao.id;
  });
  links.forEach(link => {
    link.classList.toggle('atual', link.getAttribute('href') === '#' + atual);
  });
}

abrirMenu.addEventListener('click', () => {
  const aberta = navegacao.classList.toggle('aberta');
  abrirMenu.setAttribute('aria-expanded', aberta);
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && navegacao.classList.contains('aberta')) {
    navegacao.classList.remove('aberta');
    abrirMenu.setAttribute('aria-expanded', 'false');
    abrirMenu.focus();
  }
});

links.forEach(link => {
  link.addEventListener('click', () => {
    navegacao.classList.remove('aberta');
    abrirMenu.setAttribute('aria-expanded', 'false');
  });
});

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visto');
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.revelar').forEach(item => observador.observe(item));

const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const contadores = document.querySelectorAll('.contador');

const olhoContador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;
    animarContador(entrada.target);
    olhoContador.unobserve(entrada.target);
  });
}, { threshold: 0.6 });

if (!movimentoReduzido) {
  contadores.forEach(contador => {
    contador.textContent = '0';
    olhoContador.observe(contador);
  });
}

function animarContador(elemento) {
  const alvo = Number(elemento.dataset.alvo);
  const duracao = 1200;
  const inicio = performance.now();

  function passo(agora) {
    const avanco = Math.min((agora - inicio) / duracao, 1);
    const suave = 1 - Math.pow(1 - avanco, 3);
    elemento.textContent = Math.round(alvo * suave);
    if (avanco < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo);
}

const palavra = document.getElementById('palavra');
const termos = ['sistema no ar', 'página que vende', 'processo automatizado'];
let indiceTermo = 0;
let indiceLetra = 0;
let apagando = false;

function escrever() {
  const termo = termos[indiceTermo];
  indiceLetra = apagando ? indiceLetra - 1 : indiceLetra + 1;
  palavra.textContent = termo.substring(0, indiceLetra);

  let espera = apagando ? 45 : 85;

  if (!apagando && indiceLetra === termo.length) {
    espera = 2200;
    apagando = true;
  } else if (apagando && indiceLetra === 0) {
    apagando = false;
    indiceTermo = (indiceTermo + 1) % termos.length;
    espera = 400;
  }

  setTimeout(escrever, espera);
}

if (!movimentoReduzido) {
  palavra.textContent = '';
  setTimeout(escrever, 700);
}

const filtros = document.querySelectorAll('.filtro');
const projetos = document.querySelectorAll('.projeto');

filtros.forEach(botao => {
  botao.addEventListener('click', () => {
    filtros.forEach(outro => {
      outro.classList.remove('ativo');
      outro.setAttribute('aria-pressed', 'false');
    });
    botao.classList.add('ativo');
    botao.setAttribute('aria-pressed', 'true');

    const escolhido = botao.dataset.filtro;
    projetos.forEach(projeto => {
      const mostrar = escolhido === 'todos' || projeto.dataset.tipo === escolhido;
      projeto.classList.toggle('oculto', !mostrar);
    });
  });
});

const formulario = document.getElementById('formulario');
const sucesso = document.getElementById('sucesso');
let esconderSucesso;

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nome = document.getElementById('nome');
  const email = document.getElementById('email');
  const mensagem = document.getElementById('mensagem');
  let valido = true;

  valido = validar(nome, 'erroNome', nome.value.trim().length >= 3, 'Escreva seu nome com pelo menos 3 letras.') && valido;
  valido = validar(email, 'erroEmail', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Informe um e-mail válido.') && valido;
  valido = validar(mensagem, 'erroMensagem', mensagem.value.trim().length >= 10, 'Conte um pouco mais, com pelo menos 10 letras.') && valido;

  if (!valido) {
    limparSucesso();
    formulario.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  const texto = 'Olá Matheo, meu nome é ' + nome.value.trim() + '.\n' +
    'E-mail: ' + email.value.trim() + '\n\n' +
    mensagem.value.trim();

  window.open('https://wa.me/5561992197635?text=' + encodeURIComponent(texto), '_blank', 'noopener');

  formulario.reset();
  sucesso.textContent = 'Abrindo o WhatsApp com a sua mensagem.';
  sucesso.classList.add('visivel');
  clearTimeout(esconderSucesso);
  esconderSucesso = setTimeout(limparSucesso, 6000);
});

function limparSucesso() {
  clearTimeout(esconderSucesso);
  sucesso.textContent = '';
  sucesso.classList.remove('visivel');
}

function validar(campo, idErro, condicao, aviso) {
  const erro = document.getElementById(idErro);
  campo.parentElement.classList.toggle('invalido', !condicao);
  campo.setAttribute('aria-invalid', !condicao);
  erro.textContent = condicao ? '' : aviso;
  return condicao;
}

document.querySelectorAll('.campo input, .campo textarea').forEach(campo => {
  campo.addEventListener('input', () => {
    campo.parentElement.classList.remove('invalido');
    campo.setAttribute('aria-invalid', 'false');
    const erro = campo.parentElement.querySelector('.erro');
    if (erro) erro.textContent = '';
  });
});

marcarLinkAtual(window.scrollY);
