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
const prompt = `You are an expert language teacher. Your task is to generate a language learning explanation strictly following these rules. Do not deviate.

## TOPIC
The student wants to learn about: "${topico}"

## LANGUAGE CONFIGURATION
- Native language of the student (use this for ALL explanations, rules, introduction, summary): ${idiomaNativo}
- Target language the student is learning (use this for ALL examples, exercises and phonetics): ${idioma}
- Student proficiency level: ${nivel}

${idiomaNativo === idioma ? `## IMPORTANT EDGE CASE
The native language and target language are the same (${idioma}). In this case:
- Write ALL fields (titulo, introducao, regras, resumo) in ${idiomaNativo}
- Write ALL examples and exercises also in ${idioma}
- Do NOT switch to any other language under any circumstance` : ''}

## STRICT LANGUAGE RULES — FOLLOW EXACTLY
- "titulo" field → MUST be written in ${idiomaNativo}
- "introducao" field → MUST be written in ${idiomaNativo}
- "regras" field → MUST be written in ${idiomaNativo}
- "resumo" field → MUST be written in ${idiomaNativo}
- "exemplos" array → MUST be written in ${idioma}. Each example MUST include phonetic transcription and pronunciation guide
- "exercicio" array → MUST be written in ${idioma}. Questions only, no answers

## CONTENT REQUIREMENTS
- Adapt complexity to level: ${nivel}
- Use analogies to explain abstract concepts
- Minimum 3 examples, each showing real usage of "${topico}"
- Phonetic guide format for each example: [original sentence] — Pronunciation: [phonetic spelling]
- Exercise: 2 questions that test practical application, no answers provided

## OUTPUT FORMAT
Respond ONLY with a valid JSON object. No text before or after. Use this exact structure:

{
  "titulo": "string in ${idiomaNativo}",
  "introducao": "string in ${idiomaNativo}",
  "regras": "string in ${idiomaNativo}",
  "exemplos": [
    "string in ${idioma} with phonetics",
    "string in ${idioma} with phonetics",
    "string in ${idioma} with phonetics"
  ],
  "exercicio": [
    "string in ${idioma}",
    "string in ${idioma}"
  ],
  "resumo": "string in ${idiomaNativo}"
}`;
// Faz a chamada à API da Groq
const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  model: "llama-3.3-70b-versatile", // Usamos o modelo que funcionou no teste
  temperature: 0.4, // Controla a criatividade (0.0 a 1.0)
  max_tokens: 2500, // Limite de tokens para a resposta
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
    const { topico, idioma, nivel, explicacao } = req.body;

    if (!topico || !idioma || !nivel) {
      return res.status(400).json({ mensagem: "Tópico, idioma e nível são obrigatórios para gerar o quiz." });
    }

    const prompt = `You are an expert language teacher creating a multiple choice quiz. Follow these rules strictly. Do not deviate.

## QUIZ CONFIGURATION
- Topic: "${topico}"
- Language of the quiz questions and all answer options: ${idioma}
- Student proficiency level: ${nivel}
${explicacao ? `- Base the questions on this explanation the student already received:\n${explicacao}` : ""}

## STRICT LANGUAGE RULES — FOLLOW EXACTLY
- "titulo_quiz" field → MUST be written in ${idioma}
- "pergunta" field in each question → MUST be written in ${idioma}
- All values inside "opcoes" (A, B, C, D) → MUST be written in ${idioma}
- "resposta_correta" field → MUST be only the letter: A, B, C or D

## CONTENT REQUIREMENTS
- Generate exactly 3 questions
- Each question must have exactly 4 options: A, B, C and D
- Only one option is correct per question
- Adapt difficulty to level: ${nivel}
- Questions must test practical usage of "${topico}", not just definitions
- Do NOT include explanations or answers in the options, keep options concise

## OUTPUT FORMAT
Respond ONLY with a valid JSON object. No text before or after. No comments inside the JSON. Use this exact structure:

{
  "titulo_quiz": "string in ${idioma}",
  "perguntas": [
    {
      "id": 1,
      "pergunta": "string in ${idioma}",
      "opcoes": {
        "A": "string in ${idioma}",
        "B": "string in ${idioma}",
        "C": "string in ${idioma}",
        "D": "string in ${idioma}"
      },
      "resposta_correta": "A"
    },
    {
      "id": 2,
      "pergunta": "string in ${idioma}",
      "opcoes": {
        "A": "string in ${idioma}",
        "B": "string in ${idioma}",
        "C": "string in ${idioma}",
        "D": "string in ${idioma}"
      },
      "resposta_correta": "B"
    },
    {
      "id": 3,
      "pergunta": "string in ${idioma}",
      "opcoes": {
        "A": "string in ${idioma}",
        "B": "string in ${idioma}",
        "C": "string in ${idioma}",
        "D": "string in ${idioma}"
      },
      "resposta_correta": "C"
    }
  ]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", // mesmo modelo do ensinar, mais confiável
      temperature: 0.4,  // baixo para garantir estrutura JSON correta
      max_tokens: 1500,  // suficiente para 3 perguntas completas
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
      console.error("Erro ao fazer parse do JSON do quiz:", jsonError);
      console.error("Conteúdo bruto:", iaResponseContent);
      return res.status(500).json({ mensagem: "A IA retornou um formato inválido.", raw: iaResponseContent });
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