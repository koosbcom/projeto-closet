function buscarLooks(todos) {
  let busca = $('#buscarLooks').val();

  $('.body-100').loading({
    stoppable: true,
  });

  let queryBusca = ``;
  if (todos) queryBusca = 'looks/todos/12';
  else queryBusca = 'looks/nome/' + busca;

  obterDados(queryBusca)
    .then((result) => {
      $('.body-100').loading('stop');
      carregarLooks(result);
    })
    .catch((err) => {
      $('.body-100').loading('stop');
      
      $.toast({
        heading: 'Erro',
        text:
          '20 - Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function carregarLooks(result) {
  let looks = result.resultado;
  let contador = 0;
  let colunas = [1, 1, 1];

  $('#coluna-looks-0').empty();
  $('.looks-start-0:eq(0)')
    .clone()
    .appendTo('#coluna-looks-0');

  $('#coluna-looks-1').empty();
  $('.looks-start-1:eq(0)')
    .clone()
    .appendTo('#coluna-looks-1');

  $('#coluna-looks-2').empty();
  $('.looks-start-2:eq(0)')
    .clone()
    .appendTo('#coluna-looks-2');

    const imgPadrao = {
      calças: 'default-1.png',
      casacos: 'default-1.png',
      camisas: 'default-1.png',
      jaquetas: 'default-1.png',
      vestidos: 'default-1.png',
      saia: 'default-1.png',
      shorts: 'default-1.png',
      tops: 'default-1.png',
      tricot: 'default-1.png',
      biquini: 'default-1.png',
      'saida-de-praia': 'default-1.png',
      'sapatos': 'default-1.png',
      'salto-alto': 'default-1.png',
      'salto-baixo': 'default-1.png',
      'salto-medio': 'default-1.png',
      'sem-salto': 'default-1.png',
      bolsas: 'default-1.png',
      acessorios: 'default-1.png',
      joias: 'default-1.png',
    }

  for (let i = 0; i < looks.length; i++) {
    const pecas = JSON.parse(looks[i].pecas);
    let fotosPecas = []
    if (pecas.length > 0)
      fotosPecas = pecas[0].fotos && typeof(pecas[0].fotos) === 'string'  ? JSON.parse(pecas[0].fotos) : pecas[0].fotos
    else {
      let categoria

      try {
        const catConvertida = JSON.parse(looks[i].categorias)
        categoria = catConvertida[0]
      } catch(e) {
        console.error(e)
        categoria = 'casacos'
      }

      fotosPecas.push(imgPadrao[categoria])
    }

    $('.looks-start-' + contador + ':eq(0)')
      .clone()
      .appendTo('#coluna-looks-' + contador);
    $('.looks-start-' + contador + ':eq(' + colunas[contador] + ')').show();

    $('.looks-look-' + contador + ':eq(' + colunas[contador] + ')').css(
      'background-image',
      'url(uploads/' + fotosPecas[0] + ')'
    );
    $('.escrito-look-' + contador + ':eq(' + colunas[contador] + ')').html(
      looks[i].nome
    );
    $('.id-look-' + contador + ':eq(' + colunas[contador] + ')').html(
      looks[i].look_id
    ).hide();

    colunas[contador]++;

    contador++;
      
    if (contador > 2) {
      contador = 0;
    }

  }
}

function looksCategoria(categoria) {
  $('.body-100').loading({
    stoppable: true,
  });

  obterDados('looks/categorias/' + categoria + '?like=true')
    .then((result) => {
      $('.body-100').loading('stop');
      carregarLooks(result);
    })
    .catch((err) => {
      $('.body-100').loading('stop');

      $.toast({
        heading: 'Erro',
        text:
          '22 - Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function buscarLook() {
  const busca = $('#buscarLooks').val();
  if (!busca) return null;

  $('.body-100').loading({ stoppable: true });

  obterDados('looks/nome/' + busca + '?like=true')
    .then((result) => {
      $('.body-100').loading('stop');
      carregarLooks(result);
    })
    .catch((err) => {
      $('.body-100').loading('stop');

      $.toast({
        heading: 'Erro',
        text:
          '25 - Não foi possível se conectar ao servidor. Certifique-se que seu computador está conectado a internet e tente novamente mais tarde.',
        showHideTransition: 'slide',
        icon: 'error',
      });
    });
}

function detalharLook (event) {
  const idLook = event.toElement.parentElement.children[0].innerHTML
  const id = idLook.trim()
  window.location = encodeURI("/detalhes-look.html?id=" + parseInt(id))
}

