//inclui o modulo
const venom = require('venom-bot')

//cria o bot
venom.create().then((client) => start(client))

//dados cardapio
const diretorio_cardapio = __dirname + "/img/cardapio.png"
const imagem = "cardapio.png"
const legenda = "Cardapio"

//lista de clientes e pedidos
let clientes_ativos = {}
let pedidos = {}

//etapas de conversa
const ETAPA_INICIOU_CONVERSA = 0
const ETAPA_INFORMANDO_ENDERECO = 1
const ETAPA_INFORMANDO_NOME = 2
const ETAPA_FAZENDO_PEDIDO = 3
const ETAPA_INFORMANDO_FORMA_PAGAMENTO = 4
const ETAPA_CONFIRMANDO_PEDIDO = 5

//intencoes
const INTENCAO_NAO_IDENTIFICADA = -1
const INTENCAO_ENTRA_EM_CONTATO = 0
const INTENCAO_PEDI_CARDAPIO = 1
const INTENCAO_RECLAMACAO = 2
const INTENCAO_FALAR_COM_HUMANO = 3
const INTENCAO_FAZER_PEDIDO = 4

//msg padroes
const msg_boas_vindas = "Ola eu sou o assistente virtual da lanchonete Orkut em que posso lhe ajudar?"
const msg_desculpas = "Sentimos muito? Por favor entre em contato com (88) 99999-9999 para resolvermos seu problema."
const msg_nao_entendi = "Desculpa nao entendi o que voce deseja. Tente estas palavras chaves: cardapio, pedido, reclamacao, atendente humano"
const msg_atendente_humano = "Tudo bem? Voce pode falar com (88) 99999-9999 que ele vai lhe atender."
const msg_fazer_pedido = "Otimo! Agora me diga qual o seu nome:"
const msg_informar_itens = "Agora me diga quais itens voce deseja:"
const msg_mais_algo = "Mais alguma coisa?"
const msg_pede_endereco = "Qual o endereco de entrega?"
const msg_confirma_endereco = "O endereco ta correto? Sim ou Nao"
const msg_forma_pagamento = "Qual a forma de pagamento?"
const msg_confirma_pedido = "Confirma o pedido? Sim ou Nao"

//banco com mensagens pre definidas
const lista_mensagens_primeiro_contato = ["oi", "ola", "boa noite"]
const lista_mensanges_solictar_cardapio = ["cardapio", "me envie o cardapio", "me passa o cardapio"]
const lista_mensagens_falar_com_humano = ["atendente", "atendente humano", "falar com uma pessoa"]
const lista_mensagens_fazer_pedido = ["pedido","gostaria de pedir um lanche", "quero fazer um pedido"]
const lista_mensagens_reclamacao = ["reclamacao", "fdp"]

//funcao que analisa as mensagens do cliente
function qualIntencao(msg) {
    if (lista_mensagens_primeiro_contato.indexOf(msg) > -1) {
        return INTENCAO_ENTRA_EM_CONTATO
    }

    if (lista_mensanges_solictar_cardapio.indexOf(msg) > -1) {
        return INTENCAO_PEDI_CARDAPIO
    }

    if (lista_mensagens_reclamacao.indexOf(msg) > -1) {
        return INTENCAO_RECLAMACAO
    }
    
    if (lista_mensagens_falar_com_humano.indexOf(msg) > -1) {
        return INTENCAO_FALAR_COM_HUMANO
    }

    if (lista_mensagens_fazer_pedido.indexOf(msg) > -1) {
        return INTENCAO_FAZER_PEDIDO
    }

    return INTENCAO_NAO_IDENTIFICADA
}

