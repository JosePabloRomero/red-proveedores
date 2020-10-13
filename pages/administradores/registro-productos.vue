<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>Formulario Registro de Productos</h1>
      </v-col>
    </v-row>

    <v-form v-model="formProducts" ref="formProducts">
      <v-row>
        <v-col sm="4" v-for="(item, index) in camposGenerales" :key="index">
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            :rules="fieldRequired"
            :type="item.type"
            required
          ></v-text-field>
        </v-col>

        <v-col md="6">
          <v-textarea
            label="Descripción"
            auto-grow
            rows="2"
            row-height="10"
            :rules="fieldRequired"
            required
            v-model="descripcion"
          >
          </v-textarea>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col md="4">
          <v-btn color="success" @click="enviar" block>Enviar </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}     
        <v-btn color="pink" text @click="snackbar = false">
          Cerrar
        </v-btn>     
    </v-snackbar>

  </v-container>
</template>

<script>
export default {
  beforeMount() {
    this.cargarProductos();
  },
  data() {
    return {
      formProducts: null,
      mensaje: '',
      snackbar: false,
      camposGenerales: [
        {
          label: `ID del producto`,
          dato: "",
          type: "text",
        },
        {
          label: `Nombre del producto`,
          dato: "",
          type: "text",
        },
        {
          label: `Categoria del producto`,
          dato: "",
          type: "text",
        },
        {
          label: `Precio del producto`,
          dato: "",
          type: "text",
        }
      ],
      descripcion: null,
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      productos: []
    };
  },
  methods: {
    cargarProductos() {
      let url ="http://localhost:3002/productos";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.productos = data;
      })
    },
    enviar() {
      let url = "http://localhost:3002/productos";
      const products = {
        id : this.camposGenerales[0].dato,
        nombre : this.camposGenerales[1].dato,
        categoria : this.camposGenerales[2].dato,
        precio : this.camposGenerales[3].dato,
        descripcion : this.descripcion
      }
      this.$axios.post(url, products).then((response) => {
        this.cargarProductos();
        this.mensaje = `El producto fue registrado con éxito`
        this.snackbar = true
      })
      console.log(this.productos);
    } 
  },
};
</script>