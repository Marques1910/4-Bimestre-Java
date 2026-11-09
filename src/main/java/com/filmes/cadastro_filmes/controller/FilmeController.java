package com.filmes.cadastro_filmes.controller;

import com.filmes.cadastro_filmes.business.FilmeService;
import com.filmes.cadastro_filmes.business.PesquisaFilmeService;
import com.filmes.cadastro_filmes.business.SugestaoFilme;
import com.filmes.cadastro_filmes.infrastructure.entitys.Filme;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/filmes")
public class FilmeController {

    private final FilmeService filmeService;
    private final PesquisaFilmeService pesquisaFilmeService;

    public FilmeController(FilmeService filmeService, PesquisaFilmeService pesquisaFilmeService) {
        this.filmeService = filmeService;
        this.pesquisaFilmeService = pesquisaFilmeService;
    }

    @GetMapping("/pesquisa")
    public ResponseEntity<List<SugestaoFilme>> pesquisarFilmes(@RequestParam String termo) {
        return ResponseEntity.ok(pesquisaFilmeService.pesquisar(termo));
    }

    @GetMapping("/pesquisa/{tmdbId}")
    public ResponseEntity<Filme> detalharPesquisa(@PathVariable Long tmdbId) {
        return ResponseEntity.ok(pesquisaFilmeService.detalhar(tmdbId));
    }

    @PostMapping
    public ResponseEntity<Filme> cadastrarFilme(@RequestBody Filme filme) {

        Filme novoFilme = filmeService.salvarFilme(filme);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(novoFilme);
    }

    @GetMapping
    public ResponseEntity<List<Filme>> listarFilmes() {

        List<Filme> filmes = filmeService.listarFilmes();

        return ResponseEntity.ok(filmes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Filme> buscarFilme(@PathVariable Long id) {

        Filme filme = filmeService.buscarFilmePorId(id);

        return ResponseEntity.ok(filme);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Filme> atualizarFilme(
            @PathVariable Long id,
            @RequestBody Filme filme) {

        Filme filmeAtualizado =
                filmeService.atualizarFilme(id, filme);

        return ResponseEntity.ok(filmeAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarFilme(@PathVariable Long id) {

        filmeService.deletarFilme(id);

        return ResponseEntity.noContent().build();
    }
}