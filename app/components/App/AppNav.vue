<script setup>
const items = ref([
  {
    label: "Calendario",
    icon: "i-lucide-calendar",
    to: "/",
  },
  {
    label: "Clientes",
    icon: "i-lucide-users",
    to: "/clientes",
    children: [
      {
        label: "Lista cliente",
        icon: "i-lucide-list",
        to: "/clientes",
      },
      {
        label: "Agregar cliente",
        icon: "i-lucide-user-plus",
        to: "/clientes/nuevo",
      },
    ],
  },
  {
    label: "Recursos",
    icon: "i-lucide-home",
    to: "/recursos",
    children: [
      {
        label: "Listar recursos",
        icon: "i-lucide-list",
        to: "/recursos",
      },
      {
        label: "Agregar recursos",
        icon: "i-lucide-plus",
        to: "/recursos/nuevo",
      },
    ],
  },
  {
    label: "Reservas",
    icon: "i-lucide-calendar-days",
    to: "/reservas",
  },
  {
    label: "IA",
    icon: "i-lucide-sparkles",
    to: "/ia",
  },
]);
</script>

<template>
  <UNavigationMenu :items="items" class="w-full justify-end" />
</template>