//funcao principal
function start(conexao) {
    //escuta as mensagens
    conexao.onMessage((message) => {
        let contato = message.from
        let conteudo_mensagem = message.body.toLowerCase()


        //adiciona o cliente a lista de clientes ativos
        if (clientes_ativos[contato] === undefined) {
            clientes_ativos[contato] = {
                numero: contato,
                etapa_conversa: ETAPA_INICIOU_CONVERSA
            }
        }

        let cliente = clientes_ativos[contato]
        let intencao = null

        //cancelamento
        if (conteudo_mensagem === "cancelar") {
            conexao.sendText(contato, "Sentimos muito, mas tudo bem. Qualquer coisa voce pode entrar em contato novamente!")
            delete clientes_ativos[contato]
        } else if (cliente.etapa_conversa != ETAPA_INFORMANDO_ENDERECO && 
            cliente.etapa_conversa != ETAPA_FAZENDO_PEDIDO && 
            cliente.etapa_conversa != ETAPA_INFORMANDO_NOME && 
            cliente.etapa_conversa != ETAPA_CONFIRMANDO_PEDIDO &&
            cliente.etapa_conversa != ETAPA_INFORMANDO_FORMA_PAGAMENTO) {
            intencao = qualIntencao(conteudo_mensagem)
            console.log(intencao)

            if (intencao === INTENCAO_ENTRA_EM_CONTATO) {
                conexao.sendText(contato, msg_boas_vindas)
            } else if (intencao === INTENCAO_PEDI_CARDAPIO) {
                conexao.sendImage(contato, diretorio_cardapio, imagem, legenda)
            } else if (intencao === INTENCAO_RECLAMACAO) {
                conexao.sendText(contato, msg_desculpas)
            } else if (intencao === INTENCAO_NAO_IDENTIFICADA) {
                conexao.sendText(contato, msg_nao_entendi)
            } else if (intencao === INTENCAO_FALAR_COM_HUMANO) {
                conexao.sendText(contato, msg_atendente_humano)
            } else if (intencao === INTENCAO_FAZER_PEDIDO) {
                conexao.sendText(contato, msg_fazer_pedido)
                clientes_ativos[contato].etapa_conversa = ETAPA_INFORMANDO_NOME
            }
        } else {
            console.log("ETAPA: " + cliente.etapa_conversa)
            //informando o nome para entregar
            if (cliente.etapa_conversa === ETAPA_INFORMANDO_NOME) {
                pedidos[contato] = {
                    nome: conteudo_mensagem, 
                    itens: "",
                    endereco: "",
                    forma_pagamento: ""
                }
                conexao.sendText(contato, msg_informar_itens)
                clientes_ativos[contato].etapa_conversa = ETAPA_FAZENDO_PEDIDO
            } else if (cliente.etapa_conversa === ETAPA_FAZENDO_PEDIDO) {
                if (conteudo_mensagem != "nao") {
                    pedidos[contato].itens += conteudo_mensagem
                    conexao.sendText(contato, msg_mais_algo)
                } else {
                    clientes_ativos[contato].etapa_conversa = ETAPA_INFORMANDO_ENDERECO
                    conexao.sendText(contato, msg_pede_endereco)
                }
            } else if (cliente.etapa_conversa === ETAPA_INFORMANDO_ENDERECO) {
                if (conteudo_mensagem != "sim") {
                    if (conteudo_mensagem === "nao") {
                        conexao.sendText(contato, msg_pede_endereco)
                        pedidos[contato].endereco = ""
                    }
                    pedidos[contato].endereco += conteudo_mensagem
                    conexao.sendText(contato, msg_confirma_endereco)
                } else if (conteudo_mensagem === "sim") {
                    conexao.sendText(contato, msg_forma_pagamento)
                    clientes_ativos[contato].etapa_conversa = ETAPA_INFORMANDO_FORMA_PAGAMENTO
                }
            } else if (cliente.etapa_conversa === ETAPA_INFORMANDO_FORMA_PAGAMENTO) {
                console.log("chegou aqui...")
                pedidos[contato].forma_pagamento = conteudo_mensagem
                conexao.sendText(contato, msg_confirma_pedido)
                clientes_ativos[contato].etapa_conversa = ETAPA_CONFIRMANDO_PEDIDO
            } else if (cliente.etapa_conversa === ETAPA_CONFIRMANDO_PEDIDO) {
                console.log("Entrou aqui...")
                if (conteudo_mensagem === "sim") {
                    conexao.sendText(contato, "Muito obrigado o entregador daqui a pouco ja vai deixar!")
                    delete clientes_ativos[contato]
                } else if (conteudo_mensagem === "nao") {
                    conexao.sendText(contato, "Tudo bem! Qualquer coisa pode pedir novamente.")
                    delete clientes_ativos[contato]
                }
            }
        }
    })
}