// Importa o pool de conexão com o banco
const db = require("../config/db");

// bcryptjs para criptografar e comparar senhas
const bcrypt = require("bcryptjs");

// jsonwebtoken para gerar o token JWT
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────
// CADASTRO
// POST /auth/cadastro
// Cria um novo usuário no banco de dados
// ─────────────────────────────────────────
async function cadastro(req, res) {
  // Pega os dados enviados pelo frontend no body da requisição
  const {
    nome,
    sobrenome,
    email,
    senha,
    idioma_nativo,
    idiomas_aprender,
    nivel,
  } = req.body;

  // Validação básica: todos os campos obrigatórios devem existir
  if (!nome || !sobrenome || !email || !senha) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios.",
    });
  }

  try {
    // Verifica se já existe um usuário com esse email
    // Evita cadastros duplicados
    const [usuarioExistente] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({
        erro: "Este e-mail já está cadastrado.",
      });
    }

    // Criptografa a senha antes de salvar
    // O número 10 é o "salt rounds" — quanto maior, mais seguro (e mais lento)
    // 10 é o valor padrão recomendado
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // idiomas_aprender vem como array do frontend (ex: ["Inglês", "Espanhol"])
    // Converte para string para salvar no MySQL
    const idiomasString = Array.isArray(idiomas_aprender)
      ? idiomas_aprender.join(",")
      : idiomas_aprender;

    // Insere o novo usuário no banco
    const [resultado] = await db.query(
      `INSERT INTO usuarios 
        (nome, sobrenome, email, senha, idioma_nativo, idiomas_aprender, nivel)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        sobrenome,
        email,
        senhaCriptografada, // nunca salvamos a senha pura
        idioma_nativo,
        idiomasString,
        nivel,
      ]
    );

    // Gera um token JWT para o usuário recém-cadastrado
    // Assim ele já fica logado após o cadastro sem precisar fazer login
    const token = jwt.sign(
      {
        id: resultado.insertId, // ID gerado pelo MySQL
        email: email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // token válido por 7 dias
    );

    // Retorna o token e os dados básicos do usuário
    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      token,
      usuario: {
        id: resultado.insertId,
        nome,
        sobrenome,
        email,
        idioma_nativo,
        idiomas_aprender: idiomas_aprender,
        nivel,
      },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return res.status(500).json({
      erro: "Erro interno no servidor. Tente novamente.",
    });
  }
}

// ─────────────────────────────────────────
// LOGIN
// POST /auth/login
// Autentica um usuário existente
// ─────────────────────────────────────────
async function login(req, res) {
  // Pega email e senha enviados pelo frontend
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({
      erro: "Informe e-mail e senha.",
    });
  }

  try {
    // Busca o usuário pelo email no banco
    const [usuarios] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    // Se não encontrou nenhum usuário com esse email
    if (usuarios.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }

    // Pega o primeiro (e único) resultado
    const usuario = usuarios[0];

    // Compara a senha digitada com o hash salvo no banco
    // bcrypt.compare retorna true se baterem, false se não
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }

    // Gera o token JWT com os dados do usuário
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Retorna o token e os dados do usuário
    // Nunca retornamos a senha, mesmo que criptografada
    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        idioma_nativo: usuario.idioma_nativo,
        idiomas_aprender: usuario.idiomas_aprender
          ? usuario.idiomas_aprender.split(",") // converte string de volta para array
          : [],
        nivel: usuario.nivel,
        bio: usuario.bio,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({
      erro: "Erro interno no servidor. Tente novamente.",
    });
  }
}

module.exports = { cadastro, login };