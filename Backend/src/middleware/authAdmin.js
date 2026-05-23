const authMiddleware = require("./auth");

const authAdmin = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.usuario || req.usuario.role !== "admin") {
      return res.status(403).json({ mensagem: "Acesso negado. Requer privilégios de administrador." });
    }
    next();
  });
};

module.exports = authAdmin;