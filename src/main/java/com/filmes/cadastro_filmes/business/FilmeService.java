package com.filmes.cadastro_filmes.bussiness;

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
        return filmeRepository.save(filme);
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

    public Filme atualizarFilme(Long id, Filme filmeAtualizado) {

        Filme filme = buscarFilmePorId(id);

        filme.setTitulo(filmeAtualizado.getTitulo());
        filme.setDiretor(filmeAtualizado.getDiretor());
        filme.setGenero(filmeAtualizado.getGenero());
        filme.setAnoLancamento(filmeAtualizado.getAnoLancamento());

        return filmeRepository.save(filme);
    }

    public void deletarFilme(Long id) {

        Filme filme = buscarFilmePorId(id);

        filmeRepository.delete(filme);
    }
}