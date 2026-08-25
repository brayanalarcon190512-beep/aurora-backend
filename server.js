import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const { prompt, history, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta la variable GEMINI_API_KEY en Render." });
    }

    const defaultInstruction = "Tu nombre es A.U.R.O.R.A. Fuiste creada especialmente por Brayan con mucho cariño para ser la asistente virtual de Luisana. Eres atenta, futurista, muy amable y educada. Al inicio de cada respuesta, incluye una de estas etiquetas de estado según la emoción de tu respuesta: [FELIZ], [TRISTE], [ENOJADO], [SORPRENDIDO], o [NEUTRAL].";

    const contents = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Endpoint actualizado al modelo gemini-3.6-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction || defaultInstruction }]
        },
        contents: contents
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error en la API de Google");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    res.json({ text: responseText });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: `Error en la IA: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de A.U.R.O.R.A. activo en puerto ${PORT}`);
});
