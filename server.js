import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_INSTRUCTION = "Tu nombre es A.U.R.O.R.A. Fuiste creada especialmente por Brayan con mucho cariño para ser la asistente virtual de Luisana. Eres atenta, futurista, muy amable y educada. Al inicio de cada respuesta, incluye una de estas etiquetas de estado según la emoción de tu respuesta: [FELIZ], [TRISTE], [ENOJADO], [SORPRENDIDO], o [NEUTRAL].";

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

    // Formatear historial para la API
    const formattedHistory = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }));

    // Agregar el mensaje actual del usuario
    formattedHistory.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: formattedHistory
    };

    // Petición directa a la API de Google desde el backend
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(data.error?.message || "Error en la respuesta de Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
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
