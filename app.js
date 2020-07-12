//INCLUI O MODULO VENOM
const venom = require('venom-bot')

//INICIAR O MODULO VENOM E EXECUTA A FUNCAO START
venom.create().then((client) => start(client))

//FUNCAO PRINCIPAL DO PROJETO
function start(client) {
    //verifica se chegou alguma mensagem
    client.onMessage((message) => {
        const contato = message.from
        const conteudo_mensagem = message.body.toLowerCase()
        let intencao = INTENCAO_NAO_IDENTIFICADA

        //adiciona o contato aos clientes ativos
        if (clientes_ativos[contato] === undefined) {
            clientes_ativos[contato] = {"etapa": ETAPA_INICIOU_CONVERSA}
        }
        
        //pega a etapa que o cliente esta
        let etapa_cliente = clientes_ativos[contato].etapa

        //executa a acao
        if (etapa_cliente != ETAPA_FAZENDO_ELOGIO && etapa_cliente != ETAPA_FAZENDO_PEDIDO && etapa_cliente != ETAPA_INFORMANDO_ENDERECO) {
            //verifica qual a intencao do cliente
            intencao = qualIntencao(conteudo_mensagem)
            executaAcao(client, contato, intencao)
        } else {
            //verifica se ta fazendo um elogio e anota o elogio
            if (etapa_cliente === ETAPA_FAZENDO_ELOGIO) {
                elogios[contato] = {"elogio": conteudo_mensagem}
                client.sendText(contato, msg_agradecimento)
                delete clientes_ativos[contato]
            } else if (etapa_cliente === ETAPA_FAZENDO_PEDIDO) {
                //verifica se nao tem nenhum item no pedido
                if (pedidos[contato] === undefined) {
                    pedidos[contato] = {"itens":[], "endereco":[]}
                }

                if (conteudo_mensagem != "nao") {
                    //adiciona o item ao pedido
                    pedidos[contato].itens.push(conteudo_mensagem)
                    client.sendText(contato, msg_mais_algo)
                } else {
                    clientes_ativos[contato].etapa = ETAPA_INFORMANDO_ENDERECO
                    client.sendText(contato, msg_endereco)
                }
            } else if (etapa_cliente === ETAPA_INFORMANDO_ENDERECO) {                
                if (conteudo_mensagem === "sim") {
                    client.sendText(contato, msg_entregador)
                    delete clientes_ativos[contato]
                } else {
                    pedidos[contato].endereco.push(conteudo_mensagem)
                    client.sendText(contato, msg_pode_entregar)
                }
            }
        }
    })
}

//FUNCAO QUE EXECUTA A ACAO
function executaAcao(client, contato, intencao) {
    //envia mensagem de boas vindas
    if (intencao === INTENCAO_INICIO_CONVERSA) {
        client.sendText(contato, msg_recepcao)
    }

    //envia o cardapio para o cliente
    if (intencao === INTENCAO_SOLICITOU_CARDAPIO) {
        client.sendText(contato, msg_cardapio)
        client.sendImage(contato, diretorio, imagem, legenda)
        clientes_ativos[contato].etapa = ETAPA_SOLICITOU_CARDAPIO
    }

    //envia a pergunta de quais itens o cliente quer
    if (intencao === INTENCAO_FAZER_PEDIDO) {
        client.sendText(contato, msg_pedido)
        clientes_ativos[contato].etapa = ETAPA_FAZENDO_PEDIDO
    }

    //envia a mensagem agradecendo o elogio e pede que informe o elogio
    if (intencao === INTENCAO_FAZER_ELOGIO) {
        client.sendText(contato, msg_elogio)
        clientes_ativos[contato].etapa = ETAPA_FAZENDO_ELOGIO
    }

    //manda a mensagem orientando o local certo para tratar da reclamacao e tira o client dos ativos
    if (intencao === INTENCAO_FAZER_RECLAMACAO) {
        client.sendText(contato, msg_reclamacao)
        delete clientes_ativos[contato]
    }

    //envia o contato do atendente humano e retira o cliente dos ativos
    if (intencao === INTENCAO_FALAR_COM_ATENDENTE) {
        client.sendText(contato, msg_atendente)
        delete clientes_ativos[contato]
    }

    //envia mensagem lastimando o cancelamento e retira o cliente dos ativos
    if (intencao === INTENCAO_CANCELAR) {
        client.sendText(contato, msg_cancelar)
        delete clientes_ativos[contato]
    }

    //informa ao cliente que nao entendeu
    if (intencao === INTENCAO_NAO_IDENTIFICADA) {
        client.sendText(contato, msg_nao_compreendeu)
    }
}

