let URL = "";

// Retorna os dados de um endpoint por GEY
function obterDados(endpoint) {

    return new Promise((resolve, reject) => {

        $.get( URL + endpoint, (data) => {
            
            if(data.erro === true) {

                reject(data);

            } else {

                resolve(data);

            }

        })

    });

}

function enviarDados(endpoint, dados) {

    return new Promise((resolve, reject) => {

        let dadosEnviar = {
            dados: dados
        }

        $.ajax({
            type: "POST",
            url: URL + endpoint,
            data: dadosEnviar,
            beforeSend: () => {

                $('.body-100').loading({
                    stoppable: true
                });

            },
            success: (data) => {

                $('.body-100').loading('stop');
                
                if(data.erro === true) {

                    reject(data);
    
                } else {
    
                    resolve(data);
    
                }

            }
        });

    });

}

function alterarDados(endpoint, dados) {

    return new Promise((resolve, reject) => {

        let dadosEnviar = {
            dados: dados
        }

        $.ajax({
            type: "PATCH",
            url: URL + endpoint,
            data: dadosEnviar,
            beforeSend: () => {

                $('.body-100').loading({
                    stoppable: true
                });

            },
            success: (data) => {

                $('.body-100').loading('stop');
                
                if(data.erro === true) {

                    reject(data);
    
                } else {
    
                    resolve(data);
    
                }

            }
        });

    });

}

function apagarDados(endpoint) {

  return new Promise((resolve, reject) => {

      $.ajax({
          type: "DELETE",
          url: URL + endpoint,
          beforeSend: () => {

              $('.body-100').loading({
                  stoppable: true
              });

          },
          success: (data) => {

              $('.body-100').loading('stop');
              
              if(data.erro === true) {

                  reject(data);
  
              } else {
  
                  resolve(data);
  
              }

          }
      });

  });

}