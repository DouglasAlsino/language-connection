import React, { useState } from "react";
import axios from "axios";
import "./LearningPage.css";

function LearningPage() {
  const [topico, setTopico] = useState("");
  const [idioma, setIdioma] = useState("Português"); // Idioma padrão
  const [idiomaNativo, setIdiomaNativo] = useState("Português"); // Idioma padrão
  const [nivel, setNivel] = useState("Básico"); // Nível padrão
  const [explicacaoIA, setExplicacaoIA] = useState(null); // Armazena a resposta da IA
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");

  const handleGerarExplicacao = async (e) => {
    e.preventDefault();
    setErro("");
    setExplicacaoIA(null); // Limpa a explicação anterior

    if (!topico.trim()) {
      setErro("Por favor, insira um tópico para aprender.");
      return;
    }

    setCarregando(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/ia/ensinar", // Nosso endpoint do backend
        { topico, idioma, nivel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExplicacaoIA(response.data); // Armazena a explicação formatada
    } catch (err) {
      console.error("Erro ao gerar explicação:", err);
      setErro("Não foi possível gerar a explicação. Tente novamente mais tarde.");
      if (err.response && err.response.data && err.response.data.mensagem) {
        setErro(err.response.data.mensagem);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="learning-page-container">
      <h1 className="learning-title">Aprendizado com IA</h1>
      <p className="learning-subtitle">
        Explore tópicos gramaticais e de vocabulário com explicações personalizadas.
      </p>

      <div className="learning-form-card">
        <h2>Gerar Nova Explicação</h2>
        <form onSubmit={handleGerarExplicacao}>
          {erro && <p className="error-message">{erro}</p>}

          <div className="form-group">
            <label htmlFor="topico">Tópico:</label>
            <input
              id="topico"
              type="text"
              placeholder="Ex: Present Simple, Subjunctive Mood, Vocabulário de Viagem"
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              className="learning-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="idioma">Idioma Alvo:</label>
            <select
              id="idioma"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="learning-select"
            >
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Francês">Francês</option>
              <option value="Alemão">Alemão</option>
              <option value="Japonês">Japonês</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="idiomaNativo">Idioma Nativo:</label>
            <select
              id="idioma"
              value={idiomaNativo}
              onChange={(e) => setIdiomaNativo(e.target.value)}
              className="learning-select"
            >
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Francês">Francês</option>
              <option value="Alemão">Alemão</option>
              <option value="Japonês">Japonês</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nivel">Nível:</label>
            <select
              id="nivel"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="learning-select"
            >
              <option value="Básico">Básico</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>

          <button type="submit" className="learning-submit-btn" disabled={carregando}>
            {carregando ? "Gerando..." : "Gerar Explicação"}
          </button>
        </form>
      </div>

      {/* Área para exibir a explicação da IA */}
      {explicacaoIA && (
        <div className="ia-explanation-card">
          <h3>{explicacaoIA.titulo}</h3>
          <p><strong>Introdução:</strong> {explicacaoIA.introducao}</p>
          <p><strong>Regras:</strong> {explicacaoIA.regras}</p>
          <h4>Exemplos:</h4>
          <ul>
            {explicacaoIA.exemplos && explicacaoIA.exemplos.map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ul>
          <h4>Exercício de Fixação:</h4>
          <ol>
            {explicacaoIA.exercicio && explicacaoIA.exercicio.map((ex, index) => (
              <li key={index}>{ex}</li>
            ))}
          </ol>
          <p><strong>Resumo:</strong> {explicacaoIA.resumo}</p>
          {/* Futuramente: Botão para gerar quiz ou compartilhar */}
        </div>
      )}
    </div>
  );
}

export default LearningPage;