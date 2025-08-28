# Dockerfile (VERSÃO FINAL E OTIMIZADA)

FROM node:20-alpine
WORKDIR /app

# Copia os ficheiros de dependências e instala
COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev

# Copia o Prisma Client já gerado
COPY ../node_modules/.prisma ./node_modules/.prisma
COPY ../node_modules/@prisma ./node_modules/@prisma

# Copia o código-fonte já compilado
COPY dist ./dist/

EXPOSE 3001
CMD [ "npm", "run", "start" ]