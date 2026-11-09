package com.filmes.cadastro_filmes.business;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.filmes.cadastro_filmes.infrastructure.entitys.Filme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.function.Function;

// A consulta passa pelo backend para o token do TMDB nunca chegar ao navegador
@Service
public class PesquisaFilmeService {

    private static final String BASE_CAPAS = "https://image.tmdb.org/t/p/w500";
    private static final int MAXIMO_SUGESTOES = 6;

    private final String token;
    private final RestClient tmdb;

    public PesquisaFilmeService(
            @Value("${tmdb.token:}") String token,
            @Value("${tmdb.url:https://api.themoviedb.org/3}") String url) {

        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(Duration.ofSeconds(5));
        fabrica.setReadTimeout(Duration.ofSeconds(8));

        this.token = token;
        this.tmdb = RestClient.builder().baseUrl(url).requestFactory(fabrica).build();
    }

    public List<SugestaoFilme> pesquisar(String termo) {
        if (termo.isBlank()) {
            return List.of();
        }

        Busca busca = consultar(uri -> uri.path("/search/movie")
                .queryParam("query", termo)
                .queryParam("language", "pt-BR")
                .queryParam("include_adult", false)
                .build(), Busca.class);

        return busca.results().stream()
                .limit(MAXIMO_SUGESTOES)
                .map(PesquisaFilmeService::paraSugestao)
                .toList();
    }

    public Filme detalhar(Long tmdbId) {
        return paraFilme(consultar(uri -> uri.path("/movie/{id}")
                .queryParam("language", "pt-BR")
                .queryParam("append_to_response", "credits")
                .build(tmdbId), Detalhe.class));
    }

    private <T> T consultar(Function<UriBuilder, URI> uri, Class<T> tipo) {
        if (token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Busca automática não configurada.");
        }

        try {
            return tmdb.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(tipo);
        } catch (RestClientException erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Serviço de busca de filmes indisponível.");
        }
    }

    static SugestaoFilme paraSugestao(Resultado resultado) {
        return new SugestaoFilme(
                resultado.id(),
                resultado.title(),
                ano(resultado.releaseDate()),
                capa(resultado.posterPath()));
    }

    static Filme paraFilme(Detalhe detalhe) {
        return Filme.builder()
                .titulo(detalhe.title())
                .diretor(detalhe.credits().crew().stream()
                        .filter(membro -> "Director".equals(membro.job()))
                        .map(Membro::name)
                        .findFirst()
                        .orElse(null))
                .genero(detalhe.genres().stream().map(Genero::name).findFirst().orElse(null))
                .anoLancamento(ano(detalhe.releaseDate()))
                .capaUrl(capa(detalhe.posterPath()))
                .sinopse(detalhe.overview())
                .build();
    }

    // O TMDB envia data vazia em filmes ainda sem lançamento definido
    private static Integer ano(String data) {
        return data == null || data.length() < 4 ? null : Integer.valueOf(data.substring(0, 4));
    }

    private static String capa(String caminho) {
        return caminho == null ? null : BASE_CAPAS + caminho;
    }

    record Busca(List<Resultado> results) {
    }

    record Resultado(
            Long id,
            String title,
            @JsonProperty("release_date") String releaseDate,
            @JsonProperty("poster_path") String posterPath) {
    }

    record Detalhe(
            String title,
            String overview,
            @JsonProperty("release_date") String releaseDate,
            @JsonProperty("poster_path") String posterPath,
            List<Genero> genres,
            Creditos credits) {
    }

    record Genero(String name) {
    }

    record Creditos(List<Membro> crew) {
    }

    record Membro(String name, String job) {
    }
}
