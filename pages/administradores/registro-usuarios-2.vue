<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>CRUD Usuarios</h1>
      </v-col>
    </v-row>

    <v-form v-model="formUsers" ref="formUsers" lazy-validation>
      <!-- Seleccionar un rol -->
      <v-row justify="center">
        <v-col sm="4" class="mt-5">
          <v-select
            :items="rol"
            @change="actualizarRol"
            v-model="rolSeleccionado"
            :disabled="editing"
            label="Seleccione un rol"
            outlined
          ></v-select>
        </v-col>
      </v-row>

      
    </v-form>
  </v-container>
</template>