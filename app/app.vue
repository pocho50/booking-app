<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Reservation App";
const description = "Reservation App";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
});
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
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <NuxtPage />
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
