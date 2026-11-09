// Regras do acervo sem dependência de tela ou servidor: testadas em src/test/js.

const TOTAL_PALETAS = 7;
const FIGURAS = ["circulo", "diagonal", "faixas"];

const normalizar = (texto) =>
    String(texto ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function filtrarFilmes(filmes, busca) {
    const termo = normalizar(busca).trim();

    if (termo === "") {
        return filmes;
    }

    return filmes.filter((filme) =>
        // Número curto dentro de um ano (o "1" de 2021) não é o que se procura
        [filme.id, filme.anoLancamento].map(String).includes(termo) ||
        normalizar([filme.titulo, filme.diretor, filme.genero].join(" ")).includes(termo)
    );
}

export function agruparPorGenero(filmes) {
    const grupos = new Map();

    for (const filme of filmes) {
        const genero = filme.genero?.trim() || "Sem gênero";
        grupos.set(genero, [...(grupos.get(genero) ?? []), filme]);
    }

    return [...grupos]
        .map(([genero, filmesDoGenero]) => ({ genero, filmes: filmesDoGenero }))
        .sort((a, b) => b.filmes.length - a.filmes.length || a.genero.localeCompare(b.genero, "pt-BR"));
}

// Filme mais recente com capa; sem nenhuma capa, o mais recente
export function destaqueDe(filmes) {
    const recentes = [...filmes].sort((a, b) => b.id - a.id);

    return recentes.find((filme) => filme.capaUrl) ?? recentes[0] ?? null;
}

// O mesmo título sempre gera o mesmo cartaz
export function cartazDe(titulo) {
    let codigo = 0;

    for (const letra of String(titulo ?? "")) {
        codigo = (codigo * 31 + letra.codePointAt(0)) % 1000003;
    }

    return {
        paleta: codigo % TOTAL_PALETAS,
        figura: FIGURAS[codigo % FIGURAS.length],
    };
}
