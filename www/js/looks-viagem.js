var categorias = [
  { value: 'calças', text: 'Calças' },
  { value: 'casacos', text: 'Casacos' },
  { value: 'camisas', text: 'Camisas' },
  { value: 'jaquetas', text: 'Jaquetas' },
  { value: 'vestidos', text: 'Vestidos' },
  { value: 'saia', text: 'Saia' },
  { value: 'shorts', text: 'Shorts' },
  { value: 'tops', text: 'Tops' },
  { value: 'tricot', text: 'Tricot' },
  { value: 'biquini', text: 'Biquíni' },
  { value: 'saida-de-praia', text: 'Saída de Praia' },
  { value: 'sapatos', text: 'Sapatos' },
  { value: 'salto-alto', text: 'Salto Alto' },
  { value: 'salto-baixo', text: 'Salto Baixo' },
  { value: 'salto-medio', text: 'Salto Médio' },
  { value: 'sem-salto', text: 'Sem Salto' },
  { value: 'bolsas', text: 'Bolsas' },
  { value: 'acessorios', text: 'Acessórios' },
  { value: 'joias', text: 'Jóias' }
]

var app = new Vue({
  el: '#app',
  data: {
    server: '',
    viagem: {},
    categoriaSelecionada: '',
    categorias: categorias,
    looks_apresentados: [],
    looks_selecionados: [],
    ids_selecionados: []
  },
  created: async function () {
    const id = decodeURIComponent(
      window.location.search.replace(
        new RegExp(
          '^(?:.*[&\\?]' +
            encodeURIComponent('id').replace(/[\.\+\*]/g, '\\$&') +
            '(?:\\=([^&]*))?)?.*$',
          'i'
        ),
        '$1'
      )
    )
    const response = await obterDados(this.server + 'viagens/id/' + id)

    this.viagem = response.resultado[0]

    if (this.viagem.look_ids != null) {
      const looks = JSON.parse(this.viagem.look_ids)
      this.looks_selecionados = Array.isArray(looks) ? looks : []
    }

    call()
  },
  methods: {
    buscarLooks: async function () {
      this.looks_apresentados = []

      const server = this.server
      const response = await obterDados(
        server + 'looks/categorias/' + this.categoriaSelecionada + '?like=true'
      )

      for (const look of response.resultado) {
        const pecas = JSON.parse(look.pecas)
        let foto = ''
        if (pecas.length > 0) {
          foto = JSON.parse(pecas[0].fotos)[0]
        }
        look['foto'] = server + 'uploads/' + foto
      }

      this.looks_apresentados = response.resultado
      console.log(this.looks_apresentados)
    },
    selecionar: async function (look) {
      const val = this.looks_selecionados.find(l => l.look_id === look.look_id)
      if (val) {
        return (this.looks_selecionados = this.looks_selecionados.filter(
          l => l.look_id !== look.look_id
        ))
      }

      this.looks_selecionados.push(look)
    },
    concluir: async function () {
      const look_ids = JSON.stringify(this.looks_selecionados)
      const response = await alterarDados(
        this.server + 'viagens/' + this.viagem.viagem_id,
        { look_ids }
      )
      window.location = encodeURI('/index.html')
    },
    abrirLook: function (id) {
      window.open(
        encodeURI('/detalhes-look.html?id=' + parseInt(id)),
        '_blank' // <- This is what makes it open in a new window.
      )
    }
  }
})

function call () {
  $(document).ready(function () {
    $('#titulo-viagem').text(app.viagem.cidade)
  })
}
