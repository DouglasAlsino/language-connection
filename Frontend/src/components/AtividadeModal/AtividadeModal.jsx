import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AtividadeModal.css";
import "../../styles/quiz-shared.css";

function AtividadeModal({ atividade, onFechar }) {
  const [detalhe, setDetalhe] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("explicacao");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const buscarDetalhe = async () => {
      try {
        const sessaoId =
          atividade.tipo === "aprendizado" ? atividade.id : atividade.sessao_id;

        const res = await axios.get(
          `http://localhost:3000/atividades/sessao/${sessaoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDetalhe(res.data);
      } catch (err) {
        console.error("Erro ao buscar detalhe:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDetalhe();
  }, [atividade]);

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{atividade.tema}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        {carregando ? (
          <p className="modal-carregando">Carregando...</p>
        ) : !detalhe ? (
          <p className="modal-carregando">Não foi possível carregar os detalhes.</p>
        ) : (
          <>
            <div className="modal-abas">
              <button
                className={`modal-aba ${abaAtiva === "explicacao" ? "ativa" : ""}`}
                onClick={() => setAbaAtiva("explicacao")}
              >
                Explicação
              </button>
              {detalhe.quiz && (
                <button
                  className={`modal-aba ${abaAtiva === "quiz" ? "ativa" : ""}`}
                  onClick={() => setAbaAtiva("quiz")}
                >
                  Resultado do Quiz
                </button>
              )}
            </div>

            <div className="modal-conteudo">
              {abaAtiva === "explicacao" && detalhe.explicacao && (
                <div className="modal-explicacao">
                  <h3>{detalhe.explicacao.titulo}</h3>
                  <p><strong>Introdução:</strong> {detalhe.explicacao.introducao}</p>
                  <p><strong>Regras:</strong> {detalhe.explicacao.regras}</p>
                  <h4>Exemplos:</h4>
                  <ul>
                    {detalhe.explicacao.exemplos?.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                  <h4>Exercício de Fixação:</h4>
                  <ol>
                    {detalhe.explicacao.exercicio?.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ol>
                  <p><strong>Resumo:</strong> {detalhe.explicacao.resumo}</p>
                </div>
              )}

              {abaAtiva === "quiz" && detalhe.quiz && (
                <div className="modal-quiz">
                  <div className="atividade-pontuacao">
                    <h4>Sua pontuação: {detalhe.quiz.pontuacao}%</h4>
                    <div className="atividade-barra-fundo">
                      <div
                        className="atividade-barra-progresso"
                        style={{
                          width: `${detalhe.quiz.pontuacao}%`,
                          background:
                            detalhe.quiz.pontuacao >= 70 ? "#10b981" : "#f59e0b",
                        }}
                      />
                    </div>
                    <p className="atividade-barra-legenda">
                      {detalhe.quiz.pontuacao >= 70
                        ? "Bom trabalho! Continue assim."
                        : "Continue praticando, você vai melhorar!"}
                    </p>
                  </div>

                  {detalhe.quiz.perguntas?.map((pergunta) => (
                    <div key={pergunta.id} className="quiz-question">
                      <p className="question-text">
                        {pergunta.id}. {pergunta.pergunta}
                      </p>
                      <div className="options-container">
                        {Object.entries(pergunta.opcoes).map(([key, value]) => (
                          <label
                            key={key}
                            className={`option-label ${
                              pergunta.resposta_correta === key ? "correct-option" : ""
                            } ${
                              pergunta.resposta_usuario === key &&
                              pergunta.resposta_usuario !== pergunta.resposta_correta
                                ? "incorrect-option"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              disabled
                              checked={pergunta.resposta_usuario === key}
                              readOnly
                            />
                            {key}) {value}
                          </label>
                        ))}
                      </div>
                      <p
                        className={`feedback-text ${
                          pergunta.correta ? "correct-feedback" : "incorrect-feedback"
                        }`}
                      >
                        {pergunta.correta
                          ? "Correto!"
                          : `Incorreto. A resposta correta era: ${pergunta.resposta_correta}) ${pergunta.opcoes[pergunta.resposta_correta]}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AtividadeModal;