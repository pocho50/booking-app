import { Hash } from "@adonisjs/hash";
import { Scrypt } from "@adonisjs/hash/drivers/scrypt";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/client.js";

const databaseUrl = process.env.DATABASE_URL ?? "";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });
const hash = new Hash(new Scrypt());

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function findOrCreateUser({ name, email, password, role }) {
  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return existing;
  }

  const hashedPassword = await hash.make(password);
  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
}

async function findOrCreateResource({ name, description }) {
  const existing = await prisma.resource.findFirst({ where: { name } });
  if (existing) {
    return existing;
  }

  return prisma.resource.create({
    data: {
      name,
      description,
    },
  });
}

async function findOrCreateClient({
  name,
  last_name,
  doc,
  email,
  address,
  country,
  state,
  phone,
}) {
  const existing = await prisma.client.findFirst({ where: { doc } });
  if (existing) {
    return existing;
  }

  return prisma.client.create({
    data: {
      name,
      last_name,
      doc,
      email,
      address,
      country,
      state,
      phone,
    },
  });
}

async function findOrCreateReservation({
  start_date,
  end_date,
  resourceId,
  clientId,
  price,
  confirmed,
  active,
  observation,
}) {
  const existing = await prisma.reservation.findFirst({
    where: {
      id_resource: resourceId,
      start_date,
      end_date,
      id_client: clientId ?? null,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.reservation.create({
    data: {
      start_date,
      end_date,
      id_resource: resourceId,
      id_client: clientId ?? null,
      observation,
      price,
      confirmed,
      active,
    },
  });
}

async function findOrCreateBilling({
  reservationId,
  date,
  amount,
  observations,
}) {
  const existing = await prisma.billing.findFirst({
    where: {
      id_reservation: reservationId,
      date,
      amount,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.billing.create({
    data: {
      id_reservation: reservationId,
      date,
      amount,
      observations,
    },
  });
}

async function main() {
  await prisma.$transaction([
    prisma.billing.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.client.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await findOrCreateUser({
    name: "Admin",
    email: "admin@demo.com",
    password: "admin123",
    role: "ADMIN",
  });

  const resourceCasa = await findOrCreateResource({
    name: "Casa Norte",
    description: "Casa con vista al jardín",
  });
  const resourceLoft = await findOrCreateResource({
    name: "Loft Centro",
    description: "Loft moderno con terraza",
  });

  const clientAna = await findOrCreateClient({
    name: "Ana",
    last_name: "García",
    doc: "DNI-123456",
    email: "ana@mail.com",
    address: "Calle 123",
    country: "España",
    state: "Madrid",
    phone: "+34 600 000 001",
  });

  const clientLuis = await findOrCreateClient({
    name: "Luis",
    last_name: "Pérez",
    doc: "DNI-654321",
    email: "luis@mail.com",
    address: "Avenida 45",
    country: "España",
    state: "Valencia",
    phone: "+34 600 000 002",
  });

  const today = new Date();
  const reservationA = await findOrCreateReservation({
    start_date: addDays(today, 2),
    end_date: addDays(today, 5),
    resourceId: resourceCasa.id,
    clientId: clientAna.id,
    price: 420,
    confirmed: true,
    active: true,
    observation: "Reserva temprana",
  });

  const reservationB = await findOrCreateReservation({
    start_date: addDays(today, 7),
    end_date: addDays(today, 10),
    resourceId: resourceLoft.id,
    clientId: clientLuis.id,
    price: 560,
    confirmed: false,
    active: true,
    observation: "Pendiente de confirmación",
  });

  await findOrCreateReservation({
    start_date: addDays(today, 12),
    end_date: addDays(today, 14),
    resourceId: resourceCasa.id,
    clientId: null,
    price: 0,
    confirmed: false,
    active: false,
    observation: "Mantenimiento",
  });

  await findOrCreateBilling({
    reservationId: reservationA.id,
    date: addDays(today, 1),
    amount: 200,
    observations: "Adelanto",
  });

  await findOrCreateBilling({
    reservationId: reservationA.id,
    date: addDays(today, 4),
    amount: 220,
    observations: "Saldo",
  });

  await findOrCreateBilling({
    reservationId: reservationB.id,
    date: addDays(today, 6),
    amount: 150,
    observations: "Reserva",
  });
}

try {
  await main();
} catch (error) {
  console.error("Seed failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
