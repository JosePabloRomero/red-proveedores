<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>Mi perfil</h1>
      </v-col>
    </v-row>

    <v-form v-model="formPerfil" ref="formPerfil" lazy-validation>
      <v-row>
        <v-col>
          <v-card class="mx-auto" max-width="700">
            <v-card-title>{{nombre}} {{apellido}}</v-card-title>
            <v-img>
              <v-carousel>
                <v-carousel-item
                  v-for="(item, i) in items"
                  :key="i"
                  :src="item.src"
                  reverse-transition="fade-transition"
                  transition="fade-transition"
                ></v-carousel-item>
              </v-carousel>
            </v-img>
            <v-card-title>
                <center class="mt-6">
                    <v-chip v-for="(item, index) in categorias" :key="index" class="mr-2">{{item.nombre_de_la_categoria}}</v-chip>
                </center>               
            </v-card-title>
            <v-card-text>
              <h3> Descripción </h3>
              <v-card-subtitle> {{descripcion}} </v-card-subtitle>
            </v-card-text>
            <v-card-text>
              <h3> Dirección </h3>
              <v-card-subtitle> {{direccion}} </v-card-subtitle>
            </v-card-text>
            <v-card-text>
              <h3> Contacto </h3>
              <v-card-subtitle> {{contacto}} </v-card-subtitle>
            </v-card-text>

          </v-card>
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
  layout: "proveedores",
  beforeMount() {
    this.loadPage();
  },
  data() {
    return {
      formPerfil: true,
      mensaje: "",
      snackbar: false,
      items: [
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/sky.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/bird.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/planet.jpg",
        },
      ],
      id: "",
      nombre: "",
      apellido: "",
      descripcion: "",
      contacto: "",
      direccion: "",
      show: false,
      categorias: []
    };
  },
  methods: {
    loadPage() {
      this.cargarProveedor();
    },
    async cargarProveedor() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let { data } = await this.$axios.get(url + "auth");
      this.id = data.info.id;
      this.nombre = data.info.nombre;
      this.apellido = data.info.apellido;
      this.descripcion = data.info.descripcion;
      this.direccion = data.info.direccion;
      this.contacto = data.info.contacto;
      let categorias = await this.$axios.get(url + "categorias_proveedor/" + "4")
      this.categorias = categorias.data.info;
      console.log(this.categorias)
    },
  },
};
</script>
