<script setup lang="ts">
import { listClients, type ClientDto } from "../../services/clientService";

const {
  data: clientsData,
  pending,
  refresh,
  error,
} = await useAsyncData<ClientDto[]>("clients", () => listClients());

const clients = computed(() => clientsData.value ?? []);
</script>

<template>
  <section class="py-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Clientes</h1>

      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="outline" @click="refresh()">
          Recargar
        </UButton>
        <UButton to="/clientes/nuevo" icon="i-lucide-user-plus">
          Agregar cliente
        </UButton>
      </div>
    </div>

    <AppLoading v-if="pending" />
    <AppErrorMessage
      v-else-if="error"
      :error="error"
      show-retry
      @retry="refresh()"
    />

    <div v-else class="overflow-auto rounded-lg border border-default">
      <table class="w-full border-collapse text-sm">
        <thead class="bg-elevated/60">
          <tr>
            <th class="border border-default px-3 py-2 text-left">Nombre</th>
            <th class="border border-default px-3 py-2 text-left">Apellido</th>
            <th class="border border-default px-3 py-2 text-left">Doc</th>
            <th class="border border-default px-3 py-2 text-left">Email</th>
            <th class="border border-default px-3 py-2 text-left">Teléfono</th>
            <th class="border border-default px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clients" :key="c.id">
            <td class="border border-default px-3 py-2">{{ c.name }}</td>
            <td class="border border-default px-3 py-2">{{ c.last_name }}</td>
            <td class="border border-default px-3 py-2">{{ c.doc }}</td>
            <td class="border border-default px-3 py-2">{{ c.email }}</td>
            <td class="border border-default px-3 py-2">{{ c.phone }}</td>
            <td class="border border-default px-3 py-2 text-right">
              <UButton
                size="sm"
                color="neutral"
                variant="outline"
                :to="`/clientes/${c.id}`"
              >
                Editar
              </UButton>
            </td>
          </tr>

          <tr v-if="clients.length === 0">
            <td class="border border-default px-3 py-6 text-center" colspan="6">
              No hay clientes.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
