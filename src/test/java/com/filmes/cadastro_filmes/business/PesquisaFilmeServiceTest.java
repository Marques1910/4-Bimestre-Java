package com.filmes.cadastro_filmes.business;

import com.filmes.cadastro_filmes.business.PesquisaFilmeService.Creditos;
import com.filmes.cadastro_filmes.business.PesquisaFilmeService.Detalhe;
import com.filmes.cadastro_filmes.business.PesquisaFilmeService.Genero;
import com.filmes.cadastro_filmes.business.PesquisaFilmeService.Membro;
import com.filmes.cadastro_filmes.business.PesquisaFilmeService.Resultado;
import com.filmes.cadastro_filmes.infrastructure.entitys.Filme;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PesquisaFilmeServiceTest {

    @Test
    void detalheEscolheODiretorEOPrimeiroGenero() {
        Detalhe detalhe = new Detalhe("Duna", "Sinopse", "2021-09-15", "/capa.jpg",
                List.of(new Genero("Ficção científica"), new Genero("Aventura")),
                new Creditos(List.of(new Membro("Greig Fraser", "Director of Photography"),
                        new Membro("Denis Villeneuve", "Director"))));

        Filme filme = PesquisaFilmeService.paraFilme(detalhe);

        assertEquals("Denis Villeneuve", filme.getDiretor());
        assertEquals("Ficção científica", filme.getGenero());
        assertEquals(2021, filme.getAnoLancamento());
        assertEquals("https://image.tmdb.org/t/p/w500/capa.jpg", filme.getCapaUrl());
        assertEquals("Sinopse", filme.getSinopse());
    }

    @Test
    void filmeSemDataOuCapaNaoQuebra() {
        SugestaoFilme sugestao = PesquisaFilmeService.paraSugestao(new Resultado(7L, "Inédito", "", null));

        assertNull(sugestao.anoLancamento());
        assertNull(sugestao.capaUrl());
    }

    @Test
    void semTokenInformaQueNaoEstaConfigurada() {
        PesquisaFilmeService servico = new PesquisaFilmeService("", "http://localhost");

        ResponseStatusException erro = assertThrows(ResponseStatusException.class, () -> servico.pesquisar("duna"));

        assertEquals(503, erro.getStatusCode().value());
    }
}
