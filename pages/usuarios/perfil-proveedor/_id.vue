<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Perfil</h1>
      </v-col>
    </v-row>

    <v-form v-model="formPerfil" ref="formPerfil" lazy-validation>
      <v-row>
        <v-col>
          <v-card class="mx-auto" max-width="650">
            <v-card-title class="justify-center success"
              >{{ nombre }} {{ apellido }}</v-card-title
            >
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
                :value="rating"
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
                        <strong
                          >{{ message.from }} {{ message.lastname }}</strong
                        >
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
      <v-row justify="center">
        <v-col sm="2">
          <v-btn color="accent lighten-2" block @click="verCatalogo">
            Ver catálogo
          </v-btn>
        </v-col>
        <v-col sm="2">
          <v-btn color="error lighten-2" block @click="contactarProveedor">
            Contactar
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
const url = "http://localhost:3002/api/v1/";
export default {
  layout: "usuarios",
  beforeMount() {
    this.loadPage();
  },
  data() {
    return {
      nombreBuscado: "Proveedor",
      apellidoBuscado: "De Pruebas",
      formPerfil: true,
      mensaje: "",
      snackbar: false,
      items: [],
      show: false,
      rating: null,
      id_venta: "",
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
      ventas_en_cola: [],
      dia: "",
      mes: "",
      year: "",
      fecha: "",
    };
  },
  methods: {
    loadPage() {
      this.validarParametro();
      this.cargarProveedor();
      this.cargarResena();
      this.imagenesCategorias();
    },
    async validarParametro() {
      if (this.$route.params.id) {
        this.id = this.$route.params.id;
        let { data } = await this.$axios.get(
          url + "proveedor_especifico_id/" + this.$route.params.id
        );
      }
    },
    async cargarProveedor() {
      let { data } = await this.$axios.get(
        `${url}proveedor_especifico_id/${this.id}`
      );
      console.log(data.info);
      this.nombre = data.info[0].nombre;
      this.apellido = data.info[0].apellido;
      this.descripcion = data.info[0].descripcion;
      this.direccion = data.info[0].direccion;
      this.contacto = data.info[0].contacto;
      let categorias = await this.$axios.get(
        `${url}categorias_proveedor/${this.id}`
      );
      this.categorias = categorias.data.info;
    },
    async cargarResena() {
      let { data } = await this.$axios.get(
        `${url}proveedor_especifico_id/${this.id}`
      );
      this.id = data.info[0].id;
      let promedio = await this.$axios.get(`${url}resenas_promedio/${this.id}`);
      this.rating = promedio.data.info[0].promedionivel;
      let infoResena = await this.$axios.get(url + "resenas/" + this.id);
      console.log(infoResena.data.info);
      infoResena.data.info.forEach((element) => {
        let mensaje = {
          from: element.nombre,
          lastname: element.apellido,
          message: element.comentario,
          color: "red accent-1",
        };
        this.messages.push(mensaje);
      });
    },
    async imagenesCategorias() {
      let { data } = await this.$axios.get(
        `${url}proveedor_especifico_id/${this.id}`
      );
      this.id = data.info[0].id;
      let categorias = await this.$axios.get(
        url + "categorias_proveedor/" + this.id
      );
      categorias.data.info.forEach((element) => {
        let imagen = {src: element.ruta_img};
        this.items.push(imagen);
      });
    },
    async contactarProveedor() {
      let proveedor = await this.$axios.get(
        `${url}proveedor_especifico_id/${this.id}`
      );
      this.id = proveedor.data.info[0].id;
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let { data } = await this.$axios.get(url + "auth");
      var hoy = new Date();
      this.dia = hoy.getDate();
      this.mes = hoy.getMonth() + 1;
      this.year = hoy.getFullYear();
      this.fecha = this.dia + "/" + this.mes + "/" + this.year;
      const venta = {
        id_estado: 3,
        id_proveedor: this.id,
        id_usuario: data.info.id,
        fecha: this.fecha,
      };
      this.$axios.post(url + "ventas", venta).then((response) => {
        this.$swal.fire({
          icon: "success",
          title: "Atención",
          text: "Se contactó con el proveedor exitosamente",
        });
      });
    },
    verCatalogo() {
      this.$router.push("/usuarios/catalogo/" + this.id);
    },
  },
};
</script>