<script setup lang="ts">
const { clear } = useUserSession();

const loading = ref(false);

async function onLogout() {
  if (loading.value) {
    return;
  }

  try {
    loading.value = true;
    await clear();
    await navigateTo("/login");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <AppNav />
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          :loading="loading"
          :disabled="loading"
          icon="i-lucide-log-out"
          @click="onLogout"
        >
          Salir
        </UButton>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <USeparator
      :avatar="{
        src: '/logov2.png',
      }"
    />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Reservation app • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
