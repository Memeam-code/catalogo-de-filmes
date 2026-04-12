'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

const API_KEY = 'aa9290b3';

export default function DetalheFilme() {
  const { id } = useParams();
  const router = useRouter();
  const [filme, setFilme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}&plot=full`)
      .then(res => res.json())
      .then(data => {
        setFilme(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Carregando detalhes...</p>
      </div>
    );
  }

  if (!filme || filme.Response === 'False') {
    return (
      <div className={styles.erroPagina}>
        <p>Filme não encontrado.</p>
        <button onClick={() => router.back()} className={styles.voltarBtn}>← Voltar</button>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <button onClick={() => router.back()} className={styles.voltarBtn}>
        ← Voltar ao catálogo
      </button>

      <div className={styles.detalhe}>
        {/* Poster */}
        <div className={styles.posterArea}>
          <img
            src={filme.Poster !== 'N/A' ? filme.Poster : 'https://placehold.co/300x440?text=Sem+Imagem'}
            alt={filme.Title}
            className={styles.poster}
          />
          {filme.imdbRating !== 'N/A' && (
            <div className={styles.nota}>
              ⭐ {filme.imdbRating} <span>/10</span>
            </div>
          )}
          {filme.imdbVotes !== 'N/A' && (
            <p className={styles.votos}>{filme.imdbVotes} votos no IMDb</p>
          )}
        </div>

        {/* Informações */}
        <div className={styles.info}>
          <div className={styles.topo}>
            <span className={styles.badge}>
              {filme.Type === 'movie' ? 'Filme' : filme.Type === 'series' ? 'Série' : 'Episódio'}
            </span>
            {filme.Rated !== 'N/A' && (
              <span className={styles.classificacao}>{filme.Rated}</span>
            )}
          </div>

          <h1 className={styles.titulo}>{filme.Title}</h1>

          <div className={styles.metaDados}>
            {filme.Year !== 'N/A' && <span>📅 {filme.Year}</span>}
            {filme.Released !== 'N/A' && <span>🗓 Lançamento: {filme.Released}</span>}
            {filme.Runtime !== 'N/A' && <span>⏱ {filme.Runtime}</span>}
            {filme.Country !== 'N/A' && <span>🌍 {filme.Country}</span>}
            {filme.Language !== 'N/A' && <span>🗣 {filme.Language}</span>}
          </div>

          {filme.Genre !== 'N/A' && (
            <div className={styles.generos}>
              {filme.Genre.split(', ').map(g => (
                <span key={g} className={styles.genero}>{g}</span>
              ))}
            </div>
          )}

          {filme.Plot !== 'N/A' && (
            <div className={styles.secao}>
              <h2>Descrição</h2>
              <p>{filme.Plot}</p>
            </div>
          )}

          {filme.Director !== 'N/A' && (
            <div className={styles.secao}>
              <h2>Diretor</h2>
              <p>{filme.Director}</p>
            </div>
          )}

          {filme.Writer !== 'N/A' && (
            <div className={styles.secao}>
              <h2>Roteirista</h2>
              <p>{filme.Writer}</p>
            </div>
          )}

          {filme.Actors !== 'N/A' && (
            <div className={styles.secao}>
              <h2>Elenco</h2>
              <div className={styles.elenco}>
                {filme.Actors.split(', ').map(ator => (
                  <span key={ator} className={styles.ator}>{ator}</span>
                ))}
              </div>
            </div>
          )}

          {filme.Awards !== 'N/A' && (
            <div className={styles.premios}>
              🏆 {filme.Awards}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
