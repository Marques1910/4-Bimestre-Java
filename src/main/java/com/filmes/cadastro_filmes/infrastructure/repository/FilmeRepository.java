package com.filmes.cadastro_filmes.infrastructure.repository;

import com.filmes.cadastro_filmes.infrastructure.entitys.Filme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FilmeRepository extends JpaRepository<Filme, Long> {
}