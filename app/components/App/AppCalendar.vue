<script setup>
import "~/assets/calendar/calendar.css";
import calendarJs from "~/assets/calendar/calendar.js?url";
useHead({
  title: "Calendar",
  script: [
    {
      src: calendarJs,
      onload: () => generateCalendar(),
    },
  ],
});

function generateCalendar() {
  // Calendar generation logic would go here
  // Initialize calendar here if needed
  const pad = (n) => String(n).padStart(2, "0");
  const toIso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const buildFakeData = (year, mes) => {
    const offset = (mes % 5) + 1;

    return [
      {
        id: 1,
        nombre: "Apartamento Centro",
        reservas: [
          {
            fechaDesde: toIso(year, mes, 1 + offset),
            fechaHasta: toIso(year, mes, 3 + offset),
            confirmado: 1,
            activo: 1,
            clienteNombre: "Ana",
            clienteApellido: "Pérez",
          },
          {
            fechaDesde: toIso(year, mes, 8 + offset),
            fechaHasta: toIso(year, mes, 9 + offset),
            confirmado: mes % 2,
            activo: 1,
            clienteNombre: "Luis",
            clienteApellido: "Gómez",
          },
          {
            fechaDesde: toIso(year, mes, 20),
            fechaHasta: toIso(year, mes, 22),
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
            fechaDesde: toIso(year, mes, 5 + offset),
            fechaHasta: toIso(year, mes, 7 + offset),
            confirmado: 1,
            activo: 1,
            clienteNombre: "Marta",
            clienteApellido: "López",
          },
          {
            fechaDesde: toIso(year, mes, 14 + offset),
            fechaHasta: toIso(year, mes, 16 + offset),
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
            fechaDesde: toIso(year, mes, 2),
            fechaHasta: toIso(year, mes, 2),
            confirmado: 1,
            activo: 1,
            clienteNombre: "Sara",
            clienteApellido: "Núñez",
          },
          {
            fechaDesde: toIso(year, mes, 17 + (mes % 3)),
            fechaHasta: toIso(year, mes, 19 + (mes % 3)),
            confirmado: 0,
            activo: 1,
            clienteNombre: "Dani",
            clienteApellido: "Vidal",
          },
        ],
      },
    ];
  };

  const today = new Date();
  const year = today.getFullYear();
  const mes = today.getMonth() + 1;

  const dataFake = buildFakeData(year, mes);

  const calEs = new CalendarioVanilla("#calendar-container", {
    mes,
    year,
    jsonData: dataFake,
    onMonthChange: async ({ mes, year }) => {
      await sleep(650);
      return buildFakeData(year, mes);
    },
  });

  calEs.render();
}
</script>

<template>
  <div id="calendar-container">...loading calendar...</div>
</template>
