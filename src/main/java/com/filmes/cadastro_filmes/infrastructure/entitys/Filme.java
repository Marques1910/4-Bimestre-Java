package com.filmes.cadastro_filmes.infrastructure.entitys;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "filmes")
public class Filme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titulo")
    private String titulo;

    @Column(name = "diretor")
    private String diretor;

    @Column(name = "genero")
    private String genero;

    @Column(name = "ano_lancamento")
    private Integer anoLancamento;

    @Column(name = "capa_url", length = 500)
    private String capaUrl;

    @Column(name = "sinopse", columnDefinition = "TEXT")
    private String sinopse;
}