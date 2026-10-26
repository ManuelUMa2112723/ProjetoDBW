const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.getContent = async (req, res) => {
  const { prompt, model, temperature } = req.body;

  try {
    const response = await fetch(process.env.LMSTUDIO_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LMSTUDIO_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model: model || 'default-model', // usa o modelo padrão se não for informado
        temperature: temperature || 0.7,
       
      })
    });

    if (!response.ok) {
      // Caso a API retorne erro, repassa o erro para o cliente
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Erro ao conectar com a LM Studio API:', error);
    res.status(500).json({ error: 'Erro interno ao conectar com a API' });
  }
};
