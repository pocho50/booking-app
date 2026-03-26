<script setup>
const { user } = useUserSession();

const isAdmin = computed(() => user.value?.role === "ADMIN");

const items = computed(() => {
  const base = [
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
  ];

  if (isAdmin.value) {
    base.push({
      label: "Usuarios",
      icon: "i-lucide-shield",
      to: "/usuarios",
      children: [
        {
          label: "Listar usuarios",
          icon: "i-lucide-list",
          to: "/usuarios",
        },
        {
          label: "Agregar usuario",
          icon: "i-lucide-user-plus",
          to: "/usuarios/nuevo",
        },
      ],
    });
  }

  return base;
});
</script>

<template>
  <UNavigationMenu :items="items" class="w-full justify-end" />
</template>
