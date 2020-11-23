<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Registro de Reseñas</h1>
      </v-col>
    </v-row>

    <v-form v-model="formResenas" ref="formResenas" lazy-validation>
      <v-row>
        <v-card class="mx-auto mt-4" width="700" outlined>
          <v-card-title class="justify-center success">Proveedor:</v-card-title>
        </v-card>
      </v-row>
      <v-row class="mt-5">
        <v-col align="center">
          <v-rating
            v-model="rating"
            background-color="orange lighten-3"
            color="amber"
            medium
          ></v-rating>
          <h5 class="ml-3">Nivel de satisfacción *</h5>
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-col md="6">
          <v-textarea
            label="Comentario"
            auto-grow
            rows="2"
            row-height="10"
            v-model="comentario"
          >
          </v-textarea>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col md="4">
          <v-btn class="primary white--text" @click="enviar" block
            >Enviar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
const url = "http:///localhost:3002/api/v1/";
export default {
  layout: "usuarios",
  beforeMount() {
    this.validarParametro();
  },
  data() {
    return {
      formResenas: true,
      mensaje: "",
      snackbar: false,
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      resenas: [],
      idBuscado: "",
      comentario: "",
      idResena: "",
      rating: null,
    };
  },
  methods: {
    async validarParametro() {
      if (this.$route.params.id) {
        this.idResena = this.$route.params.id
        let { data } = await this.$axios.get(
          url + "satisfaccion_cliente/" + this.$route.params.id
        );
        this.cargarResena(data.info[0]);
      }
    },
    cargarResena(resena) {
      this.rating = resena.nivel_satisfaccion;
      this.comentario = resena.comentario;
    },
    async enviar() {
      if (this.$refs.formResenas.validate() && this.formResenas) {
        const resenas = {
          nivel_satisfaccion: this.rating,
          comentario: this.comentario,
        };
        console.log(this.idResena)
        let { data } = await this.$axios.put(url + "resenas/" + this.idResena, resenas);
        let estado = await this.$axios.put(url + "update_estado_resena/" + this.idResena);
        this.$swal.fire({
          icon: "success",
          title: "Atención",
          text: "La reseña fue registrada con éxito",
        });
        this.$router.push("/usuarios/resenas-pendientes/")
      }
    },
  },
};
</script>
