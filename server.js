import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const { prompt, history, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta la variable GEMINI_API_KEY en el entorno de Render." });
    }

    // Inicializar el cliente oficial de Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    const defaultInstruction = "Tu nombre es A.U.R.O.R.A. Fuiste creada especialmente por Brayan con mucho cariño para ser la asistente virtual de Luisana. Eres atenta, futurista, muy amable y educada. Al inicio de cada respuesta, incluye una de estas etiquetas de estado según la emoción de tu respuesta: [FELIZ], [TRISTE], [ENOJADO], [SORPRENDIDO], o [NEUTRAL].";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction || defaultInstruction
    });

    // Formatear historial para el SDK de Node.js
    const formattedHistory = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.json({ text: responseText });

  } catch (error) {
    console.error("Error en el servidor backend:", error);
    res.status(500).json({ error: `Error en la IA: ${error.message || 'Error interno del servidor'}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de A.U.R.O.R.A. activo y escuchando en puerto ${PORT}`);
});
