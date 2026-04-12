'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const API_KEY = 'trilogy';

const FILMES_POPULARES = [
  'Inception',
  'Interstellar',
  'The Dark Knight',
  'Avengers',
  'Spider-Man',
  'Avatar',
  'Titanic',
  'Harry Potter',
  'Fast and Furious',
  'John Wick',
  'Twilight',
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('batman');
  const [query, setQuery] = useState('batman');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [posteres, setPosteres] = useState({});

  // Busca os posters dos filmes populares uma vez ao carregar
  useEffect(() => {
    FILMES_POPULARES.forEach(titulo => {
      fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          if (data.Poster && data.Poster !== 'N/A') {
            setPosteres(prev => ({ ...prev, [titulo]: data.Poster }));
          }
        });
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setErro('');

    const tipo = filtroTipo ? `&type=${filtroTipo}` : '';

    fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}&page=${pagina}${tipo}`)
      .then(res => res.json())
      .then(data => {
        if (data.Search) {
          setMovies(data.Search);
          setTotalResultados(parseInt(data.totalResults));
        } else {
          setMovies([]);
          setErro('Nenhum filme encontrado. Tente outro título.');
        }
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao buscar filmes. Verifique sua conexão.');
        setLoading(false);
      });
  }, [query, pagina, filtroTipo]);

  const handleFavorite = (movie) => {
    setFavorites(prev => [...prev, movie]);
  };

  const handleRemoveFavorite = (imdbID) => {
    setFavorites(prev => prev.filter(m => m.imdbID !== imdbID));
  };

  const isFavorited = (imdbID) => favorites.some(m => m.imdbID === imdbID);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagina(1);
    setQuery(search);
  };

  const totalPaginas = Math.ceil(totalResultados / 10);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Catálogo de Filmes 🎬</h1>
        <p>Bem-vindo ao nosso portal de cinema!</p>
        <p>Explore os melhores lançamentos aqui.</p>
      </header>

      {/* Busca */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          className={styles.searchInput}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar filme..."
        />
        <button className={styles.searchButton} type="submit">Buscar</button>
      </form>

      {/* Filtro por tipo */}
      <div className={styles.filtros}>
        {['', 'movie', 'series', 'episode'].map(tipo => (
          <button
            key={tipo}
            className={`${styles.filtroBotao} ${filtroTipo === tipo ? styles.filtroAtivo : ''}`}
            onClick={() => { setFiltroTipo(tipo); setPagina(1); }}
          >
            {tipo === '' ? 'Todos' : tipo === 'movie' ? 'Filmes' : tipo === 'series' ? 'Séries' : 'Episódios'}
          </button>
        ))}
      </div>

      {/* Barra de filmes populares */}
      <div className={styles.popularesArea}>
        <p className={styles.popularesLabel}>Populares</p>
        <div className={styles.populares}>
          {FILMES_POPULARES.map(titulo => (
            <button
              key={titulo}
              className={`${styles.popularBtn} ${query === titulo ? styles.popularAtivo : ''}`}
              onClick={() => { setSearch(titulo); setQuery(titulo); setPagina(1); }}
            >
              {posteres[titulo] && (
                <img
                  src={posteres[titulo]}
                  alt={titulo}
                  className={styles.popularPoster}
                />
              )}
              <span>{titulo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de filmes */}
      <section>
        <h2 className={styles.sectionTitle}>
          Filmes
          {totalResultados > 0 && <span className={styles.total}> ({totalResultados} resultados)</span>}
        </h2>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando filmes...</p>
          </div>
        )}

        {!loading && erro && (
          <p className={styles.erroMsg}>{erro}</p>
        )}

        {!loading && !erro && (
          <div className={styles.grid}>
            {movies.map(movie => (
              <div key={movie.imdbID} className={styles.card}>
                <Link href={`/filme/${movie.imdbID}`}>
                  <img
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/150x220?text=Sem+Imagem'}
                    alt={movie.Title}
                    className={styles.poster}
                  />
                </Link>
                <div className={styles.cardInfo}>
                  <span className={styles.badge}>{movie.Type === 'movie' ? 'Filme' : movie.Type === 'series' ? 'Série' : 'Episódio'}</span>
                  <h3 className={styles.movieTitle}>{movie.Title}</h3>
                  <p className={styles.movieYear}>{movie.Year}</p>
                  <div className={styles.cardBotoes}>
                    <Link href={`/filme/${movie.imdbID}`} className={styles.detalheLink}>
                      Ver detalhes
                    </Link>
                    <button
                      className={`${styles.favButton} ${isFavorited(movie.imdbID) ? styles.favButtonActive : ''}`}
                      onClick={() => handleFavorite(movie)}
                      disabled={isFavorited(movie.imdbID)}
                    >
                      {isFavorited(movie.imdbID) ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && !loading && (
          <div className={styles.paginacao}>
            <button
              className={styles.paginaBotao}
              onClick={() => setPagina(p => p - 1)}
              disabled={pagina === 1}
            >
              ← Anterior
            </button>
            <span className={styles.paginaInfo}>Página {pagina} de {totalPaginas}</span>
            <button
              className={styles.paginaBotao}
              onClick={() => setPagina(p => p + 1)}
              disabled={pagina === totalPaginas}
            >
              Próxima →
            </button>
          </div>
        )}
      </section>

      {/* Favoritos */}
      {favorites.length > 0 && (
        <section className={styles.favoritesSection}>
          <h2 className={styles.sectionTitle}>
            Meus Favoritos ⭐
            <span className={styles.total}> ({favorites.length})</span>
          </h2>
          <div className={styles.grid}>
            {favorites.map(movie => (
              <div key={movie.imdbID} className={styles.card}>
                <Link href={`/filme/${movie.imdbID}`}>
                  <img
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/150x220?text=Sem+Imagem'}
                    alt={movie.Title}
                    className={styles.poster}
                  />
                </Link>
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