//FUNCAO QUE INFORMA QUAL FOI A INTENCAO DO CLIENTE
function qualIntencao(msg) {
    //iniciar conversa
    if (msg_inicia_conversa.indexOf(msg) > -1) {
        return INTENCAO_INICIO_CONVERSA
    }

    //solictar cardapio
    if (msg_solicitar_cardapio.indexOf(msg) > -1) {
        return INTENCAO_SOLICITOU_CARDAPIO
    }

    //fazer pedido
    if (msg_fazer_pedido.indexOf(msg) > -1) {
        return INTENCAO_FAZER_PEDIDO
    }

    //fazer reclamacao
    if (msg_fazer_reclamacao.indexOf(msg) > -1) {
        return INTENCAO_FAZER_RECLAMACAO
    }

    //fazer elogio
    if (msg_fazer_elogio.indexOf(msg) > -1) {
        return INTENCAO_FAZER_ELOGIO
    }

    //falar com atendente
    if (msg_falar_com_atendente.indexOf(msg) > -1) {
        return INTENCAO_FALAR_COM_ATENDENTE
    }

    //cancelar
    if (msg_cancelar_atendimento.indexOf(msg) > -1) {
        return INTENCAO_CANCELAR
    }

    //intencao nao identificada
    return INTENCAO_NAO_IDENTIFICADA
}

//LISTA DE ETAPAS
const ETAPA_INICIOU_CONVERSA = 0
const ETAPA_FAZENDO_PEDIDO = 1
const ETAPA_FAZENDO_ELOGIO = 2
const ETAPA_SOLICITOU_CARDAPIO = 3
const ETAPA_INFORMANDO_ENDERECO = 4

//LISTA DE ACOES
const INTENCAO_NAO_IDENTIFICADA = -1
const INTENCAO_INICIO_CONVERSA = 0
const INTENCAO_SOLICITOU_CARDAPIO = 1
const INTENCAO_FAZER_PEDIDO = 2
const INTENCAO_FAZER_RECLAMACAO = 3
const INTENCAO_FAZER_ELOGIO = 4
const INTENCAO_FALAR_COM_ATENDENTE = 5
const INTENCAO_CANCELAR = 6


//LISTA COM OS CLIENTES QUE ESTAO ATIVOS, LISTA DE ELOGIOS, LISTA DE PEDIDOS
let clientes_ativos = {"558892435446@c.us":{"etapa": ETAPA_INICIOU_CONVERSA}}
let elogios = {}
let pedidos = {}

//BASE DE MENSAGENS QUE O CONTATO PODE MANDAR
const msg_inicia_conversa = ["oi", "ola", "ei"]
const msg_solicitar_cardapio = ["cardapio", "gostaria de ver o cardapio", "me manda o cardapio"]
const msg_fazer_pedido = ["pedido", "gostaria de fazer um pedido"]
const msg_fazer_reclamacao = ["reclamacao", "gostaria de fazer uma reclamacao", "queria abrir uma reclamacao"]
const msg_fazer_elogio = ["elogio", "gostaria de fazer uma elogio"]
const msg_falar_com_atendente = ["atendente", "falar com atendente"]
const msg_cancelar_atendimento = ["cancelar", "queria cancelar"]

//BASE DE MENSAGENS QUE O ROBO ENVIA
const msg_recepcao = "Ola eu sou o atendente virtual da lanchonete cafe com leite. Em que posso lhe ajudar?"
const msg_nao_compreendeu = "Desculpa, nao consegui identificar o que voce quer. Tente estas palavras chaves: *cardapio*,*pedido*,*cancelar atendimento*, *falar com atendente*, *reclamacao*, *elogio*"
const msg_cardapio = "Aqui esta o nosso cardapio:"
const msg_pedido = "Que otimo, agora nos diga quais itens voce quer:"
const msg_elogio = "Nossa ficamos muito felizes com isso, nos diga qual o elogio voce quer fazer:"
const msg_reclamacao = "Nossa que pena! Gostariamos de antemao pedi ja desculpas. Por favor entre em contato com (88)99999-9999 para que possamos tratar melhor o seu caso."
const msg_atendente = "Tudo bem, voce pode entrar em contato com (88) 99999-9999 que ele vai lhe atender."
const msg_cancelar = "Que pena na proxima espero lhe atender melhor, mas qualquer coisa entre em contato com (88) 99999-9999"
const msg_agradecimento = "Obrigado!"
const msg_mais_algo = "Mais alguma coisa?"
const msg_endereco = "Qual o endereco de entrega?"
const msg_pode_entregar = "Ja podemos entregar?"
const msg_entregador = "Agora eh so aguardar o nosso entregador!"

//CARDAPIO
const diretorio = __dirname + "/img/cardapio.png"
const imagem = "cardapio.png"
const legenda = "Cardapio"