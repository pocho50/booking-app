<script setup>
const pad = (n) => String(n).padStart(2, "0");
const toIso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildFakeData(selectedYear, selectedMes) {
  const offset = (selectedMes % 5) + 1;

  return [
    {
      id: 1,
      nombre: "Apartamento Centro",
      reservas: [
        {
          id: "r1",
          fechaDesde: toIso(selectedYear, selectedMes, 1 + offset),
          fechaHasta: toIso(selectedYear, selectedMes, 3 + offset),
          confirmado: 1,
          activo: 1,
          clienteNombre: "Ana",
          clienteApellido: "Pérez",
        },
        {
          id: "r2",
          fechaDesde: toIso(selectedYear, selectedMes, 8 + offset),
          fechaHasta: toIso(selectedYear, selectedMes, 9 + offset),
          confirmado: selectedMes % 2,
          activo: 1,
          clienteNombre: "Luis",
          clienteApellido: "Gómez",
        },
        {
          id: "r3",
          fechaDesde: toIso(selectedYear, selectedMes, 20),
          fechaHasta: toIso(selectedYear, selectedMes, 22),
          confirmado: 1,
          activo: 0,
          clienteNombre: "Bloqueo",
          clienteApellido: "Mantenimiento",
        },
      ],
    },
    {
      id: 2,
      nombre: "Casa Playa",
      reservas: [
        {
          id: "r4",
          fechaDesde: toIso(selectedYear, selectedMes, 5 + offset),
          fechaHasta: toIso(selectedYear, selectedMes, 7 + offset),
          confirmado: 1,
          activo: 1,
          clienteNombre: "Marta",
          clienteApellido: "López",
        },
        {
          id: "r5",
          fechaDesde: toIso(selectedYear, selectedMes, 14 + offset),
          fechaHasta: toIso(selectedYear, selectedMes, 16 + offset),
          confirmado: 1,
          activo: 1,
          clienteNombre: "Javier",
          clienteApellido: "Ruiz",
        },
      ],
    },
    {
      id: 3,
      nombre: "Estudio Montaña",
      reservas: [
        {
          id: "r6",
          fechaDesde: toIso(selectedYear, selectedMes, 2),
          fechaHasta: toIso(selectedYear, selectedMes, 2),
          confirmado: 1,
          activo: 1,
          clienteNombre: "Sara",
          clienteApellido: "Núñez",
        },
        {
          id: "r7",
          fechaDesde: toIso(selectedYear, selectedMes, 17 + (selectedMes % 3)),
          fechaHasta: toIso(selectedYear, selectedMes, 19 + (selectedMes % 3)),
          confirmado: 0,
          activo: 1,
          clienteNombre: "Dani",
          clienteApellido: "Vidal",
        },
      ],
    },
  ];
}

const today = new Date();
const month = ref(today.getMonth() + 1);
const year = ref(today.getFullYear());
const loading = ref(false);

const resources = ref(buildFakeData(year.value, month.value));

async function onMonthChange({ mes, year: nextYear }) {
  loading.value = true;
  try {
    await sleep(650);
    resources.value = buildFakeData(nextYear, mes);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="py-4">
    <AppCalendarV2
      v-model:month="month"
      v-model:year="year"
      :resources="resources"
      :loading="loading"
      @month-change="onMonthChange"
    />
  </section>
</template>
