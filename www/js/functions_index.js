let fotos = [];
let pecasLook = [];
let hoje = new Date();
let meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

let mesHoje = hoje.getMonth();
let mesSelecionado = mesHoje;

let anoHoje = hoje.getFullYear();
let anoSelecionado = anoHoje;

const gerarToast = function (text) {
  $.toast({
    heading: 'Erro',
    text: text || 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
    showHideTransition: 'slide',
    icon: 'error',
  });

  $('.body-100').loading('stop');
};

const criarLoading = function () {
  $('.body-100').loading({
    stoppable: true,
  });
}

const pararLoading = function () {
  $('.body-100').loading('stop');
}
// Adiciona uma nova peça no sistema
$('#add-peca').submit(function (evt) {
  evt.preventDefault();

  try {
    $('.body-100').loading({
      stoppable: true,
    });

    let dados = {
      marca: $('#marca').val(),
      categoria: $('#categoria').val(),
      observacoes: $('#observacoes').val(),
    };

    $('#add-peca').ajaxSubmit({
      url: '/pecas',
      type: 'POST',
      data: { dados: dados },
      contentType: 'application/json',
      error: xhr => {
        $('.body-100').loading('stop');

        $.toast({
          heading: 'Erro',
          text: 'Não foi possível adicionar a peça. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
          showHideTransition: 'slide',
          icon: 'error',
        });

      },
      success: response => {
        $('.body-100').loading('stop');

        $('#marca').val('')
        $('#categoria').val('')
        $('#observacoes').val('')
        $('.foto-preview:eq("0")').remove();
        $('.foto-upload:eq("0")').remove();
        fotos = []

        $.toast({
          heading: 'Sucesso',
          text: 'Sua peça foi adicionada com sucesso.',
          showHideTransition: 'slide',
          icon: 'success',
        });

        atualizarPecas();
      },
    });
  } catch (e) {
    gerarToast()
  }
});

$('#form-busca-pecas').submit(function (e) {
  event.preventDefault()
  buscarPecas()
})

$('#form-busca-looks').submit(function (e) {
  event.preventDefault()
  buscarLook()
})



