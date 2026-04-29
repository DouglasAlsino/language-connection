import { useState } from "react";
import axios from "axios";
import "./EditarPerfilModal.css";

const IDIOMAS = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Japonês"];
const NIVEIS = ["Iniciante (A1)", "Básico (A2)", "Intermediário (B1)", "Intermediário avançado (B2)", "Avançado (C1)","Fluente (C2)"];

function EditarPerfilModal({ perfil, token, onFechar, onSalvar }) {
  const [bio, setBio] = useState(perfil.bio || "");
  const [idiomaNativo, setIdiomaNativo] = useState(perfil.idioma_nativo || "");
  const [idiomaAprender, setIdiomaAprender] = useState(perfil.idiomas_aprender || "");
  const [nivel, setNivel] = useState(perfil.nivel || "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!idiomaNativo || !idiomaAprender || !nivel) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (idiomaNativo === idiomaAprender) {
      setErro("O idioma nativo e o idioma que está aprendendo não podem ser iguais.");
      return;
    }

    try {
      setSalvando(true);
      await axios.put(
        `http://localhost:3000/usuarios/${perfil.id}`,
        { bio, idioma_nativo: idiomaNativo, idiomas_aprender: idiomaAprender, nivel },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualiza o localStorage com os novos dados
      const usuarioAtual = JSON.parse(localStorage.getItem("usuario") || "{}");
      const usuarioAtualizado = {
        ...usuarioAtual,
        bio,
        idioma_nativo: idiomaNativo,
        idiomas_aprender: idiomaAprender,
        nivel,
      };
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

      onSalvar(usuarioAtualizado);
      onFechar();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setErro("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="ep-overlay" onClick={onFechar}>
      <div className="ep-modal" onClick={(e) => e.stopPropagation()}>

        <div className="ep-modal-header">
          <h2>Editar Perfil</h2>
          <button className="ep-btn-fechar" onClick={onFechar}>✕</button>
        </div>

        <form onSubmit={salvar} className="ep-form">

          {erro && <p className="ep-erro">{erro}</p>}

          <div className="ep-campo">
            <label>Idioma Nativo</label>
            <select
              value={idiomaNativo}
              onChange={(e) => setIdiomaNativo(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {IDIOMAS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="ep-campo">
            <label>Idioma que está aprendendo</label>
            <select
              value={idiomaAprender}
              onChange={(e) => setIdiomaAprender(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {IDIOMAS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="ep-campo">
            <label>Nível no idioma que está aprendendo</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {NIVEIS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="ep-campo">
            <label>Biografia</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={4}
              maxLength={300}
            />
            <span className="ep-contador">{bio.length}/300</span>
          </div>

          <div className="ep-form-footer">
            <button type="button" className="ep-btn-cancelar" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="ep-btn-salvar" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditarPerfilModal;