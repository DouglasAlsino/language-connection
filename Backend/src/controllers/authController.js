const db = require("../config/db");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");


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


  if (!nome || !sobrenome || !email || !senha) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios.",
    });
  }

  try {
    const [usuarioExistente] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({
        erro: "Este e-mail já está cadastrado.",
      });
    }


    const senhaCriptografada = await bcrypt.hash(senha, 10);


    const idiomasString = Array.isArray(idiomas_aprender)
      ? idiomas_aprender.join(",")
      : idiomas_aprender;


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

    const token = jwt.sign(
      {
        id: resultado.insertId,
        email: email,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

  
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
        role: "user",
      },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return res.status(500).json({
      erro: "Erro interno no servidor. Tente novamente.",
    });
  }
}


async function login(req, res) {

  const { email, senha } = req.body;


  if (!email || !senha) {
    return res.status(400).json({
      erro: "Informe e-mail e senha.",
    });
  }

  try {

  const [usuarios] = await db.query(
    "SELECT id, nome, sobrenome, email, senha, idioma_nativo, idiomas_aprender, nivel, bio, role FROM usuarios WHERE email = ?",
    [email]
  );


    if (usuarios.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }


    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos.",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role, // role do user
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


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
          ? usuario.idiomas_aprender.split(",") 
          : [],
        nivel: usuario.nivel,
        bio: usuario.bio,
        role: usuario.role, 
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
