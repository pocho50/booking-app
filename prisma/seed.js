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

function makeDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function getSpanishMonthName(month) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[month - 1] ?? "";
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
      start_date: { lte: end_date },
      end_date: { gte: start_date },
    },
    select: { id: true },
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

async function findOrCreatePayment({
  reservationId,
  date,
  amount,
  observations,
}) {
  const existing = await prisma.payment.findFirst({
    where: {
      id_reservation: reservationId,
      date,
      amount,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.payment.create({
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
    prisma.payment.deleteMany(),
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

  const resourcePlaya = await findOrCreateResource({
    name: "Apartamento Playa",
    description: "Apartamento a pocos metros del mar",
  });
  const resourceMontana = await findOrCreateResource({
    name: "Cabaña Montaña",
    description: "Cabaña acogedora en zona de montaña",
  });
  const resourceEstudio = await findOrCreateResource({
    name: "Estudio Jardín",
    description: "Estudio compacto con patio interior",
  });
  const resourceDuplex = await findOrCreateResource({
    name: "Dúplex Familiar",
    description: "Dúplex amplio ideal para familias",
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

  const extraClients = [
    {
      name: "María",
      last_name: "López",
      doc: "DNI-100001",
      email: "maria.lopez@mail.com",
      address: "Calle Mayor 10",
      country: "España",
      state: "Madrid",
      phone: "+34 600 000 101",
    },
    {
      name: "Javier",
      last_name: "Sánchez",
      doc: "DNI-100002",
      email: "javier.sanchez@mail.com",
      address: "Calle Luna 12",
      country: "España",
      state: "Sevilla",
      phone: "+34 600 000 102",
    },
    {
      name: "Carmen",
      last_name: "Ruiz",
      doc: "DNI-100003",
      email: "carmen.ruiz@mail.com",
      address: "Avenida del Sol 3",
      country: "España",
      state: "Málaga",
      phone: "+34 600 000 103",
    },
    {
      name: "Pablo",
      last_name: "Martín",
      doc: "DNI-100004",
      email: "pablo.martin@mail.com",
      address: "Calle Gran Vía 22",
      country: "España",
      state: "Barcelona",
      phone: "+34 600 000 104",
    },
    {
      name: "Lucía",
      last_name: "Fernández",
      doc: "DNI-100005",
      email: "lucia.fernandez@mail.com",
      address: "Passeig 55",
      country: "España",
      state: "Barcelona",
      phone: "+34 600 000 105",
    },
    {
      name: "Sergio",
      last_name: "Gómez",
      doc: "DNI-100006",
      email: "sergio.gomez@mail.com",
      address: "Calle Río 8",
      country: "España",
      state: "Zaragoza",
      phone: "+34 600 000 106",
    },
    {
      name: "Elena",
      last_name: "Díaz",
      doc: "DNI-100007",
      email: "elena.diaz@mail.com",
      address: "Calle Jardín 4",
      country: "España",
      state: "Bilbao",
      phone: "+34 600 000 107",
    },
    {
      name: "Raúl",
      last_name: "Navarro",
      doc: "DNI-100008",
      email: "raul.navarro@mail.com",
      address: "Calle Norte 19",
      country: "España",
      state: "Valencia",
      phone: "+34 600 000 108",
    },
    {
      name: "Patricia",
      last_name: "Ortega",
      doc: "DNI-100009",
      email: "patricia.ortega@mail.com",
      address: "Calle Sur 7",
      country: "España",
      state: "Murcia",
      phone: "+34 600 000 109",
    },
    {
      name: "Diego",
      last_name: "Torres",
      doc: "DNI-100010",
      email: "diego.torres@mail.com",
      address: "Avenida Mar 14",
      country: "España",
      state: "Alicante",
      phone: "+34 600 000 110",
    },
  ];

  const clients = [clientAna, clientLuis];
  for (const data of extraClients) {
    const created = await findOrCreateClient(data);
    clients.push(created);
  }

  const pickClientId = (index) => clients[index % clients.length].id;

  const resources = [
    resourceCasa,
    resourceLoft,
    resourcePlaya,
    resourceMontana,
    resourceEstudio,
    resourceDuplex,
  ];

  const now = new Date();
  const baseYear = now.getUTCFullYear();
  const baseMonth = now.getUTCMonth() + 1;
  const nextYear = baseMonth === 12 ? baseYear + 1 : baseYear;
  const nextMonth = baseMonth === 12 ? 1 : baseMonth + 1;

  const monthForOffset = (offset) => (offset === 0 ? baseMonth : nextMonth);
  const yearForOffset = (offset) => (offset === 0 ? baseYear : nextYear);

  const scheduleTemplate = [
    { monthOffset: 0, startDay: 3, endDay: 6, kind: "booking" },
    { monthOffset: 0, startDay: 8, endDay: 12, kind: "booking" },
    {
      monthOffset: 0,
      startDay: 15,
      endDay: 17,
      kind: "block",
      observation: "Mantenimiento",
    },
    { monthOffset: 0, startDay: 20, endDay: 23, kind: "pending" },
    { monthOffset: 0, startDay: 26, endDay: 30, kind: "booking" },
    { monthOffset: 1, startDay: 2, endDay: 5, kind: "booking" },
    { monthOffset: 1, startDay: 7, endDay: 10, kind: "pending" },
    {
      monthOffset: 1,
      startDay: 12,
      endDay: 14,
      kind: "block",
      observation: "Bloqueo",
    },
    { monthOffset: 1, startDay: 16, endDay: 20, kind: "booking" },
    { monthOffset: 1, startDay: 23, endDay: 27, kind: "booking" },
  ];

  const reservations = [];
  for (const [resourceIndex, resource] of resources.entries()) {
    const dateShift = resourceIndex;
    const basePrice = 420 + resourceIndex * 40;

    for (const [i, slot] of scheduleTemplate.entries()) {
      const slotMonth = monthForOffset(slot.monthOffset);
      const slotYear = yearForOffset(slot.monthOffset);

      const start = makeDate(slotYear, slotMonth, slot.startDay + dateShift);
      const end = makeDate(slotYear, slotMonth, slot.endDay + dateShift);

      if (slot.kind === "block") {
        reservations.push({
          start,
          end,
          resourceId: resource.id,
          clientId: null,
          price: 0,
          confirmed: false,
          active: false,
          observation: slot.observation,
        });
        continue;
      }

      const confirmed = slot.kind === "booking";
      const observation =
        slot.kind === "pending"
          ? "Pendiente de confirmación"
          : `${getSpanishMonthName(slotMonth)} ${slotYear}`;

      reservations.push({
        start,
        end,
        resourceId: resource.id,
        clientId: pickClientId(resourceIndex * 10 + i),
        price: basePrice + i * 35,
        confirmed,
        active: true,
        observation,
      });
    }
  }

  const createdReservations = [];
  for (const r of reservations) {
    const created = await findOrCreateReservation({
      start_date: r.start,
      end_date: r.end,
      resourceId: r.resourceId,
      clientId: r.clientId,
      price: r.price,
      confirmed: r.confirmed,
      active: r.active,
      observation: r.observation,
    });
    createdReservations.push(created);
  }

  for (const reservation of createdReservations.slice(0, 10)) {
    if (!reservation.id_client) continue;
    await findOrCreatePayment({
      reservationId: reservation.id,
      date: addDays(reservation.start_date, -1),
      amount: Math.max(50, Math.round(reservation.price * 0.3)),
      observations: "Adelanto",
    });
  }
}

try {
  await main();
} catch (error) {
  console.error("Seed failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
