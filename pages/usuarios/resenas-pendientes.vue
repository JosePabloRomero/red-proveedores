<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Reseñas pendientes</h1>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>

    <v-data-table
      :headers="headers"
      :items="resenas_pendientes"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="actualizarResena(item)"> mdi-checkbox-multiple-marked-circle </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
const url = "http:///localhost:3002/api/v1/";
export default {
  layout: "usuarios",
  beforeMount() {
    this.cargarResenas();
  },
  data() {
    return {
      formVentas: true,
      headers: [
        { text: "Nombre proveedor", value: "nombre" },
        { text: "Apellido proveedor", value: "apellido" },
        { text: "Estado", value: "nombre_del_estado" },
        { text: "Acciones", value: "actions" },
      ],
      mensaje: "",
      snackbar: false,
      id: "",
      resenas_pendientes: [],
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
    };
  },
  methods: {
    async cargarResenas() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let usuario = await this.$axios.get(url + "auth");
      this.id = usuario.data.info.id;
      let { data } = await this.$axios.get(url + "resenas_por_cliente/" + this.id);
      console.log(data.info)
      this.resenas_pendientes = data.info;
    },
    actualizarResena(id_resena) {
        this.$router.push("/usuarios/ingreso-resena/"+id_resena.id)
    }
  },
};
</script>
