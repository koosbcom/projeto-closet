// jshint esversion: 6
// Bibliotecas
const express = require('express');
const bodyParser= require('body-parser');
const mysql = require('mysql');
const sha1 = require('sha1');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pathModule = require('path');
const app = express();

// Dados de conexão
var db_host = '127.0.0.1';
var db_user = 'root';
var db_senha = '';
var db_name = 'closet';
var tables = ['pecas', 'looks', 'viagens'];
var campos = ['categoria'];

// BodyParser
app.use(bodyParser());

// Multer
app.use(multer({ dest: __dirname + '/uploads/' }).any());

// Arquivos estáticos
app.use('/', express.static(path.join(__dirname, 'www')));
app.use('/uploads/', express.static(path.join(__dirname, 'uploads')));

// Conexao com base de dados
connection = mysql.createConnection({
    host     : db_host,
    user     : db_user,
    password : db_senha,
    database : db_name
});

app.listen(8080, () => {
    console.log('listening on 8080');
});

//Libera requisições CORS
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Funções globais
var validaTabela = function(tabela) {

    let validacao = false;

    for(let i = 0; i < tables.length; i++) {

        if(tabela  === tables[i]) {

            validacao = true;

        }

    }

    return validacao

}

var validaCampos = function(campo) {

    let validacao = false;

    for(let i = 0; i < campos.length; i++) {

        if(campo  === campos[i]) {

            validacao = true;

        }

    }

    return validacao

}

var validaDados = function(dados) {

    let chaves = Object.keys(dados);
    let erro = false;

    // Checa se existe algum campo faltando
    for(let i = 0; i < chaves.length; i++) {

        if(dados[chaves[i]] == null || dados[chaves[i]] == '') {

            erro = 'Campo ' + chaves[i] + ' não pode ser nulo.';

            break;

        }

    }

    return erro;

}

var updateDados = function(dados) {

    let chaves = Object.keys(dados);

    for(let i = 0; i < chaves.length; i++) {

        if(dados[chaves[i]] == null || dados[chaves[i]] == '') {

            delete dados[chaves[i]];

        }

    }

    return dados;

}

var criarQueryInsert = function(dados, table, excluir = []) {

    let query = 'INSERT INTO ' + table + ' (';
    let chaves = Object.keys(dados);

    for(let i = 0; i < chaves.length; i++) {

        if(i !== chaves.length-1) {

            query += chaves[i] + ', ';

        } else {

            query += chaves[i] + ') VALUES (';

        }

    }

    for(let i = 0; i < chaves.length; i++) {

        if((dados[chaves[i]] == null || dados[chaves[i]] == "''") && excluir.indexOf(chaves[i]) === -1) {

            return { erro: true, mensagem: 'O campo ' + chaves[i] + ' não pode ser nulo.'};

            break;

        } 
        
        if(i !== chaves.length-1) {

            query += mysql.escape(dados[chaves[i]]) + ", ";

        } else {

            query += mysql.escape(dados[chaves[i]]) + ")";

        }

    }

    return query;

}

var criarQueryUpdate = function(dados, table, where, excluir = []) {

    let query = 'UPDATE ' + table + ' SET ';
    let chaves = Object.keys(dados);

    for(let i = 0; i < chaves.length; i++) {

        if(i !== chaves.length-1) {

            query += chaves[i] + ' = ' + mysql.escape(dados[chaves[i]]) + ', ';

        } else {

            query += chaves[i] + ' = ' + mysql.escape(dados[chaves[i]]);

        }

    }

    query += ' WHERE ';
    chaves = Object.keys(where);

    for(let i = 0; i < chaves.length; i++) {

        if(i !== chaves.length-1) {

            query += chaves[i] + ' = ' + mysql.escape(where[chaves[i]]) + ' AND ';

        } else {

            query += chaves[i] + ' = ' + mysql.escape(where[chaves[i]]);

        }

    }

    return query;

}

