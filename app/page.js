'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

// O componente Home é o ponto de entrada da rota "/"
export default function Home() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('batman');
  const [query, setQuery] = useState('batman');

  // useEffect executa apenas uma vez ao carregar (ou quando query muda)
  useEffect(() => {
    fetch(`https://www.omdbapi.com/?s=${query}&apikey=demo`)
      .then(res => res.json())
      .then(data => {
        if (data.Search) {
          setMovies(data.Search);
        }
      });
  }, [query]); // [] = executa apenas uma vez, ao carregar

  // Adicionar um filme aos favoritos
  const handleFavorite = (movie) => {
    setFavorites(prev => [...prev, movie]);
  };

  // Remover um filme dos favoritos
  const handleRemoveFavorite = (imdbID) => {
    setFavorites(prev => prev.filter(m => m.imdbID !== imdbID));
  };

  // Verificar se um filme já foi favoritado
  const isFavorited = (imdbID) => favorites.some(m => m.imdbID === imdbID);

  // Executar busca ao submeter o formulário
  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Catálogo de Filmes 🎬</h1>
        <p>Bem-vindo ao nosso portal de cinema!</p>
        <p>Explore os melhores lançamentos aqui.</p>
      </header>

      {/* Campo de busca por título */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          className={styles.searchInput}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar filme..."
        />
        <button className={styles.searchButton} type="submit">
          Buscar
        </button>
      </form>

      {/* Lista de filmes buscados da API */}
      <section>
        <h2 className={styles.sectionTitle}>Filmes</h2>
        <div className={styles.grid}>
          {movies.map(movie => (
            <div key={movie.imdbID} className={styles.card}>
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x220?text=Sem+Imagem'}
                alt={movie.Title}
                className={styles.poster}
                width="150"
              />
              <div className={styles.cardInfo}>
                <h3 className={styles.movieTitle}>{movie.Title}</h3>
                <p className={styles.movieYear}>{movie.Year}</p>
                <button
                  className={`${styles.favButton} ${isFavorited(movie.imdbID) ? styles.favButtonActive : ''}`}
                  onClick={() => handleFavorite(movie)}
                  disabled={isFavorited(movie.imdbID)}
                >
                  {isFavorited(movie.imdbID) ? '⭐ Favoritado' : '☆ Favoritar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção de favoritos — aparece só quando há favoritos */}
      {favorites.length > 0 && (
        <section className={styles.favoritesSection}>
          <h2 className={styles.sectionTitle}>Meus Favoritos ⭐</h2>
          <div className={styles.grid}>
            {favorites.map(movie => (
              <div key={movie.imdbID} className={styles.card}>
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x220?text=Sem+Imagem'}
                  alt={movie.Title}
                  className={styles.poster}
                  width="150"
                />
                <div className={styles.cardInfo}>
                  <h3 className={styles.movieTitle}>{movie.Title}</h3>
                  <p className={styles.movieYear}>{movie.Year}</p>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveFavorite(movie.imdbID)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
