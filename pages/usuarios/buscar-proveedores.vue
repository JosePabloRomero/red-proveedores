<template>
  <v-container>
    <h1>Buscar proveedores</h1>
    <v-row align="center">
      <v-col sm="10">
        <v-text-field v-model="first" label="First Name" filled></v-text-field>
      </v-col>
      <v-col sm="2">
        <v-btn color="success" @click="enviar" block>Enviar </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <template>
          <v-card :loading="loading" class="mx-auto my-12" max-width="374">
            <template slot="progress">
              <v-progress-linear
                color="deep-purple"
                height="10"
                indeterminate
              ></v-progress-linear>
            </template>

            <v-img
              height="250"
              src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
            ></v-img>

            <v-card-title>NOEL</v-card-title>

            <v-card-text>
              <v-row align="center" class="mx-0">
                <v-rating
                  :value="4.5"
                  color="amber"
                  dense
                  half-increments
                  readonly
                  size="14"
                ></v-rating>

                <div class="grey--text ml-4">4.5 (413)</div>
              </v-row>

              <div class="my-4 subtitle-1">• Galletas , Noel</div>

              <div>
                Empresa dedicada a la fabricacion de galletas con mas de 100
                años de trayectoria
              </div>
            </v-card-text>

            <v-divider class="mx-4"></v-divider>

            <v-card-title>Disponible</v-card-title>

            <v-card-actions>
              <v-btn color="deep-purple lighten-2" text> Mostrar </v-btn>
            </v-card-actions>
          </v-card>
        </template></v-col
      ></v-row
    ></v-container
  >
</template>
        </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: "usuarios",
};
</script>
