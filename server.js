import { GoogleGenAI } from '@google/genai';
import express from 'express';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
