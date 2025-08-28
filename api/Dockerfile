# Dockerfile para a API "ArrendaSuaCasa"

# --- 1. Imagem Base ---
# Começamos com uma imagem oficial do Node.js, versão 20.
# A versão "alpine" é mais pequena e segura.
FROM node:20-alpine

# --- 2. Preparar o Ambiente ---
# Define a pasta de trabalho dentro do contentor
WORKDIR /app

# --- 3. Copiar o package.json e Instalar Dependências ---
# Copia os ficheiros de dependências primeiro para aproveitar o cache do Docker.
# Se estes ficheiros não mudarem, o Docker não reinstala tudo de novo.
COPY package.json ./
COPY package-lock.json ./

# Instala apenas as dependências de PRODUÇÃO
RUN npm install --omit=dev

# --- 4. Copiar o Resto do Código ---
# Copia o schema do Prisma
COPY prisma ./prisma/

# Copia o código-fonte compilado (a pasta dist)
COPY dist ./dist/

# --- 5. Expor a Porta ---
# Informa ao Docker que a nossa aplicação corre na porta 3001
# O Hugging Face irá mapear a sua porta pública para esta.
EXPOSE 3001

# --- 6. Comando de Arranque ---
# O comando que será executado quando o contentor iniciar.
CMD [ "npm", "run", "start" ]