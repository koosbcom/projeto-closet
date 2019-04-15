$('#login-form').submit(function(evt){

    evt.preventDefault();

    $('.body-1000').loading({
        stoppable: true
    });

    let dados = {
        email: $('#email').val(),
        senha: $('#senha').val()
    };

    enviarDados('users/login', dados)
    .then((result) => {

        if(result.resultado.length > 0) {

            localStorage.setItem('user', JSON.stringify(result.resultado));

            window.location = "/index.html";

        } else {

            $.toast({
                heading: 'Erro',
                text: 'Email ou senha incorretos.',
                showHideTransition: 'slide',
                icon: 'error'
            })

        }

        $('.body-1000').loading('stop');

    })
    .catch((err) => {

        $.toast({
            heading: 'Erro',
            text: 'Não foi possível conectar ao servidor. Certifique-se que sua internet está funcionando normalmente e tente novamente mais tarde.',
            showHideTransition: 'slide',
            icon: 'error'
        })

        $('.body-1000').loading('stop');

    })

});