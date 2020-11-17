<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
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
            :disabled="item.disabled"
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
          <v-btn class="black--text success" @click="enviar" block v-if="!editing">Enviar </v-btn>
          <v-btn class="black--text success" @click="editarProductos" block v-if="editing">Editar </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-data-table
      :headers="headers"
      :items="productos"
      :items-per-page="5"
      class="elevation-1"
    >
    <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="loadProduct(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteProduct(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>

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
  layout: 'proveedores',
  beforeMount() {
    this.cargarProductos();
  },
  data() {
    return {
      formProducts: null,
      mensaje: '',
      snackbar: false,
      headers: [
        {text: "Identificación", value: "id"},
        {text: "Nombre", value: "nombre"},
        {text: "Categoria", value: "categoria"},
        {text: "Precio", value: "precio"},
        { text: "Actions", value: "actions" },
      ],
      camposGenerales: [
        {
          label: `ID del producto`,
          dato: "",
          type: "text",
          disabled: false,
        },
        {
          label: `Nombre del producto`,
          dato: "",
          type: "text",
          disabled: false,
        },
        {
          label: `Categoria del producto`,
          dato: "",
          type: "text",
          disabled: false,
        },
        {
          label: `Precio del producto`,
          dato: "",
          type: "text",
          disabled: false,
        }
      ],
      descripcion: null,
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      productos: [],
      editing : false,
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
    loadProduct(product) {
      this.camposGenerales[0].dato = product.id;
      this.camposGenerales[1].dato = product.nombre;
      this.camposGenerales[2].dato = product.categoria;
      this.camposGenerales[3].dato = product.precio;
      this.descripcion = product.descripcion;
      this.editing = true;
      this.camposGenerales[0].disabled = true;
      /* this.product = Object.assign({}, product);
      this.editing = true; */
    },
    loadProducts() {
      let url = "http://localhost:3002/productos/";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.productos = data;
      });
    },
    editarProductos() {
      if (this.$refs.formProducts.validate() && this.formProducts) {
        let existIndex = this.productos.findIndex((x) => x.id == this.camposGenerales[0].dato);
        if(existIndex > -1) {
          let url = "http://localhost:3002/productos/" + this.camposGenerales[0].dato;
          let product = {
            id : this.camposGenerales[0].dato,
            nombre: this.camposGenerales[1].dato,
            categoria: this.camposGenerales[2].dato,
            precio: this.camposGenerales[3].dato,
            descripcion: this.descripcion,
          }
          console.log(url);
          console.log(product);
          this.$axios.put(url, product).then((response) => {
            this.editing = false;
            this.$swal.fire(
              "Modificado.",
              "El producto ha sido modificada correctamente.!",
              "success"
            );
            this.loadProducts();
          });
        } else {
            this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El producto NO existe en la tabla.",
          });
        }
        this.camposGenerales[0].disabled = false;
        this.limpiarCampos();
      }
    },
    enviar() {
      let url = "http://localhost:3002/productos/";
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
      this.limpiarCampos();
    },
    limpiarCampos() {
      this.estadoSeleccionado = "";
      this.camposGenerales.forEach((element) => {
        element.dato = "";
          
      });
      this.descripcion = "";
    },
    deleteProduct(producto) {
      let existIndex = this.productos.findIndex((x) => x.id == producto.id);
      if (existIndex > -1) {
        this.$swal
          .fire({
            title: "Desea eliminar el producto?",
            text: "Este cambio no se puede revertir.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminar",
            cancelButtonText: "Cancelar",
          })
          .then((result) => {
            if (result.value) {
              let url = "http://localhost:3002/productos/" + producto.id;
              this.$axios.delete(url).then((response) => {
                this.$swal.fire(
                  "Eliminado.",
                  "El producto ha sido eliminada correctamente.!",
                  "success"
                );
                this.cargarProductos();
              });
            }
          });
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El producto NO existe en la tabla.",
        });
      }
    },
  },
};
</script>