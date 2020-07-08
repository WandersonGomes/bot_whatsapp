const venom = require('venom-bot') //inclua biblioteca Matematica --> mat

venom.create().then((client) => start(client))

//MENSAGENS
const mensagem_boas_vindas = "Ola, eu sou o atendente virtual da Lanchonte Cafe com Leite! Por favor escolha uma opcao abaixo:"
const menu_principal = "01 - Solicitar Cardapio\n02 - Fazer Pedido\n03 - Falar com Atendente Humano\n04 - Encerrar"

const msg_tchau = "Obrigado!"
const msg_fazer_pedido = "Digite o numero correspondente ao lanche ou digite a palavra (fechar) para finalizar o pedido:"


//LISTA DOS CLIENTES ATIVOS
let clientes = {}

//funcao inicio
function start(client) {
    //fica verificando se chegou mensagem
    client.onMessage((message) => {
        console.log("Mensagem recebida")

        let remetente = message.from
        let conteudo_mensagem = message.body

        //adiciona na lista de clientes ativos
        if (clientes[remetente] === undefined) {
            clientes[remetente] = {etapa: 0}
        }
        

        //etapa 0
        if (clientes[remetente].etapa === 0) {
            client.sendText(remetente, mensagem_boas_vindas)
            client.sendText(remetente, menu_principal)
            clientes[remetente].etapa = 1
        } else if (clientes[remetente].etapa === 1) {
            //escolher opcao do menu principal
            etapa1(client, remetente, conteudo_mensagem)
        } else if (clientes[remetente].etapa === 2) {
            //realizar o pedido
            etapa2(client, remetente, conteudo_mensagem)
        } else if (clientes[remetente].etapa === 3) {
            //informar endereco de entrega
            etapa3(cliente, remetente, conteudo_mensagem)
        }
    })
}


//ETAPA 1
function etapa1(client, rem, cont) {
    if (cont === "1") {
        //apresenta cardapio
        let diretorio = __dirname + "/img/cardapio.png"
        let imagem = "cardapio.png"
        let legenda = "Deseja fazer seu pedido? (sim) ou (nao)"

        client.sendImage(rem, diretorio, imagem, legenda)
        clientes[rem].etapa = 2
    }
    if (cont === "2") {
        //inicia processo de pedido
        client.sendText(rem, "Digite sim para continuar: ")
        clientes[rem].etapa = 2
    }
    if (cont === "3") {
        //envia contato do atendente humano
        const mensagem_contato_humano = "Por favor ligue para o numero (88)99999-9999"
        client.sendText(rem, mensagem_contato_humano)
    }
    if (cont === "4") {
        //envia mensagem de Tchau e deleta da lista de clientes ativos
        client.sendText(rem, msg_tchau)
        delete clientes[rem]
    }
}

//ETAPA 2
function etapa2(client, rem, cont) {
    //nao da etapa 1
    if (cont === "nao") {
        client.sendText(rem, msg_tchau)
    } else {
        client.sendText(rem, msg_fazer_pedido)
        clientes[remetente].etapa = 3
    }
}

//ETAPA 3
function etapa3(client, rem, cont) {

}