// Importa o jsonwebtoken para verificar o token JWT
const jwt = require("jsonwebtoken");

// Middleware de autenticação
// É executado ANTES do controller em rotas protegidas
// Verifica se o token JWT é válido antes de dar acesso ao recurso
function authMiddleware(req, res, next) {
  // Pega o header Authorization da requisição
  // O frontend envia assim: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  // Se não tiver o header, bloqueia o acesso
  if (!authHeader) {
    return res.status(401).json({
      erro: "Token não fornecido. Faça login para continuar.",
    });
  }

  // Separa o "Bearer" do token em si
  // split(" ") divide a string pelo espaço
  // [1] pega a segunda parte (o token)
  const token = authHeader.split(" ")[1];

  try {
    // Verifica se o token é válido e não expirou
    // Se for inválido, lança uma exceção e cai no catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona os dados do usuário na requisição
    // Assim o controller sabe quem está fazendo a requisição
    // ex: req.usuario.id, req.usuario.email
    req.usuario = decoded;

    // Passa para o próximo middleware ou controller
    next();
  } catch (error) {
    return res.status(401).json({
      erro: "Token inválido ou expirado. Faça login novamente.",
    });
  }
}

module.exports = authMiddleware;