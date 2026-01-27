// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "nuxt-auth-utils",
    "@nuxtjs/mdc",
    "nuxt-charts",
  ],

  alias: {
    "#prisma-client": new URL("./prisma/generated/client.js", import.meta.url)
      .pathname,
  },

  app: {
    head: {
      link: [{ rel: "manifest", href: "/site.webmanifest" }],
    },
  },

  vite: {
    optimizeDeps: {
      include: ["zod"],
    },
  },

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    aiGatewayApiKey: "",
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
