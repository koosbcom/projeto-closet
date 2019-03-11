$(document).ready(function() {
  criarLoading()
  obterDados('looks/id/' + $.urlParam('id'))
    .then((result) => {
      const look = result.resultado[0];

      preencherPagina(look);
      pararLoading()
      
    })
    .catch((error) => {
      console.error(error);
      gerarToast();
    });
});

const gerarToast = function() {
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

const preencherPagina = function(look) {
  const pecas = JSON.parse(look.pecas);
  const pecasParse = pecas.map((item) => {
    item.fotos = JSON.parse(item.fotos);
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
};

const excluir = function () {

  criarLoading()
  apagarDados('/looks/' + $.urlParam('id'))
    .then((result) => {
      pararLoading()
      window.location = '/index.html'

    }).catch((error) => {
      console.error(error)
      gerarToast()
    })

}

$.urlParam = function(name) {
  var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
    window.location.href
  );
  if (results == null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
};


