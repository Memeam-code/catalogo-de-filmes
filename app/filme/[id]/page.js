'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import styles from './page.module.css';

const API_KEY = 'trilogy';

const supabase = createClient(
  'https://vizrttslxakwoyhajvyo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpenJ0dHNseGFrd295aGFqdnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTQ0ODYsImV4cCI6MjA5MTUzMDQ4Nn0.PGYsEa0QMJrJzFi60V0DP1FdPy60NYqzH6ywAMArQ1c'
);

const GENEROS = {
  'Action': 'Ação', 'Adventure': 'Aventura', 'Animation': 'Animação',
  'Biography': 'Biografia', 'Comedy': 'Comédia', 'Crime': 'Crime',
  'Documentary': 'Documentário', 'Drama': 'Drama', 'Family': 'Família',
  'Fantasy': 'Fantasia', 'History': 'História', 'Horror': 'Terror',
  'Music': 'Música', 'Musical': 'Musical', 'Mystery': 'Mistério',
  'Romance': 'Romance', 'Sci-Fi': 'Ficção Científica', 'Sport': 'Esporte',
  'Thriller': 'Thriller', 'War': 'Guerra', 'Western': 'Faroeste',
};

const PAISES = {
  'United States': 'Estados Unidos', 'United Kingdom': 'Reino Unido',
  'France': 'França', 'Germany': 'Alemanha', 'Italy': 'Itália',
  'Spain': 'Espanha', 'Japan': 'Japão', 'South Korea': 'Coreia do Sul',
  'China': 'China', 'Australia': 'Austrália', 'Canada': 'Canadá',
  'Brazil': 'Brasil', 'Mexico': 'México', 'India': 'Índia',
  'Russia': 'Rússia', 'New Zealand': 'Nova Zelândia',
};

const MESES = {
  'Jan': 'jan', 'Feb': 'fev', 'Mar': 'mar', 'Apr': 'abr',
  'May': 'mai', 'Jun': 'jun', 'Jul': 'jul', 'Aug': 'ago',
  'Sep': 'set', 'Oct': 'out', 'Nov': 'nov', 'Dec': 'dez',
};

function traduzirLista(texto, mapa) {
  if (!texto || texto === 'N/A') return texto;
  return texto.split(', ').map(item => mapa[item.trim()] || item.trim()).join(', ');
}

function traduzirData(data) {
  if (!data || data === 'N/A') return data;
  let resultado = data;
  Object.entries(MESES).forEach(([en, pt]) => {
    resultado = resultado.replace(en, pt);
  });
  return resultado;
}

