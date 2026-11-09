// Rodar com: node src/test/js/catalogo.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { cartazDe, filtrarFilmes } from "../../main/resources/static/catalogo.js";

const filmes = [
    { id: 1, titulo: "Cidade de Deus", diretor: "Fernando Meirelles", genero: "Drama", anoLancamento: 2002 },
    { id: 14, titulo: "Duna", diretor: "Denis Villeneuve", genero: "Ficção", anoLancamento: 2021 },
];

test("busca ignora acento e caixa", () => {
    assert.deepEqual(filtrarFilmes(filmes, "FICCAO").map((f) => f.id), [14]);
});

test("busca por ID e por ano exige o número exato", () => {
    assert.deepEqual(filtrarFilmes(filmes, "14").map((f) => f.id), [14]);
    assert.deepEqual(filtrarFilmes(filmes, "1").map((f) => f.id), [1]);
    assert.deepEqual(filtrarFilmes(filmes, "2021").map((f) => f.id), [14]);
});

test("busca vazia devolve o acervo inteiro", () => {
    assert.equal(filtrarFilmes(filmes, "   ").length, 2);
});

test("campo nulo não quebra a busca", () => {
    assert.deepEqual(filtrarFilmes([{ id: 2, titulo: "Sem gênero", genero: null }], "genero"), [
        { id: 2, titulo: "Sem gênero", genero: null },
    ]);
});

test("cartaz é estável e fica dentro das opções", () => {
    assert.deepEqual(cartazDe("Duna"), cartazDe("Duna"));
    for (const titulo of ["", null, "Matrix", "O Poderoso Chefão"]) {
        const { paleta, figura } = cartazDe(titulo);
        assert.ok(paleta >= 0 && paleta < 7);
        assert.ok(["circulo", "diagonal", "faixas"].includes(figura));
    }
});
