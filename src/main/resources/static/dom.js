// textContent trata o valor como texto: dado vindo do banco nunca vira HTML na página
export function criarElemento(tag, classe, texto = "") {
    const elemento = document.createElement(tag);
    elemento.className = classe;
    elemento.textContent = texto;
    return elemento;
}
