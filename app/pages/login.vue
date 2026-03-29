<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { loginSchema, type LoginSchema } from "~~/shared/schemas/auth";
import { loginUser } from "../services/authService";

definePageMeta({
  layout: "blank",
});

type LoginFormState = {
  username: string;
  password: string;
};

const state = reactive<LoginFormState>({
  username: "test@test.com",
  password: "Test123456",
});

const loading = ref(false);
const { showError } = useErrorToast();
const { fetch: refreshSession } = useUserSession();

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  try {
    loading.value = true;
    await loginUser(event.data);
    await refreshSession();
    await navigateTo("/");
  } catch (error: unknown) {
    showError(error, "No se pudo iniciar sesión.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="relative min-h-[calc(100vh-9rem)] overflow-hidden">
    <div class="absolute inset-0">
      <div
        class="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        class="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl"
      />
      <div
        class="absolute left-8 top-24 h-24 w-24 rounded-xl border border-dashed border-primary/30"
      />
    </div>

    <div class="relative mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <div class="flex flex-col items-center gap-3 text-center">
        <AppLogo class="h-14 w-auto" />
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-muted">
            Bienvenido
          </p>
          <h1 class="mt-2 text-2xl font-semibold text-highlighted">
            Inicia sesión
          </h1>
        </div>
        <p class="text-sm text-muted">
          Accede a tu panel para gestionar reservas.
        </p>
      </div>

      <UCard class="mt-8 border border-default bg-elevated/60 shadow-sm">
        <UForm
          class="space-y-5"
          :schema="loginSchema"
          :state="state"
          @submit="onSubmit"
        >
          <UFormField label="Usuario" name="username" required>
            <UInput
              v-model="state.username"
              class="w-full"
              placeholder="usuario"
              autocomplete="username"
            />
          </UFormField>

          <UFormField label="Contraseña" name="password" required>
            <UInput
              v-model="state.password"
              class="w-full"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </UFormField>

          <UButton
            type="submit"
            class="w-full justify-center"
            :loading="loading"
            :disabled="loading"
          >
            Ingresar
          </UButton>
        </UForm>
      </UCard>
    </div>
  </section>
</template>
