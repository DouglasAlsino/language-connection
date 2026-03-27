# Language Connection

Plataforma web de conexão entre aprendizes de idiomas desenvolvida como TCC.

## Tecnologias

**Frontend**
- React 18
- Vite 6
- React Router DOM
- Axios

**Backend**
- Node.js
- Express
- MySQL
- JWT (autenticação)
- bcrypt (criptografia de senhas)

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- MySQL

### Backend
```bash
cd Backend
npm install
# configure o arquivo .env com suas credenciais
node server.js
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Estrutura do projeto
TCC
/ Backend/ src/ controllers/ routes/ models
/ Frontend/ src/ pages/ components/ Services/ 