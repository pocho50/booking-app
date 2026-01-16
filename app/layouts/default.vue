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