async function traduzir(texto) {
  if (!texto || texto === 'N/A') return texto;
  try {
    const frases = texto.match(/[^.!?]+[.!?]+/g) || [texto];
    const chunks = [];
    let chunk = '';
    for (const frase of frases) {
      if ((chunk + frase).length > 400) {
        if (chunk) chunks.push(chunk.trim());
        chunk = frase;
      } else {
        chunk += frase;
      }
    }
    if (chunk) chunks.push(chunk.trim());

    const traduzidos = await Promise.all(
      chunks.map(async (c) => {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(c)}&langpair=en|pt-BR`
        );
        const data = await res.json();
        return data.responseStatus === 200 ? data.responseData.translatedText : c;
      })
    );
    return traduzidos.join(' ');
  } catch {
    return texto;
  }
}

export default function DetalheFilme() {
  const { id } = useParams();
  const router = useRouter();
  const [filme, setFilme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plotPT, setPlotPT] = useState('');
  const [awardsPT, setAwardsPT] = useState('');

  // Comentários
  const [comentarios, setComentarios] = useState([]);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Busca filme
  useEffect(() => {
    fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}&plot=full`)
      .then(res => res.json())
      .then(async data => {
        setFilme(data);
        if (data.Response !== 'False') {
          const [plot, awards] = await Promise.all([
            traduzir(data.Plot),
            traduzir(data.Awards),
          ]);
          setPlotPT(plot);
          setAwardsPT(awards);
        }
        setLoading(false);
      });
  }, [id]);

  // Busca comentários
  useEffect(() => {
    buscarComentarios();
  }, [id]);

  async function buscarComentarios() {
    const { data } = await supabase
      .from('comentarios')
      .select('*')
      .eq('filme_id', id)
      .order('criado_em', { ascending: false });
    if (data) setComentarios(data);
  }

  async function enviarComentario(e) {
    e.preventDefault();
    if (!nome.trim() || !texto.trim()) return;
    setEnviando(true);
    await supabase.from('comentarios').insert({
      filme_id: id,
      filme_titulo: filme?.Title || '',
      nome: nome.trim(),
      texto: texto.trim(),
    });
    setTexto('');
    setEnviando(false);
    buscarComentarios();
  }

  function formatarData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

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
        <button onClick={() => router.back()} className={styles.voltarBtn}>Voltar</button>
      </div>
    );
  }

  const temPoster = filme.Poster && filme.Poster !== 'N/A';
  const tipo = filme.Type === 'movie' ? 'Filme' : filme.Type === 'series' ? 'Série' : 'Episódio';

  return (
    <main className={styles.main}>
      <button onClick={() => router.back()} className={styles.voltarBtn}>
        ← Voltar ao catálogo
      </button>

      <div className={styles.detalhe}>
        {/* Poster */}
        <div className={styles.posterArea}>
          {temPoster ? (
            <img src={filme.Poster} alt={filme.Title} className={styles.poster} />
          ) : (
            <div className={styles.semPoster}>
              <span>🎬</span>
              <p>Sem imagem disponível</p>
            </div>
          )}
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
            <span className={styles.badge}>{tipo}</span>
            {filme.Rated !== 'N/A' && (
              <span className={styles.classificacao}>{filme.Rated}</span>
            )}
          </div>

          <h1 className={styles.titulo}>{filme.Title}</h1>

          <div className={styles.metaDados}>
            {filme.Year !== 'N/A' && <span>{filme.Year}</span>}
            {filme.Released !== 'N/A' && <span>Lançamento: {traduzirData(filme.Released)}</span>}
            {filme.Runtime !== 'N/A' && <span>{filme.Runtime}</span>}
            {filme.Country !== 'N/A' && <span>{traduzirLista(filme.Country, PAISES)}</span>}
          </div>

          {filme.Genre !== 'N/A' && (
            <div className={styles.generos}>
              {filme.Genre.split(', ').map(g => (
                <span key={g} className={styles.genero}>{GENEROS[g.trim()] || g}</span>
              ))}
            </div>
          )}

          {filme.Plot !== 'N/A' && (
            <div className={styles.secao}>
              <h2>Descrição</h2>
              <p>{plotPT || filme.Plot}</p>
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

          {awardsPT && awardsPT !== 'N/A' && (
            <div className={styles.premios}>
              🏆 {awardsPT}
            </div>
          )}
        </div>
      </div>

      {/* Seção de comentários */}
      <section className={styles.comentariosSecao}>
        <h2 className={styles.comentariosTitulo}>Comentários</h2>

        {/* Formulário */}
        <form className={styles.comentarioForm} onSubmit={enviarComentario}>
          <input
            className={styles.comentarioInput}
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            maxLength={50}
            required
          />
          <textarea
            className={styles.comentarioTextarea}
            placeholder={`O que você achou de "${filme.Title}"?`}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            maxLength={500}
            rows={3}
            required
          />
          <button className={styles.comentarioBotao} type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Comentar'}
          </button>
        </form>

        {/* Lista de comentários */}
        <div className={styles.comentarioLista}>
          {comentarios.length === 0 ? (
            <p className={styles.semComentarios}>Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            comentarios.map(c => (
              <div key={c.id} className={styles.comentarioCard}>
                <div className={styles.comentarioTopo}>
                  <span className={styles.comentarioNome}>{c.nome}</span>
                  <span className={styles.comentarioData}>{formatarData(c.criado_em)}</span>
                </div>
                <p className={styles.comentarioTexto}>{c.texto}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
