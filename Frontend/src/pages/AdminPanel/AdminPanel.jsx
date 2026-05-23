import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPanel.css";

const ABAS = ["Dashboard", "Posts", "Usuários", "Denúncias"];

function AdminPanel() {
  const [abaAtiva, setAbaAtiva] = useState("Dashboard");
  const [busca, setBusca] = useState("");
  const [dadosGerais, setDadosGerais] = useState({ usuarios: 0, posts: 0, pendentes: 0 });
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/dashboard", { headers })
      .then((r) => {
        setDadosGerais({
          usuarios: r.data.total_usuarios,
          posts: r.data.total_posts,
          pendentes: r.data.denuncias_pendentes,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="adm-page">
      {/* Topbar */}
      <header className="adm-topbar">
        <div className="adm-logo-container">
          <div className="adm-logo-icon">🌐</div>
          Language Connection
        </div>
        <div className="adm-badge-central">
          🛡️ Painel Administrativo
        </div>
        <div className="adm-user-actions">
          <button className="adm-notif-btn">🔔</button>
          <div className="adm-avatar">A</div>
          <button className="adm-btn-sair" onClick={handleLogout}>
            [→ Sair
          </button>
        </div>
      </header>

      <main className="adm-main-container">
        {/* Banner */}
        <div className="adm-banner">
          <div className="adm-banner-content">
            <div className="adm-badge-restrito">🛡️ Acesso restrito</div>
            <h1 className="adm-banner-titulo">
              Gerencie a <span>comunidade</span>
            </h1>
            <p className="adm-banner-sub">
              Modere posts, contas de usuários e denúncias em um só lugar.
            </p>
          </div>
          <div className="adm-banner-stats">
            <div className="adm-banner-stat-item">
              <span className="adm-banner-stat-num">{dadosGerais.usuarios}</span>
              <span className="adm-banner-stat-label">Usuários</span>
            </div>
            <div className="adm-banner-stat-item">
              <span className="adm-banner-stat-num">{dadosGerais.posts}</span>
              <span className="adm-banner-stat-label">Posts</span>
            </div>
            <div className="adm-banner-stat-item">
              <span className="adm-banner-stat-num">{dadosGerais.pendentes}</span>
              <span className="adm-banner-stat-label">Pendentes</span>
            </div>
          </div>
        </div>

        {/* Navigation & Search */}
        <div className="adm-nav-container">
          <nav className="adm-tabs">
            {ABAS.map((aba) => (
              <button
                key={aba}
                className={`adm-tab-btn ${abaAtiva === aba ? "ativo" : ""}`}
                onClick={() => {
                  setAbaAtiva(aba);
                  setBusca(""); // Limpa busca ao trocar de aba
                }}
              >
                {aba === "Dashboard" && "📊"}
                {aba === "Posts" && "📄"}
                {aba === "Usuários" && "👥"}
                {aba === "Denúncias" && "🚩"}
                {aba}
                {aba === "Denúncias" && dadosGerais.pendentes > 0 && (
                  <span className="adm-tab-badge">{dadosGerais.pendentes}</span>
                )}
              </button>
            ))}
          </nav>
          
          {(abaAtiva === "Posts" || abaAtiva === "Usuários") && (
            <div className="adm-search-container">
              <span className="adm-search-icon">🔍</span>
              <input
                type="text"
                className="adm-search-input"
                placeholder={abaAtiva === "Posts" ? "Buscar posts ou autor..." : "Buscar usuário ou e-mail..."}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        {abaAtiva === "Dashboard" && <AbaDashboard headers={headers} />}
        {abaAtiva === "Posts" && <AbaPosts headers={headers} busca={busca} />}
        {abaAtiva === "Usuários" && <AbaUsuarios headers={headers} busca={busca} />}
        {abaAtiva === "Denúncias" && <AbaDenuncias headers={headers} />}
      </main>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────
function AbaDashboard({ headers }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/dashboard", { headers })
      .then((r) => setDados(r.data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p className="adm-loading">Carregando métricas...</p>;
  if (!dados) return <p className="adm-loading">Erro ao carregar dados.</p>;

  // Cálculo de total para as barras de progresso
  const totalPostsIdiomas = dados.idiomas_em_alta.reduce((acc, curr) => acc + curr.total, 0) || 1;

  return (
    <>
      <div className="adm-dash-cards">
        <div className="adm-card-metric">
          <div className="adm-card-icon blue">👥</div>
          <div className="adm-card-metric-num">{dados.total_usuarios}</div>
          <div className="adm-card-metric-title">Total de usuários</div>
          <div className="adm-card-metric-sub">+{dados.novos_esta_semana} esta semana</div>
        </div>
        <div className="adm-card-metric">
          <div className="adm-card-icon green">📄</div>
          <div className="adm-card-metric-num">{dados.total_posts}</div>
          <div className="adm-card-metric-title">Posts publicados</div>
          <div className="adm-card-metric-sub">+{dados.posts_hoje} hoje</div>
        </div>
        <div className="adm-card-metric">
          <div className="adm-card-icon red">🚩</div>
          <div className="adm-card-metric-num">{dados.denuncias_pendentes}</div>
          <div className="adm-card-metric-title">Denúncias pendentes</div>
          <div className="adm-card-metric-sub">Requer atenção</div>
        </div>
        <div className="adm-card-metric">
          <div className="adm-card-icon gray">🚫</div>
          <div className="adm-card-metric-num">{dados.contas_banidas}</div>
          <div className="adm-card-metric-title">Contas banidas</div>
          <div className="adm-card-metric-sub">Total acumulado</div>
        </div>
      </div>

      <div className="adm-dash-bottom">
        <div className="adm-section-card">
          <h3>📈 Atividade recente</h3>
          <div className="adm-activity-list">
            {dados.atividade_recente.map((a, i) => (
              <div key={i} className="adm-activity-item">
                <div className="adm-activity-icon">
                  {a.tipo === "post" ? "📄" : a.tipo === "denuncia" ? "🚩" : "👥"}
                </div>
                <div className="adm-activity-text">{a.descricao}</div>
                <div className="adm-activity-time">há pouco</div>
              </div>
            ))}
          </div>
        </div>

        <div className="adm-section-card">
          <h3>📈 Idiomas em alta</h3>
          <div className="adm-lang-list">
            {dados.idiomas_em_alta.map((i) => {
              const pct = Math.round((i.total / totalPostsIdiomas) * 100);
              return (
                <div key={i.idioma} className="adm-lang-item">
                  <div className="adm-lang-info">
                    <span>{i.idioma}</span>
                    <span className="adm-lang-percent">{pct}%</span>
                  </div>
                  <div className="adm-lang-bar-bg">
                    <div className="adm-lang-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Posts ──────────────────────────────────────────────────────────
function AbaPosts({ headers, busca }) {
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const buscarPosts = () => {
    axios
      .get("http://localhost:3000/admin/posts", { headers })
      .then((r) => setPosts(r.data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  };

  useEffect(() => { buscarPosts(); }, []);

  const excluirPost = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este post?")) return;
    try {
      await axios.delete(`http://localhost:3000/admin/posts/${id}`, { headers });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro ao excluir post.");
    }
  };

  const postsFiltrados = posts.filter(
    (p) =>
      !busca.trim() ||
      p.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      p.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <p className="adm-loading">Carregando posts...</p>;

  return (
    <div className="adm-table-container">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Post</th>
            <th>Autor</th>
            <th>Idioma</th>
            <th>Denúncias</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {postsFiltrados.map((post) => {
            const dataObj = new Date(post.criado_em);
            const hoje = new Date();
            const difHoras = Math.abs(hoje - dataObj) / 36e5;
            const tempoTexto = difHoras < 24 ? "HÁ POUCO" : dataObj.toLocaleDateString("pt-BR").toUpperCase();
            
            return (
              <tr key={post.id}>
                <td>
                  <div className="adm-td-title">{post.titulo}</div>
                  <div className="adm-td-sub">{tempoTexto}</div>
                </td>
                <td>
                  <span className="adm-td-user-icon">{post.nome?.charAt(0)?.toUpperCase() || "U"}</span>
                  <span style={{ fontWeight: 600 }}>{post.nome} {post.sobrenome}</span>
                </td>
                <td><span className="adm-badge-light">{post.idioma}</span></td>
                <td>
                  <span className={`adm-denuncia-count ${post.qtd_denuncias > 0 ? 'danger' : ''}`}>
                    {post.qtd_denuncias > 0 ? `⚠️ ${post.qtd_denuncias}` : "—"}
                  </span>
                </td>
                <td>
                  <div className="adm-actions-cell">
                    <button className="adm-btn-outline success" onClick={() => excluirPost(post.id)}>
                      🗑️ Excluir
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Usuários ───────────────────────────────────────────────────────
function AbaUsuarios({ headers, busca }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/usuarios", { headers })
      .then((r) => setUsuarios(r.data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const toggleBan = async (usuario) => {
    const acao = usuario.banido ? "desbanir" : "banir";
    const msg = usuario.banido
      ? `Desbanir ${usuario.nome}?`
      : `Banir ${usuario.nome}? Ele não conseguirá mais fazer login.`;
    if (!window.confirm(msg)) return;

    try {
      await axios.put(
        `http://localhost:3000/admin/usuarios/${usuario.id}/${acao}`,
        {},
        { headers }
      );
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuario.id ? { ...u, banido: !u.banido } : u
        )
      );
    } catch {
      alert(`Erro ao ${acao} usuário.`);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      !busca.trim() ||
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <p className="adm-loading">Carregando usuários...</p>;

  return (
    <div className="adm-table-container">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>E-mail</th>
            <th>Papel</th>
            <th>Status</th>
            <th>Posts</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((u) => (
            <tr key={u.id}>
              <td>
                <span className="adm-td-user-icon">{u.nome?.charAt(0)?.toUpperCase() || "U"}</span>
                <div style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle' }}>
                  <span style={{ fontWeight: 600 }}>{u.nome} {u.sobrenome}</span>
                  <span className="adm-td-sub">Desde {new Date(u.criado_em).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                </div>
              </td>
              <td><span className="adm-td-sub">{u.email}</span></td>
              <td>
                <span className={`adm-role-${u.nivel === 'admin' ? 'admin' : u.nivel === 'moderador' ? 'mod' : 'user'}`}>
                  {u.nivel === 'admin' ? 'Admin' : u.nivel === 'moderador' ? 'Moderador' : 'Usuário'}
                </span>
              </td>
              <td>
                <span className={`adm-status ${u.banido ? "banido" : "ativo"}`}>
                  {u.banido ? "Banido" : "Ativo"}
                </span>
              </td>
              <td style={{ fontWeight: 600, color: "var(--admin-text-dark)" }}>{u.posts_count || 0}</td>
              <td>
                <div className="adm-actions-cell">
                  <button
                    className={`adm-btn-outline ${u.banido ? "" : "warning"}`}
                    onClick={() => toggleBan(u)}
                  >
                    🚫 {u.banido ? "Reativar" : "Banir"}
                  </button>
                  {/* Mantendo o botao Excluir inativo ou visual se não tem funcionalidade ainda, para ser fiel ao print */}
                  <button className="adm-btn-outline success">
                    🗑️ Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Denúncias ──────────────────────────────────────────────────────
function AbaDenuncias({ headers }) {
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("pendente");

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/denuncias", { headers })
      .then((r) => setDenuncias(r.data))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const resolverDenuncia = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/denuncias/${id}`,
        { status },
        { headers }
      );
      setDenuncias((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
    } catch {
      alert("Erro ao atualizar denúncia.");
    }
  };

  const resolverEExcluirPost = async (denunciaId) => {
    if (!window.confirm("Tem certeza que deseja RESOLVER esta denúncia e EXCLUIR o post permanentemente? Esta ação é irreversível.")) {
      return;
    }
    try {
      await axios.put(
        `http://localhost:3000/admin/denuncias/${denunciaId}/resolver-e-excluir`,
        {},
        { headers }
      );
      setDenuncias((prev) => prev.filter((d) => d.id !== denunciaId));
      alert("Denúncia resolvida e post excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao resolver e excluir post:", error);
      alert("Erro ao resolver denúncia e excluir post.");
    }
  };

  const denunciasFiltradas = denuncias.filter((d) => d.status === filtro);

  if (carregando) return <p className="adm-loading">Carregando denúncias...</p>;

  return (
    <>
      <div className="adm-filtro-tabs" style={{ marginBottom: '16px' }}>
        {["pendente", "resolvida", "ignorada"].map((s) => (
          <button
            key={s}
            className={`adm-filtro-tab ${filtro === s ? "ativo" : ""}`}
            onClick={() => setFiltro(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="adm-denuncias-list">
        {denunciasFiltradas.length === 0 ? (
          <div className="adm-empty">Nenhuma denúncia {filtro}.</div>
        ) : (
          denunciasFiltradas.map((d) => {
            const dataObj = new Date(d.criado_em);
            const hoje = new Date();
            const difHoras = Math.abs(hoje - dataObj) / 36e5;
            const tempoTexto = difHoras < 24 ? "HOJE" : dataObj.toLocaleDateString("pt-BR");

            return (
              <div key={d.id} className="adm-denuncia-card">
                <div className="adm-denuncia-left">
                  <div className={`adm-denuncia-icon ${d.status}`}>
                    {d.status === "pendente" ? "🚩" : d.status === "resolvida" ? "✅" : "🚫"}
                  </div>
                  <div className="adm-denuncia-content">
                    <div className="adm-denuncia-meta">
                      <span className="adm-denuncia-type">POST</span>
                      <span>{tempoTexto}</span>
                    </div>
                    <div className="adm-denuncia-target">
                      {d.autor_post_nome} — {d.post_titulo || "Sem título"}
                    </div>
                    <div className="adm-denuncia-reason">
                      {d.denunciante_nome} reportou: {d.motivo}
                    </div>
                  </div>
                </div>

                <div className="adm-denuncia-actions">
                  {d.status === "pendente" ? (
                    <>
                      <button className="adm-btn-primary" onClick={() => resolverEExcluirPost(d.id)}>
                        ✓ Resolver
                      </button>
                      <button className="adm-btn-secondary" onClick={() => resolverDenuncia(d.id, "ignorada")}>
                        🗑️ Descartar
                      </button>
                    </>
                  ) : (
                    <span className="adm-resolved-badge">
                      {d.status === "resolvida" ? "✅ Resolvido" : "🚫 Ignorado"}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default AdminPanel;