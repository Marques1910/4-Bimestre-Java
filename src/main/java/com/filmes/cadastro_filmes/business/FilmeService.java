package com.filmes.cadastro_filmes.business;

import com.filmes.cadastro_filmes.infrastructure.entitys.Filme;
import com.filmes.cadastro_filmes.infrastructure.repository.FilmeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FilmeService {

    private final FilmeRepository filmeRepository;

    public FilmeService(FilmeRepository filmeRepository) {
        this.filmeRepository = filmeRepository;
    }

    public Filme salvarFilme(Filme filme) {
        return filmeRepository.saveAndFlush(filme);
    }

    public List<Filme> listarFilmes() {
        return filmeRepository.findAll();
    }

    public Filme buscarFilmePorId(Long id) {
        return filmeRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Filme não encontrado"
                        )
                );
    }

    public Filme atualizarFilme(Long id, Filme filme) {

        Filme filmeEntity = buscarFilmePorId(id);

        // Campo não enviado (null) mantém o valor já gravado no banco
        Filme filmeAtualizado = Filme.builder()
                .id(filmeEntity.getId())
                .titulo(filme.getTitulo() != null ? filme.getTitulo() : filmeEntity.getTitulo())
                .diretor(filme.getDiretor() != null ? filme.getDiretor() : filmeEntity.getDiretor())
                .genero(filme.getGenero() != null ? filme.getGenero() : filmeEntity.getGenero())
                .anoLancamento(filme.getAnoLancamento() != null ? filme.getAnoLancamento() : filmeEntity.getAnoLancamento())
                .capaUrl(filme.getCapaUrl() != null ? filme.getCapaUrl() : filmeEntity.getCapaUrl())
                .sinopse(filme.getSinopse() != null ? filme.getSinopse() : filmeEntity.getSinopse())
                .build();

        return filmeRepository.saveAndFlush(filmeAtualizado);
    }

    public void deletarFilme(Long id) {

        Filme filme = buscarFilmePorId(id);

        filmeRepository.delete(filme);
    }
}