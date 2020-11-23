<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Registro de categorías</h1>
      </v-col>
    </v-row>

    <v-form v-model="formCategorias" ref="formCategorias" lazy-validation>
      <v-row>
        <v-col md="6">
          <v-textarea
            label="Nombre de la categoría"
            filled
            auto-grow
            rows="2"
            row-height="30"
            :rules="fieldRequired"
            required
            v-model="nombre"
          >
          </v-textarea>
        </v-col>
        <v-col md="6">
          <v-textarea
            label="Ruta de la imagen asociada"
            filled
            auto-grow
            rows="2"
            row-height="30"
            :rules="fieldRequired"
            required
            v-model="ruta"
          >
          </v-textarea>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-row justify="center">
          <v-col md="4">
            <v-btn
              class="black--text success"
              block
              v-if="!editing"
              @click="enviar"
              >Enviar
            </v-btn>
            <v-btn
              class="black--text success"
              @click="actualizarCategoria"
              block
              v-if="editing"
              >Editar
            </v-btn>
          </v-col>
        </v-row>
      </v-row>
    </v-form>
    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
    <v-data-table
      :headers="headers"
      :items="categorias"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="loadCategoria(item)"> mdi-pencil </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
const url = "http:///localhost:3002/api/v1/";
export default {
  layout: "administradores",
  beforeMount() {
    this.cargarCategorias();
  },
  data() {
    return {
      formCategorias: true,
      headers: [
        { text: "Nombre categoría", value: "nombre" },
        { text: "Ruta imagen", value: "ruta_img" },
        { text: "Acciones", value: "actions" },
      ],
      mensaje: "",
      snackbar: false,
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      id: "",
      nombre: "",
      ruta: "",
      categorias: [],
      editing: false,
    };
  },
  methods: {
    async cargarCategorias() {
      let { data } = await this.$axios.get(url + "categorias");
      this.categorias = data.info;
    },
    async enviar() {
      if (this.$refs.formCategorias.validate() && this.formCategorias) {
        try {
          let categoria = {
            nombre: this.nombre,
            ruta_img: this.ruta,
          };
          this.$axios.post(url + "categorias", categoria);
          this.limpiarCampos();
          await this.cargarCategorias();
          this.$swal.fire({
            icon: "success",
            title: "Atención",
            text: `La categoría se agregó exitosamente`,
          });
        } catch (error) {
          this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Error al agregar la categoría`,
          });
        }
      }
    },
    loadCategoria(categoria) {
      this.id = categoria.id;
      this.nombre = categoria.nombre;
      this.ruta = categoria.ruta_img;
      this.editing = true;
    },
    limpiarCampos() {
      (this.nombre = ""), (this.ruta = "");
    },
    async actualizarCategoria() {
      if (this.$refs.formCategorias.validate() && this.formCategorias) {
        let existIndex = this.categorias.findIndex((x) => x.id == this.id);
        if (existIndex > -1) {
          let categoria = {
            nombre: this.nombre,
            ruta_img: this.ruta,
          };
          this.$axios
            .put(url + "categorias/" + this.id, categoria)
            .then((response) => {
              this.editing = false;
              this.$swal.fire(
                "Modificado.",
                "La categoría ha sido modificada correctamente.!",
                "success"
              );
            })
            .catch((error) => {
              this.$swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al modificar la categoría",
              });
              console.log(error);
            });
          this.limpiarCampos();
          await this.cargarCategorias();
        } else {
          this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: "La categoría NO existe en la tabla.",
          });
        }
      }
    },
  },
};
</script>