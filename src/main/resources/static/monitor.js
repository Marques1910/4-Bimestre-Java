import { criarElemento } from "./dom.js";

const LIMITE_REGISTROS = 30;

const lista = document.getElementById("monitorLista");
const ultima = document.getElementById("monitorUltima");

function criarResumo({ metodo, url, status, duracao }) {
    const falhou = status === null || status >= 400;

    return [
        criarElemento("span", `verbo verbo-${metodo.toLowerCase()}`, metodo),
        criarElemento("code", "req-url", url),
        criarElemento("span", falhou ? "req-status req-falha" : "req-status", status ?? "sem resposta"),
        criarElemento("span", "req-tempo", `${duracao} ms`),
    ];
}

function criarBloco(rotulo, conteudo) {
    const bloco = criarElemento("div", "");

    bloco.append(
        criarElemento("p", "", rotulo),
        criarElemento("pre", "", conteudo === null ? "Sem conteúdo" : JSON.stringify(conteudo, null, 2)),
    );

    return bloco;
}

// Recebe { metodo, url, status, duracao, enviado, recebido }; status null = servidor não respondeu
export function registrarRequisicao(requisicao) {
    const cabecalho = criarElemento("span", "req-cabecalho");
    cabecalho.append(...criarResumo(requisicao));

    const titulo = document.createElement("summary");
    titulo.append(cabecalho);

    const corpo = criarElemento("div", "req-corpo");
    corpo.append(
        criarBloco("Enviado ao backend", requisicao.enviado),
        criarBloco("Recebido do backend", requisicao.recebido),
    );

    const detalhes = document.createElement("details");
    detalhes.append(titulo, corpo);

    const item = document.createElement("li");
    item.append(detalhes);

    lista.prepend(item);
    ultima.replaceChildren(...criarResumo(requisicao));

    while (lista.children.length > LIMITE_REGISTROS) {
        lista.lastChild.remove();
    }
}
