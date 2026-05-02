import "./Progresso.css";

function Progresso({ progresso }) {
  // Se ainda não carregou os dados, mostra uma mensagem
  if (!progresso) {
    return (
      <div className="prog-vazio">
        <p>Carregando progresso...</p>
      </div>
    );
  }

  const { resumo, por_idioma, historico } = progresso;

  // Se o usuário nunca fez um quiz, mostra mensagem motivacional
  if (resumo.total_quizzes === 0) {
    return (
      <div className="prog-vazio">
        <p>Você ainda não fez nenhum quiz. Comece a estudar para ver seu progresso!</p>
      </div>
    );
  }

  return (
    <div className="prog-container">

      {/* ─── Bloco 1: Resumo geral ─────────────────────────── */}
      {/* Três cards lado a lado mostrando os números gerais */}
      <div className="prog-resumo">
        <div className="prog-resumo-card">
          <div className="prog-resumo-numero">{resumo.total_sessoes}</div>
          <div className="prog-resumo-label">Sessões de estudo</div>
        </div>
        <div className="prog-resumo-card">
          <div className="prog-resumo-numero">{resumo.total_quizzes}</div>
          <div className="prog-resumo-label">Quizzes feitos</div>
        </div>
        <div className="prog-resumo-card">
          <div className="prog-resumo-numero">{resumo.media_geral}%</div>
          <div className="prog-resumo-label">Média geral</div>
        </div>
      </div>

      {/* ─── Bloco 2: Progresso por idioma ─────────────────── */}
      {/* Para cada idioma que o usuário praticou, uma barra    */}
      {/* mostrando a média de pontuação nos quizzes            */}
      <div className="prog-secao">
        <h3 className="prog-secao-titulo">Progresso por idioma</h3>
        <div className="prog-idiomas">
          {por_idioma.map((item) => (
            <div key={item.idioma} className="prog-idioma-item">
              <div className="prog-idioma-header">
                <span className="prog-idioma-nome">{item.idioma}</span>
                <span className="prog-idioma-meta">
                  {item.total_quizzes} {item.total_quizzes === 1 ? "quiz" : "quizzes"} · média {item.media}%
                </span>
              </div>

              {/* Fundo cinza da barra */}
              <div className="prog-barra-fundo">
                {/* Barra colorida que cresce conforme a média */}
                {/* A cor muda dependendo do desempenho:        */}
                {/* verde >= 70%, amarelo >= 40%, vermelho < 40% */}
                <div
                  className="prog-barra-preenchimento"
                  style={{
                    width: `${item.media}%`,
                    background:
                      item.media >= 70
                        ? "#10b981"
                        : item.media >= 40
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bloco 3: Histórico de quizzes ─────────────────── */}
      {/* Lista cronológica dos últimos 10 quizzes com detalhes */}
      <div className="prog-secao">
        <h3 className="prog-secao-titulo">Histórico de quizzes</h3>
        <div className="prog-historico">
          {historico.map((quiz) => (
            <div key={quiz.id} className="prog-historico-item">
              <div className="prog-historico-info">
                <div className="prog-historico-tema">{quiz.tema}</div>
                <div className="prog-historico-meta">
                  {quiz.idioma} · {new Date(quiz.criado_em).toLocaleDateString("pt-BR")}
                </div>
              </div>

              {/* Badge de pontuação com cor dinâmica */}
              <div
                className="prog-historico-nota"
                style={{
                  background:
                    quiz.pontuacao >= 70
                      ? "#d1fae5"
                      : quiz.pontuacao >= 40
                      ? "#fef3c7"
                      : "#fee2e2",
                  color:
                    quiz.pontuacao >= 70
                      ? "#065f46"
                      : quiz.pontuacao >= 40
                      ? "#92400e"
                      : "#991b1b",
                }}
              >
                {quiz.pontuacao}%
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Progresso;