// Adiciona uma nova viagem no sistema
$('#add-viagem-form').submit(function (evt) {
  evt.preventDefault();

  $('.body-100').loading({
    stoppable: true,
  });

  let dados = {
    cidade: $('#cidade').val(),
    dataInicio: $('#data-inicio').val(),
    dataVolta: $('#data-volta').val(),
  };

  let keys = Object.keys(dados);

  for (let i = 0; i < keys.length; i++) {
    if (dados[keys[i]] === null || dados[keys[i]] === '') {
      return $.toast({
        heading: 'Erro',
        text: 'O campo ' + keys[i] + ' não pode ser nulo.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    }
  }

  if ($('#viagemID').val() !== '') {
    alterarDados('viagens/' + $('#viagemID').val(), dados)
      .then(result => {
        atualizarViagens();

        $('.body-100').loading('stop');

        $('#cidade').val('');
        $('#data-inicio').val('');
        $('#data-volta').val('');
        $('#viagemID').val('');

        $('#mod-viagem-form').hide()

        return $.toast({
          heading: 'Sucesso',
          text: 'Sua viagem foi modificada com sucesso.',
          showHideTransition: 'slide',
          icon: 'success',
        });

        gerarCalendario(mesSelecionado || data.getMonth(), anoSelecionado || data.getFullYear());
      })
      .catch(err => {
        $('.body-100').loading('stop');

        $.toast({
          heading: 'Erro',
          text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
          showHideTransition: 'slide',
          icon: 'error',
        });
      });
  } else {
    enviarDados('viagens', dados)
      .then(result => {
        atualizarViagens();

        $('#cidade').val('');
        $('#data-inicio').val('');
        $('#data-volta').val('');
        $('#viagemID').val('');

        $('#mod-viagem-form').hide()

        $('.body-100').loading('stop');

        return $.toast({
          heading: 'Sucesso',
          text: 'Sua viagem foi adicionada com sucesso.',
          showHideTransition: 'slide',
          icon: 'success',
        });
      })
      .catch(err => {
        $('.body-100').loading('stop');

        $.toast({
          heading: 'Erro',
          text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
          showHideTransition: 'slide',
          icon: 'error',
        });
      });
  }
});

// Funções executadas ao iniciar a página
$(document).ready(function () {
  if (localStorage.getItem('user') === null) {
    window.location = '/login.html';
  }

  categoriaPecasLook('calças')
  $('.date').mask('00/00/0000');

  $('#mesHoje').html(meses[mesSelecionado] + ' ' + anoSelecionado);

  atualizarPecas();
  atualizarViagens();
  buscarLooks(true);

  const data = new Date()
  gerarCalendario(data.getMonth(), data.getFullYear());
});

// Adiciona uma nova foto a uma peça
function adicionarFoto() {
  $('.foto-upload').last().click();
}

// Faz o preview de uma imagem que foi uploadada
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    
    reader.onload = function (e) {

      $('.foto-preview:eq(' + fotos.length + ')')
        .clone()
        .appendTo('.block-fotod');
      $('.foto-preview:eq(' + fotos.length + ')').show();
      $('.foto-preview:eq(' + fotos.length + ')').css(
        'background-image',
        'url(' + e.target.result + ')'
      );
      $('.foto-upload:eq(' + fotos.length + ')').clone().appendTo('#upload');

      fotos.push(input);

      $('.block-menos:eq(' + fotos.length + ')').attr(
        'onclick',
        'retirarFoto(' + fotos.length + ')'
      );

    };
    reader.readAsDataURL(input.files[0]);
    if (fotos.length > 0) retirarFoto(fotos.length - 1)
  }
  
}

// Retira uma imagem
function retirarFoto(posicao) {
  fotos = []
  $('.foto-preview').first().remove();
  $('.foto-upload').first().remove();
}

// Atualiza as viagens na página inicial
function atualizarViagens() {
  $('.body-100').loading({
    stoppable: true,
  });

  obterDados('viagens/todos/100')
    .then(result => {
      $('.body-100').loading('stop');
      if (result.resultado.length < 1) {
        $('#mod-viagem-form').show()
        adicionarViagem()
      }
      carregarViagens(result);
    })
    .catch(err => {
      $('.body-100').loading('stop');

      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

// Atualiza as pecas na página inicial
function atualizarPecas() {
  obterDados('pecas/todos/12')
    .then(result => {
      carregarPecas(result);
    })
    .catch(err => {
      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

// Carrega as viagens a partir de um dataset de resultado
function carregarViagens(result) {
  let viagens = result.resultado;

  $('#viagens').empty();

  for (let i = 0; i < viagens.length; i++) {
    $('.viagem:eq(0)').clone().appendTo('#viagens');
    $('.viagem:eq(' + parseInt(i + 1) + ')').show();

    $('.cidade-viagem:eq(' + parseInt(i + 1) + ')').html(viagens[i].cidade);
    $('.data-viagem:eq(' + parseInt(i + 1) + ')').html(
      'de ' + viagens[i].dataInicio + ' a ' + viagens[i].dataVolta
    );
    $('.viagem:eq(' + parseInt(i + 1) + ')').attr(
      'onclick',
      'modificarViagem(' + JSON.stringify(viagens[i]) + ')'
    );
  }
}

// Carrega as peças a partir de um dataset de resultado
function carregarPecas(result) {
  let pecas = result.resultado;
  let contador = 0;
  let colunas = [1, 1, 1];

  $('#coluna-pecas-0').empty();
  $('.pecas-start-0:eq(0)').clone().appendTo('#coluna-pecas-0');

  $('#coluna-pecas-1').empty();
  $('.pecas-start-1:eq(0)').clone().appendTo('#coluna-pecas-1');

  $('#coluna-pecas-2').empty();
  $('.pecas-start-2:eq(0)').clone().appendTo('#coluna-pecas-2');

  for (let i = 0; i < pecas.length; i++) {
    let fotosPecas = JSON.parse(pecas[i].fotos);

    $('.pecas-start-' + contador + ':eq(0)')
      .clone()
      .appendTo('#coluna-pecas-' + contador);
    $('.pecas-start-' + contador + ':eq(' + colunas[contador] + ')').show();
    $('.peca-peca-' + contador + ':eq(' + colunas[contador] + ')').css(
      'background-image',
      'url(uploads/' + fotosPecas[0] + ')'
    );
    $('.escrito-peca-' + contador + ':eq(' + colunas[contador] + ')').html(
      pecas[i].marca
    );
    //$('.pecas-start:eq(' + parseInt(contador + 1) + ')').hide();

    colunas[contador]++;

    contador++;

    if (contador > 2) {
      contador = 0;
    }
  }
}

function pecasCategoria(categoria) {
  $('.body-100').loading({
    stoppable: true,
  });

  obterDados('pecas/categoria/' + categoria)
    .then(result => {
      $('.body-100').loading('stop');

      carregarPecas(result);
    })
    .catch(err => {
      $('.body-100').loading('stop');

      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function buscarPecas() {
  let busca = $('#buscaPecas').val();
  if (!busca) return null
  $('.body-100').loading({
    stoppable: true,
  });
  
  obterDados('pecas/marca/' + busca)
    .then(result => {
      $('.body-100').loading('stop');

      carregarPecas(result);
    })
    .catch(err => {
      $('.body-100').loading('stop');

      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function categoriaPecasLook(categoria) {
  $('.body-100').loading({
    stoppable: true,
  });

  obterDados('pecas/categoria/' + categoria)
    .then(result => {
      $('.body-100').loading('stop');

      let pecas = result.resultado;

      const ids = pecasLook.map(item => item.peca_id) 
      pecas = pecas.filter(peca => !ids.includes(peca.peca_id))

      $('#pecas-escolher-looks').empty();

      for (let i = 0; i < pecas.length; i++) {
        let fotosPecas = JSON.parse(pecas[i].fotos);
        let classIndex = i + 1;

        $('.peca-escolha-look:eq(0)')
          .clone()
          .appendTo('#pecas-escolher-looks');
        $('.peca-escolha-look:eq(' + classIndex + ')').show();
        $('.peca-escolha-look:eq(' + classIndex + ')').css(
          'background-image',
          'url("uploads/' + fotosPecas[0] + '")'
        );
        $('.peca-escolha-look:eq(' + classIndex + ')').attr(
          'onclick',
          'adicionarPecaLook(' + JSON.stringify(pecas[i]) + ')'
        );
      }
    })
    .catch(err => {
      $('.body-100').loading('stop');

      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function adicionarPecaLook(peca) {
  pecasLook.push(peca);
  categoriaPecasLook($('#Tipo-Peca-2').val())
  $('#pecas-escolhidas-look').empty();

  if (pecasLook.length > 0) {
    for (let i = 0; i < pecasLook.length; i++) {
      let fotosPecas = JSON.parse(pecasLook[i].fotos);
      let classIndex = i + 1;

      $('.peca-escolhida-look:eq(0)')
        .clone()
        .appendTo('#pecas-escolhidas-look');
      $('.peca-escolhida-look:eq(' + classIndex + ')').show();
      $('.peca-escolhida-look:eq(' + classIndex + ')').css(
        'background-image',
        'url("uploads/' + fotosPecas[0] + '")'
      );
      $('.peca-escolhida-look:eq(' + classIndex + ')').attr(
        'onclick',
        'removerPecaLook(' + i + ')'
      );
    }
  }
}

function removerPecaLook(index) {
  pecasLook.splice(index, 1);
  categoriaPecasLook($('#Tipo-Peca-2').val())

  $('#pecas-escolhidas-look').empty();

  if (pecasLook.length > 0) {
    for (let i = 0; i < pecasLook.length; i++) {
      let fotosPecas = JSON.parse(pecasLook[i].fotos);
      let classIndex = i + 1;

      $('.peca-escolhida-look:eq(0)')
        .clone()
        .appendTo('#pecas-escolhidas-look');
      $('.peca-escolhida-look:eq(' + classIndex + ')').show();
      $('.peca-escolhida-look:eq(' + classIndex + ')').css(
        'background-image',
        'url("uploads/' + fotosPecas[0] + '")'
      );
      $('.peca-escolhida-look:eq(' + classIndex + ')').attr(
        'onclick',
        'removerPecaLook(' + i + ')'
      );
    }
  }
}

function adicionarLook() {
  let dados = {
    nome: $('#nomeLook').val(),
    observacoes: $('#observacoesLook').val(),
    categorias: JSON.stringify($('#categoriasLook').val()),
    pecas: JSON.stringify(pecasLook),
  };

  enviarDados('looks', dados)
    .then(result => {
      $.toast({
        heading: 'Sucesso',
        text: 'Sua peça foi adicionada com sucesso.',
        showHideTransition: 'slide',
        icon: 'success',
      });

      $('#nomeLook').val('')
      $('#observacoesLook').val('')
      $('#categoriasLook').val('')
      $('#Tipo-Peca-2').val('')
      $('#pecas-escolhidas-look').empty()
      $('#pecas-escolher-looks').empty()
      pecasLook = []

      buscarLooks(true)

    })
    .catch(err => {
      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

$('#wf-form-cadastro-peca').submit(function(ev) {
  ev.preventDefault()
  adicionarLook()
})

// Prepara os campos para modificar uma viagem
function modificarViagem(viagem) {
  $('#cidade').val(viagem.cidade);
  $('#data-inicio').val(viagem.dataInicio);
  $('#data-volta').val(viagem.dataVolta);
  $('#viagemID').val(viagem.viagem_id);

  $('#submit-viagem').val('Modificar');
  $('#btn-deletar-viagem').show()

  $('#mod-viagem-form').css({
    display: 'flex',
    transition: 'transform 500ms ease 0s, opacity 200ms ease 0s',
    opacity: 1,
    transform: 'translateX(0px) translateY(0px)',
  });
}

// Prepara os campos para adicionar uma viagem
function adicionarViagem() {
  $('#cidade').val('');
  $('#data-inicio').val('');
  $('#data-volta').val('');
  $('#viagemID').val('');

  $('#submit-viagem').val('Adicionar');
  $('#btn-deletar-viagem').hide();

  //$('#add-viagem-button').trigger( "click" );
}

function logout() {
  localStorage.removeItem('user');

  window.location = '/login.html';
}

function gerarCalendario(mes, ano) {
  obterDados('viagens/todos/20')
    .then(result => {
      const viagens = result.resultado;

      let dia = new Date(ano, mes, 1);
      let diaSemana = dia.getDay();

      let diasDoMes = 1;

      for (let index = 1; index < 6; index++) {
        diasDoMes = preencherSemana(
          viagens,
          mes,
          ano,
          diasDoMes,
          diaSemana,
          index
        );
      }
    })
    .catch(error => {
      $.toast({
        heading: 'Erro',
        text: 'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function preencherSemana(viagens, mes, ano, diasDoMes, diaSemana, semana) {
  const meses = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let i = 0; i < 7; i++) {
    const nomeEvento = preencherNomeDoEvento(viagens, mes, ano, diasDoMes);

    $('.block-dia-' + semana + ':eq(0)')
      .clone()
      .appendTo('.block-semana-' + semana + '');
    $('.block-dia-' + semana + ':eq(' + parseInt(i + 1) + ')').show();
    $('.nome-evento-' + semana + ':eq(' + parseInt(i + 1) + ')').html('');

    if (diasDoMes > meses[mes]) {
      $('.data-evento-' + semana + ':eq(' + parseInt(i + 1) + ')').html('');
    } else if (i < diaSemana && semana === 1) {
      $('.data-evento-' + semana + ':eq(' + parseInt(i + 1) + ')').html('');
    } else {
      $('.nome-evento-' + semana + ':eq(' + parseInt(i + 1) + ')').html(
        nomeEvento
      );
      $('.data-evento-' + semana + ':eq(' + parseInt(i + 1) + ')').html(
        diasDoMes
      );
      diasDoMes++;
    }
  }
  return diasDoMes;
}

function preencherNomeDoEvento(viagens, mes, ano, diaAtual) {
  let nomeEvento = '';

  mes += 1; // Corrigir mês

  for (let viagem of viagens) {
    const dataInicioViagem = (viagem.dataInicio.split('/').reverse().join('-'));
    const dataVoltaViagem = (viagem.dataVolta.split('/').reverse().join('-'));
    const dataCompleta = (`${ano}-${mes}-${diaAtual}`);

    const dataCompletaConvertida = moment(dataCompleta)

    if (dataCompletaConvertida.isSameOrAfter(moment(dataInicioViagem))
      && dataCompletaConvertida.isSameOrBefore(moment(dataVoltaViagem)) ) {
      nomeEvento += viagem.cidade + ' / ';
    }
  }

  if (!nomeEvento) nomeEvento = '';
  else nomeEvento = nomeEvento.substring(0, nomeEvento.length - 2);

  return nomeEvento;
}

function mudarMes(acrescentar) {
  if (acrescentar === false) {
    if (mesSelecionado === 0) {
      mesSelecionado = 11;
      anoSelecionado--;
    } else {
      mesSelecionado--;
    }
  } else if (acrescentar === true) {
    if (mesSelecionado === 11) {
      mesSelecionado = 0;
      anoSelecionado++;
    } else {
      mesSelecionado++;
    }
  }

  $('#mesHoje').html(meses[mesSelecionado] + ' ' + anoSelecionado);

  gerarCalendario(mesSelecionado, anoSelecionado);
}

$('#btn-deletar-viagem').click(function (e) {
  criarLoading()
  const id = $('#viagemID').val()

  apagarDados('/viagens/' + id)
    .then(result => {
      pararLoading()
      atualizarViagens()
      $('#mod-viagem-form').hide()
    })
    .catch(e => {
      gerarToast()
    })

  e.preventDefault()
})