// Endpoints do Express
// Requisições de GET
// Obtém todas as entradas de uma table
app.get('/:table/todos/:limite', (req, res) => {

    let table = req.params.table;
    let limite = req.params.limite;

    if(!validaTabela(table)) {

        return res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

    }

    let query = 'SELECT * FROM ' + table;
    query += ' LIMIT 0, ' + limite;

    connection.query(query, (err, result) => {

        if(err) {

            console.error(JSON.stringify(err));

            res.json({ erro: true, mensagem: err });

            return null;
            
        }

        if(result) {

            res.json({ erro: false, resultado: result });

        } else {

            res.json({ erro: true, mensagem: 'Não foi possível encontrar nenhuma entrada correspondente a busca' });

        }

    });

});

// Busca uma entrada com base no ID
app.get('/:table/id/:_id', (req, res) => {

    let table = req.params.table,
        id = req.params._id;

    if(!validaTabela(table)) {

        return res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

    }

    let query = 'SELECT * FROM ' + table + ' WHERE id = ' + mysql.escape(id);

    connection.query(query, (err, result) => {

        if(err) {

            console.error(JSON.stringify(err));

            res.json({ erro: true, mensagem: err });

            return null;
            
        }

        if(result !== null) {

            res.json({ erro: false, resultado: result });

        } else {

            res.json({ erro: true, mensagem: 'Não foi possível encontrar nenhuma entrada correspondente a busca' });

        }

    });

});

// Busca uma entrada com base em um campo de texto
app.get('/:table/marca/:busca', (req, res) => {

    let table = req.params.table,
        campo = 'marca',
        busca = req.params.busca;

    let dados = {};

    if(!validaTabela(table)) {

        return res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

    }

    let query = 'SELECT * FROM ' + table + ' WHERE ' + campo + " LIKE '%" + busca + "%'";

    console.log('query: ' + query);

    connection.query(query, (err, result) => {

        if(err) {

            console.error(JSON.stringify(err));

            return res.json({ erro: true, mensagem: err });
            
        }

        if(result !== null) {

            res.json({ erro: false, resultado: result });

        } else {

            res.json({ erro: true, mensagem: 'Não foi possível encontrar nenhuma entrada correspondente a busca' });

        }

    });

});

// Busca uma entrada com base no campo pesquisado
app.get('/:table/:campo/:busca', (req, res) => {

    let table = req.params.table,
        campo = req.params.campo,
        busca = req.params.busca;

    let dados = {};

    if(!validaTabela(table)) {

        return res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

    }

    if(!validaCampos(campo)) {

        return res.json({ erro: true, mensagem: 'Campo buscado não existe na base de dados' });

    }

    let query = 'SELECT * FROM ' + table + ' WHERE ' + campo + ' = ' + mysql.escape(busca);

    connection.query(query, (err, result) => {

        if(err) {

            console.error(JSON.stringify(err));

            return res.json({ erro: true, mensagem: err });
            
        }

        if(result !== null) {

            res.json({ erro: false, resultado: result });

        } else {

            res.json({ erro: true, mensagem: 'Não foi possível encontrar nenhuma entrada correspondente a busca' });

        }

    });

});

// Requisições de POST

// Faz o cadastro de um usuário
app.post('/users/cadastro', (req, res) => {

    let dados = req.body.dados;

    if(dados.senha && dados.email) {

        dados.senha = sha1(dados.senha);

        let query = 'SELECT * FROM users WHERE email = ' + mysql.escape(dados.email);

        connection.query(query, (err, result) => {

            if(err) {

                console.error(JSON.stringify(err));

                res.json({ erro: true, mensagem: JSON.stringify(err) });

            } else {

                if(result === null) {

                    let query = criarQueryInsert(dados, 'users');

                    connection.query(query, (err, result) => {

                        if(err) {
            
                            console.error(JSON.stringify(err));
            
                            res.json({ erro: true, mensagem: JSON.stringify(err) });
            
                        } else {
            
                            res.json({ erro: false, resultado: result });
            
                        }
            
                    });

                } else {

                    res.json({ erro: true, mensagem: 'Email já cadastrado' })

                }

            }

        });

    } else {

        res.json({ erro: true, mensagem: 'Email e senha são campos obrigatórios.' })

    }

});

