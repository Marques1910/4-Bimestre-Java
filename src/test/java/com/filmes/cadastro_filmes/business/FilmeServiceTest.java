package com.filmes.cadastro_filmes.business;

import com.filmes.cadastro_filmes.infrastructure.entitys.Filme;
import com.filmes.cadastro_filmes.infrastructure.repository.FilmeRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FilmeServiceTest {

    @Test
    void atualizarMantemCamposNaoEnviados() {
        FilmeRepository repository = mock(FilmeRepository.class);
        Filme gravado = new Filme(1L, "Matrix", "Wachowski", "Ficção", 1999);
        when(repository.findById(1L)).thenReturn(Optional.of(gravado));
        when(repository.saveAndFlush(any())).then(returnsFirstArg());

        Filme resultado = new FilmeService(repository)
                .atualizarFilme(1L, Filme.builder().genero("Ação").build());

        assertEquals(1L, resultado.getId());
        assertEquals("Matrix", resultado.getTitulo());
        assertEquals("Wachowski", resultado.getDiretor());
        assertEquals("Ação", resultado.getGenero());
        assertEquals(1999, resultado.getAnoLancamento());
    }
}
