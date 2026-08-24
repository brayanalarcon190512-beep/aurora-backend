import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta la variable GEMINI_API_KEY en Render." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usamos el identificador de modelo gemini-1.5-flash
    const model = genAI.getGenerativeModel(
      { 
        model: "gemini-1.5-flash",
        systemInstruction: "Tu nombre es A.U.R.O.R.A. Fuiste creada especialmente por Brayan con mucho cariño para ser la asistente virtual de Luisana. Eres atenta, futurista, muy amable y educada. Al inicio de cada respuesta, incluye una de estas etiquetas de estado según la emoción de tu respuesta: [FELIZ], [TRISTE], [ENOJADO], [SORPRENDIDO], o [NEUTRAL]."
      },
      { apiVersion: 'v1' } // Forzar la versión v1 estable para evitar el error 404 de v1beta
    );

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
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: `Error en la IA: ${error.message || 'Error desconocido'}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de A.U.R.O.R.A. activo en el puerto ${PORT}`);
});
