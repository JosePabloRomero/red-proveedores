<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Mi perfil</h1>
      </v-col>
    </v-row>

    <v-form v-model="formPerfil" ref="formPerfil" lazy-validation>
      <v-row>
        <v-col>
          <v-card class="mx-auto" max-width="650">
            <v-card-title class="justify-center success">{{ nombre }} {{ apellido }}</v-card-title>
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
            <v-card-title class="justify-center">
              <center>
                <v-chip
                  v-for="(item, index) in categorias"
                  :key="index"
                  class="mr-2"
                  >{{ item.nombre_de_la_categoria }}</v-chip
                >
              </center>
            </v-card-title>
            <v-card-text>
              <h3>Descripción</h3>
              <v-card-subtitle> {{ descripcion }} </v-card-subtitle>
            </v-card-text>
            <v-card-text>
              <h3>Dirección</h3>
              <v-card-subtitle> {{ direccion }} </v-card-subtitle>
            </v-card-text>
            <v-card-text>
              <h3>Contacto</h3>
              <v-card-subtitle> {{ contacto }} </v-card-subtitle>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-card class="mx-auto" width="650">
          <v-img
            height="230"
            src="https://st2.depositphotos.com/4468607/12144/v/450/depositphotos_121449080-stock-illustration-5-gold-star-icon-set.jpg"
          ></v-img>

          <v-card-title>Calificación del proveedor</v-card-title>

          <v-card-text>
            <v-row align="center" class="mx-0">
              <v-rating
                :value= "rating"
                color="amber"
                dense
                half-increments
                readonly
                size="14"
              ></v-rating>

              <div class="grey--text ml-4">{{ rating }}</div>
            </v-row>
          </v-card-text>

          <v-divider class="mx-4"></v-divider>

          <v-card-actions>
            <v-btn color="orange lighten-2" text> Ver comentarios </v-btn>

            <v-spacer></v-spacer>

            <v-btn icon @click="show = !show">
              <v-icon>{{
                show ? "mdi-chevron-up" : "mdi-chevron-down"
              }}</v-icon>
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div v-show="show">
              <v-divider></v-divider>
              <v-card-text>
                <v-timeline align-top dense>
                  <v-timeline-item
                    v-for="message in messages"
                    :key="message.time"
                    :color="message.color"
                    small
                  >
                    <div>
                      <div class="font-weight-normal">
                        <strong>{{ message.from }} {{message.lastname}}</strong>
                      </div>
                      <div>{{ message.message }}</div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
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
      items: [],
      show: false,
      rating: null,
      id: "",
      nombre: "",
      apellido: "",
      descripcion: "",
      contacto: "",
      direccion: "",
      show: false,
      nombreCategoria: "",
      categorias: [],
      messages: [],
    };
  },
  methods: {
    loadPage() {
      this.cargarProveedor();
      this.cargarResena();
      this.imagenesCategorias();
    },
    async cargarProveedor() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let id = await this.$axios.get(url + "auth");
      this.id = id.data.info.id;
      this.nombre = id.data.info.nombre;
      this.apellido = id.data.info.apellido;
      this.descripcion = id.data.info.descripcion;
      this.direccion = id.data.info.direccion;
      this.contacto = id.data.info.contacto;
      let categorias = await this.$axios.get(
        url + "categorias_proveedor/" + this.id
      );
      this.categorias = categorias.data.info;
    },
    async cargarResena() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let id = await this.$axios.get(url + "auth");
      this.id = id.data.info.id;
      let { data } = await this.$axios.get(url + "resenas_promedio/" + this.id);
      this.rating = data.info[0].promedionivel;
      let infoResena = await this.$axios.get(url + "resenas/" + this.id);
      infoResena.data.info.forEach((element) => {
        let mensaje = {
          from: element.nombre,
          lastname: element.apellido,
          message: element.comentario,
          color: "red accent-1",
        };
        this.messages.push(mensaje)
      });
    },
    async imagenesCategorias() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let id = await this.$axios.get(url + "auth");
      this.id = id.data.info.id;
      let categorias = await this.$axios.get(
        url + "categorias_proveedor/" + this.id);
      this.nombreCategoria = categorias.data.info.nombre;
      if (this.nombreCategoria = "Lácteos") {
        let imagenes = {
          src: "https://cdn.pixabay.com/photo/2016/05/11/11/20/milk-1385548_960_720.jpg"
        }
        this.items.push(imagenes)
      }
      if (this.nombreCategoria = "Insumos Agrícolas") {
        let imagenes = {
          src: "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        }
        this.items.push(imagenes)
      }
    }
  },
};
</script>
