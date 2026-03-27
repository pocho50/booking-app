<script setup>
const { items } = useNavItems();
</script>

<template>
  <UNavigationMenu :items="items" class="w-full justify-end" />
</template>
