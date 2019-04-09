const pecasLook = [];
let id = 0
let pecasLooksADD = []
let pecasLooksDEL = []
let historico = []

$(document).ready(function () {
  recuperarLook()
});

const recuperarLook = function () {
  criarLoading()
  id = $.urlParam('id')
  obterDados('looks/id/' + id)
    .then((result) => {
      const look = result.resultado[0];
      try {
        historico = look.historico && typeof (look.historico) === 'string' ? JSON.parse(look.historico) : []
      }
      catch (e) {
        historico = []
      }
      preencherPagina(look);
      pararLoading()

    })
    .catch((error) => {
      console.error(error);
      gerarToast();
    });
}

const gerarToast = function () {
  $.toast({
    heading: 'Erro',
    text:
      'Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
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

const preencherPagina = function (look) {
  const pecas = JSON.parse(look.pecas);

  for (let peca of pecas) {
    adicionarPecaLook(peca)
    pecasLooksADD.pop()
  }

  const pecasParse = pecas.map((item) => {
    item.fotos = typeof (item.fotos) === 'string' ? JSON.parse(item.fotos) : item.fotos
    return item;
  });


  let colunas = [1, 1, 1];

  $('#detalhes-nome-look')
    .html(look.nome)
    .show();
  $('#detalhes-notas-look')
    .html(look.observacoes)
    .show();

  let contadorDeColunas = 0;
  const tamanho = pecasParse.length

  $('#nomeLook').val(look.nome)
  $('#observacoes-look').val(look.observacoes)


  let categorias = []
  try {
    categorias = typeof (look.categorias) === 'string' ? JSON.parse(look.categorias) : look.categorias
  } catch (e) {
    categorias.push(look.categorias)
  }

  $('#categorias-look option').each(function (index, item) {
    if (categorias.includes($(item).val())) {
      $(item).attr('selected', 'selected')
    }
  })


  for (let i = 0; i < tamanho; i++) {
    $(`.peca-foto-modelo-${contadorDeColunas}:eq(0)`)
      .clone()
      .appendTo('.coluna-pecas-' + contadorDeColunas);

    $(`.peca-foto-modelo-${contadorDeColunas}:eq(${colunas[contadorDeColunas]})`).show();

    $(`.peca-foto-modelo-${contadorDeColunas}:eq(${colunas[contadorDeColunas]})`)
      .css('background-image', 'url(uploads/' + pecasParse[i].fotos[0] + ')')

    colunas[contadorDeColunas] += 1;
    contadorDeColunas += 1;

    if (contadorDeColunas > 2) {
      contadorDeColunas = 0;
    }
  }

  for (const registro of historico) {
    $('.linha-acao1 .registro-acao').first().html(`${registro.acao} "${registro.peca}"`)
    $('.linha-acao1 .registro-data').first().html(`${registro.data}`)
    $('.linha-acao1').first().clone().appendTo('.div-usos').show()
  }
};

$.urlParam = function (name) {
  var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
    window.location.href
  );
  if (results == null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
};

$('#btn-editar').click(function () {
  console.log(`click`)
  $('.section-infos-basicas').hide()
  $('.section-cadastro').hide()
  $('.section-inofs').hide()

  $('.section-edit').show()

})

$('#wf-form-cadastro-peca').submit(function (event) {
  event.preventDefault()
  criarLoading()

  const dados = {
    nome: $('#nomeLook').val(),
    observacoes: $('#observacoes-look').val(),
    categorias: JSON.stringify($('#categorias-look').val()),
    pecas: JSON.stringify(pecasLook),
  }


  for (peca of pecasLooksADD) {
    const item = {
      peca: peca.categoria,
      acao: 'Adicionou',
      data: moment().format('DD/MM/YYYY')
    }
    historico.push(item)
  }

  for (peca of pecasLooksDEL) {
    const item = {
      peca: peca.categoria,
      acao: 'Removeu',
      data: moment().format('DD/MM/YYYY')
    }
    historico.push(item)
  }
  pecasLooksADD = []
  pecasLooksDEL = []

  dados['historico'] = JSON.stringify(historico)
  alterarDados('/looks/' + id, dados)
    .then(recuperarLook)
    .then((result) => {
      console.log(result)
      pararLoading()
      $('.section-infos-basicas').show()
      $('.section-cadastro').show()
      $('.section-inofs').show()
      $('.section-edit').hide()
    })
    .catch(error => {
      gerarToast()
    })

})

$('#btn-excluir').click(function () {
  criarLoading()
  apagarDados('/looks/' + $.urlParam('id'))
    .then((result) => {
      pararLoading()
      window.location = '/index.html'

    }).catch((error) => {
      console.error(error)
      gerarToast()
    })
})

$('#Tipo-Peca-2').change(function () {
  $('.body-100').loading({
    stoppable: true,
  });

  obterDados('pecas/categoria/' + this.value)
    .then(result => {
      $('.body-100').loading('stop');

      const pecas = result.resultado;

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
      gerarToast()
    });
})


function adicionarPecaLook(peca) {
  pecasLooksADD.push(peca)
  pecasLook.push(peca);
  $('#pecas-escolhidas-look').empty();

  if (pecasLook.length > 0) {
    for (let i = 0; i < pecasLook.length; i++) {
      let fotosPecas = typeof (pecasLook[i].fotos) === 'string' ? JSON.parse(pecasLook[i].fotos) : pecasLook[i].fotos
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

$('#btn-cancelar').click(function () {
  $('.section-infos-basicas').show()
  $('.section-cadastro').show()
  $('.section-inofs').show()
  $('.section-edit').hide()
})


function removerPecaLook(index) {
  const idPecaRemovida = pecasLook[index].peca_id
  const indexPecaRemovida = pecasLooksADD.findIndex(item => item.peca_id === idPecaRemovida)
  if (indexPecaRemovida === -1) pecasLooksDEL.push(pecasLook[index])

  pecasLook.splice(index, 1);

  $('#pecas-escolhidas-look').empty();

  if (pecasLook.length > 0) {
    for (let i = 0; i < pecasLook.length; i++) {
      let fotosPecas = typeof (pecasLook[i].fotos) === 'string' ? JSON.parse(pecasLook[i].fotos) : pecasLook[i].fotos
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