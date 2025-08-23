const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOwner(data) {
  const owner = await prisma.owner.create({
    data: {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      ascBalance: 0,
      verified: false,
      user: {
        create: {
          email: data.email,
          password: data.password,
          role: 'OWNER',
        },
      },
    },
    include: {
      user: true,
    },
  });

  return owner;
}

async function createClient(data) {
  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      user: {
        create: {
          email: data.email,
          password: data.password,
          role: 'CLIENT',
        },
      },
    },
    include: {
      user: true,
    },
  });

  return client;
}

// Exemplo de uso
(async () => {
  const owner = await createOwner({
    name: 'Proprietário Exemplo',
    email: 'owner@example.com',
    password: '123456',
    phoneNumber: '123456789',
  });
  console.log('Owner criado:', owner);

  const client = await createClient({
    name: 'Cliente Exemplo',
    email: 'client@example.com',
    password: '123456',
  });
  console.log('Client criado:', client);
})();