// Faz o login de um usuário
app.post('/users/login', (req, res) => {

    if(req.body.dados.email && req.body.dados.senha) {

        let email = req.body.dados.email,
            senha = req.body.dados.senha;

        if(email != null && senha != null) {

            let query = 'SELECT * FROM users WHERE email = ' + mysql.escape(email) + ' AND senha = ' + mysql.escape(sha1(senha));

            connection.query(query, (err, result) => {

                if(err) {
            
                    console.error(JSON.stringify(err));
    
                    res.json({ erro: true, mensagem: JSON.stringify(err) });
    
                } else {

                    if(result === null) {

                        res.json({ erro: true, mensagem: 'Email ou senha incorretos.' });

                    } else {

                        res.json({ erro: false, resultado: result });

                    }
    
                }

            });

        } else {

            res.json({ erro: true, mensagem: 'Os campos email e senha não podem ser nulos.' });

        }

    } else {

        res.json({ erro: true, mensagem: 'Os campos email e senha precisam ser enviados.' });

    }

});

// Adiciona um peca
app.post('/pecas', (req, res) => {

    let table = 'pecas';

    let dados = req.body.dados;
    let erro = validaDados(dados);

    let fotos = [];

    let contador = 1;

    if(erro === false) {

        for(let i = 0; i < req.files.length-1; i++) {
    
            let foto = Date.now() + i + '.jpg';
    
            let readerStream = fs.createReadStream(req.files[i].path);
            let dest_file = pathModule.join(req.files[i].destination, foto);
            let writerStream = fs.createWriteStream(dest_file);
    
            let stream = readerStream.pipe(writerStream);
    
            fotos.push(foto);
        
            stream.on('finish', () => {

                contador++
    
                // Caso não tenha erros, adiciona na base de dados
                if(contador === req.files.length) {

                    dados.fotos = JSON.stringify(fotos);
        
                    let query = criarQueryInsert(dados, table);
            
                    connection.query(query, (err, result) => {
        
                        if(err) {
        
                            console.error(JSON.stringify(err));
        
                            return res.json({ erro: true, mensagem: JSON.stringify(err) });
        
                        } else {
        
                            return res.json({ erro: false, resultado: result });
        
                        }
        
                    });
        
                }
        
            });
    
        }

    } else {

        return res.json({ erro: true, mensagem: 'Dados invalidos' });

    }
    

});

// Adiciona dados em uma tabela
app.post('/:table', (req, res) => {

    console.log(req.body);

    let table = req.params.table;

    if(!validaTabela(table)) {

        res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

        return null;

    }

    let dados = req.body.dados;
    let erro = validaDados(dados);

    // Caso não tenha erros, adiciona na base de dados
    if(erro === false) {

        let query = criarQueryInsert(dados, table);

        console.log('query: ' + query);

        connection.query(query, (err, result) => {

            if(err) {

                console.error(JSON.stringify(err));

                res.json({ erro: true, mensagem: JSON.stringify(err) });

            } else {

                res.json({ erro: false, resultado: result });

            }

        });

    } else {

        res.json({ erro: true, mensagem: erro });

    }

});

// Requisições de PATCH
// Edita dados em uma tabela
app.patch('/:table/:_id', (req, res) => {

    let id = req.params._id,
        table = req.params.table;

    if(!validaTabela(table)) {

        return res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

    }

    let dados = updateDados(req.body.dados);
    let where;

    if(table === 'viagens') {

        where = {
            viagem_id: id
        };

    } else {

        where = {
            id: id
        };

    }
    let query = criarQueryUpdate(dados, table, where);

    connection.query(query, (err, result) => {

        if(err) {

            console.error(JSON.stringify(err));

            return res.json({ erro: true, mensagem: JSON.stringify(err) });

        }

        if(result !== null) {

            return res.json({ erro: false, resultado: result });

        }

    });

});

// Requisições de DELETE
// Apaga um dado em uma tabela
app.delete('/:table/:_id', (req, res) => {

    let id = req.params._id,
        table = req.params.table;

    if(!validaTabela(table)) {

        res.json({ erro: true, mensagem: 'Tabela buscada não existe na base de dados' });

        return null;

    }

    let query = 'DELETE FROM ' + table + ' WHERE id = ' + mysql.escape(id);

    db.collection(table).deleteOne({ _id: ObjectId(id) }, (err, result) => {

        if(err) {

            console.error(JSON.stringify(err));

            res.json({ erro: true, mensagem: JSON.stringify(err) });

        }

        if(result !== null) {

            res.json({ erro: false, resultado: result });

        }

    });

});
