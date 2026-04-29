// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const Groq = require('groq-sdk');

// Verifica se a chave da API está carregada
if (!process.env.GROQ_API_KEY) {
  console.error("Erro: GROQ_API_KEY não encontrada no arquivo .env");
  process.exit(1); // Sai do processo com erro
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  console.log("Testando conexão com a Groq...");
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Olá, Groq! Diga algo sobre você em uma frase curta.",
        },
      ],
      model: "llama-3.1-8b-instant", // Um modelo rápido e econômico para teste
      temperature: 0.7,
      max_tokens: 50,
    });
console.log("Resposta da Groq:");
console.log(chatCompletion.choices[0]?.message?.content || "Nenhuma resposta.");
console.log("\nConexão com a Groq bem-sucedida!");
  } catch (error) {
    console.error("Erro ao se comunicar com a Groq:", error);
    if (error.response) {
      console.error("Status do erro:", error.response.status);
      console.error("Dados do erro:", error.response.data);
    }
  }
}

main();