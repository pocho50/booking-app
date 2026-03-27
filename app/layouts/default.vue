<script setup lang="ts">
const { clear } = useUserSession();
const { items } = useNavItems();

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
    <UHeader mode="drawer">
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <AppNav class="hidden lg:flex" />
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          :loading="loading"
          :disabled="loading"
          icon="i-lucide-log-out"
          class="hidden lg:inline-flex"
          @click="onLogout"
        >
          Salir
        </UButton>
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu :items="items" orientation="vertical" class="w-full" />

        <USeparator class="my-4" />

        <UButton
          block
          color="neutral"
          variant="ghost"
          :loading="loading"
          :disabled="loading"
          icon="i-lucide-log-out"
          @click="onLogout"
        >
          Salir
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

    <!-- <USeparator
      :avatar="{
        src: '/logov2.png',
      }"
    /> -->

    <!-- <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Reservation app • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter> -->
  </UApp>
</template>
