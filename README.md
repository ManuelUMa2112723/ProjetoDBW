Plataforma de Brainstorming com IA

Projeto académico feito por três alunos, com a contribuição de Manuel Fernandes, na cadeira de Desenvolvimento Baseado na Web do 2.º ano de Engenharia Informática da Universidade da Madeira, em 2024/2025.

A aplicação permite partilhar ideias sobre um tema durante um tempo limitado e usar IA para gerar uma solução. Inclui sessões individuais, salas para dois participantes, login, perfil e histórico de sessões.

Tecnologias usadas

React, JavaScript, CSS, Node.js, Express, MongoDB, Mongoose, Passport, bcrypt, Socket.IO e integração com a API do LM Studio.

Como executar no Windows

É preciso ter Node.js, uma base de dados MongoDB e um serviço de IA compatível configurados.

Copia .env.example para .env e preenche MONGODB_URI, SESSION_SECRET, LMSTUDIO_BASE_URL e LMSTUDIO_API_KEY. Não publiques o .env nem as tuas credenciais.

Na pasta principal, executa:

npm.cmd install
npm.cmd start

Noutro terminal, a partir da pasta principal, executa:

cd client
npm.cmd install
$env:PORT = "3001"
npm.cmd start

Abre http://localhost:3001 e regista uma conta. O backend usa a porta 3000.

A geração de texto depende de um serviço de IA disponível que devolva o texto em choices[0].text. A base de dados e a integração com IA foram configuradas pelo grupo.

Este é um projeto académico com limitações conhecidas e destina-se a demonstração local. Não está preparado para utilização em produção.
