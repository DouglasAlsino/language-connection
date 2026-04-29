const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); // Para proteger a rota
const Groq = require('groq-sdk'); // Importa o SDK da Groq

// Inicializa o cliente Groq com a chave de API do .env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Acessa a chave do .env
});

// ─── Rota para gerar explicação de tópico com IA ──────────────────
router.post("/ensinar", authMiddleware, async (req, res) => {
  try {
    const { topico, idioma,idiomaNativo, nivel } = req.body;
if (!topico || !idioma || !idiomaNativo || !nivel) {
  return res.status(400).json({ mensagem: "Tópico, idioma e nível são obrigatórios." });
}

// Constrói o prompt para a IA
const prompt = `Você é um professor de idiomas experiente, extremamente didático, paciente e encorajador. Sua missão é desmistificar tópicos complexos de idiomas, tornando-os acessíveis a qualquer aluno.

Sua tarefa é gerar uma explicação completa e fácil de assimilar sobre o tópico de idioma "${topico}", use analogias para facilitar o entendimento para o aluno.

A explicação principal deve ser redigida inteiramente no idioma nativo do aluno, que é "${idiomaNativo}".

No entanto, todos os exemplos práticos e o exercício de fixação devem ser apresentados no idioma que o aluno está aprendendo, que é "${idioma}", e todos os exemplos que usar use transição fonetica e Pronúncia Figurada/Escrita Fonética para que a pessoa aprenda a pronuncia tambem.

Adapte todo o conteúdo, a linguagem e a complexidade dos exemplos para um aluno de nível "${nivel}". Os exemplos devem ser curtos, claros e diretamente relacionados ao tópico.

A explicação deve obrigatoriamente incluir os seguintes elementos, nesta ordem:

1.  **Título:** Um título claro e objetivo para a explicação.
2.  **Introdução:** Uma breve e envolvente introdução que contextualize o tópico e sua importância.
3.  **Regras Principais e Exceções:** Uma seção detalhada que aborde as regras gramaticais ou de uso do tópico, incluindo quaisquer exceções relevantes de forma clara.
4.  **Exemplos Práticos:** Pelo menos 3 (três) exemplos práticos e simples, cada um demonstrando o uso do tópico no idioma "${idioma}".
5.  **Exercício de Fixação:** Um pequeno exercício com 2 (duas) perguntas diretas, sem fornecer as respostas. As perguntas devem ser no idioma "${idioma}" e focadas na aplicação do tópico.
6.  **Resumo Conciso:** Um parágrafo final que sintetize os pontos-chave da explicação.

Formate a resposta estritamente como um objeto JSON, utilizando as seguintes chaves e garantindo que o conteúdo de cada chave esteja em formato de string (exceto 'exemplos' e 'exercicio' que são arrays de strings):

{
  "titulo": "Título da Explicação (no idioma nativo)",
  "introducao": "Texto da introdução (no idioma nativo)",
  "regras": "Texto das regras e exceções (no idioma nativo)",
  "exemplos": [
    "Exemplo 1 (no idioma que o aluno está aprendendo)",
    "Exemplo 2 (no idioma que o aluno está aprendendo)",
    "Exemplo 3 (no idioma que o aluno está aprendendo)"
  ],
  "exercicio": [
    "Pergunta 1 (no idioma que o aluno está aprendendo)",
    "Pergunta 2 (no idioma que o aluno está aprendendo)"
  ],
  "resumo": "Texto do resumo (no idioma nativo)"
}
`;
// Faz a chamada à API da Groq
const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  model: "llama-3.1-8b-instant", // Usamos o modelo que funcionou no teste
  temperature: 0.7, // Controla a criatividade (0.0 a 1.0)
  max_tokens: 1500, // Limite de tokens para a resposta
  response_format: { type: "json_object" }, // Pede para a IA retornar JSON
});

const iaResponseContent = chatCompletion.choices[0]?.message?.content;

if (!iaResponseContent) {
  return res.status(500).json({ mensagem: "A IA não gerou conteúdo." });
}

// Tenta fazer o parse do JSON retornado pela IA
let parsedResponse;
try {
  parsedResponse = JSON.parse(iaResponseContent);
} catch (jsonError) {
  console.error("Erro ao fazer parse do JSON da IA:", jsonError);
  console.error("Conteúdo bruto da IA:", iaResponseContent);
  return res.status(500).json({ mensagem: "A IA retornou um formato inválido.", raw: iaResponseContent });
}

res.json(parsedResponse); // Retorna a explicação formatada
  } catch (error) {
    console.error("Erro ao gerar explicação com IA:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor ao processar a requisição da IA." });
  }
});
// ─── Rota para gerar Quiz com IA ──────────────────
router.post("/gerar-quiz", authMiddleware, async (req, res) => {
  try {
    const { topico, idioma, nivel, explicacao } = req.body; // 'explicacao' é opcional

    if (!topico || !idioma || !nivel) {
      return res.status(400).json({ mensagem: "Tópico, idioma e nível são obrigatórios para gerar o quiz." });
    }

    let prompt = `Você é um professor de idiomas e está criando um quiz.
    Gere um quiz de múltipla escolha com 3 perguntas sobre o tópico "${topico}" no idioma "${idioma}",
    adaptado para um aluno de nível "${nivel}".
    Cada pergunta deve ter 4 opções de resposta (A, B, C, D), onde apenas uma é correta.
    Inclua também a resposta correta para cada pergunta.`;

    if (explicacao) {
      prompt += `\nConsidere a seguinte explicação para basear as perguntas do quiz:\n${explicacao}`;
    }

    prompt += `\nFormate a resposta em JSON com a seguinte estrutura:
    {
      "titulo_quiz": "Quiz sobre [Tópico]",
      "perguntas": [
        {
          "id": 1,
          "pergunta": "Texto da pergunta 1?",
          "opcoes": {
            "A": "Opção A",
            "B": "Opção B",
            "C": "Opção C",
            "D": "Opção D"
          },
          "resposta_correta": "A"
        },
        {
          "id": 2,
          "pergunta": "Texto da pergunta 2?",
          "opcoes": {
            "A": "Opção A",
            "B": "Opção B",
            "C": "Opção C",
            "D": "Opção D"
          },
          "resposta_correta": "B"
        }
        // ... mais perguntas
      ]
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.8, // Um pouco mais de criatividade para o quiz
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const iaResponseContent = chatCompletion.choices[0]?.message?.content;

    if (!iaResponseContent) {
      return res.status(500).json({ mensagem: "A IA não gerou conteúdo para o quiz." });
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(iaResponseContent);
    } catch (jsonError) {
      console.error("Erro ao fazer parse do JSON do quiz da IA:", jsonError);
      console.error("Conteúdo bruto da IA:", iaResponseContent);
      return res.status(500).json({ mensagem: "A IA retornou um formato inválido para o quiz.", raw: iaResponseContent });
    }

    // Adiciona um campo para as respostas do usuário e status de correção
    parsedResponse.perguntas = parsedResponse.perguntas.map(p => ({
      ...p,
      resposta_usuario: null, // Onde o usuário vai armazenar a resposta
      correta: null // true/false após a correção
    }));

    res.json(parsedResponse);

  } catch (error) {
    console.error("Erro ao gerar quiz com IA:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor ao gerar o quiz." });
  }
});


module.exports = router;