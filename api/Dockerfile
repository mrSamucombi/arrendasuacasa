# Dockerfile para a API "ArrendaSuaCasa"

# 1. Imagem Base
FROM node:20-alpine

# 2. Preparar o Ambiente
WORKDIR /app

# 3. Copiar ficheiros de dependências e instalar
COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev

# 4. Copiar o resto do código-fonte e o schema
COPY . .

# 5. Construir (compilar) a aplicação DENTRO do contentor
# Isto garante que a pasta 'dist' é criada no ambiente de produção
RUN npm run build

# 6. Expor a Porta
# A sua aplicação corre na porta 3001, o Hugging Face irá expor a porta 7860
EXPOSE 3001

# 7. Comando de Arranque (agora aponta para a pasta dist)
CMD [ "npm", "run", "start" ]