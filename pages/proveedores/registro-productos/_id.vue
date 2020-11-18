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
            :required="item.required"
            v-if="item.visible"
            :disabled="item.disabled"
          ></v-text-field>
        </v-col>
        <v-col sm="6">
          <v-select
            v-model="categorias_seleccionadas"
            :items="categorias"
            :menu-props="{ maxHeight: '400' }"
            item-value="id"
            item-text="nombre"
            label="Categorias"
            multiple
            required
            hint="Seleccione las categorías a las que pertenece el producto"
            persistent-hint
          ></v-select>
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
          <v-btn
            class="black--text success"
            block
            v-if="!editing"
            @click="enviar"
            >Enviar
          </v-btn>
          <v-btn
            class="black--text success"
            @click="editarProductos"
            block
            v-if="editing"
            >Editar
          </v-btn>
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
        <v-icon small class="mr-2" @click="loadProduct(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteProduct(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import catalogo from "../catalogo.vue";
const url = "http:///localhost:3002/api/v1/";
export default {
  components: { catalogo },
  layout: "proveedores",
  async beforeMount() {
    this.validarParametro();
    this.cargarProductos();
    await this.cargarCategorias();
  },
  data() {
    return {
      formProducts: null,
      mensaje: "",
      snackbar: false,
      headers: [
        { text: "Identificación", value: "id" },
        { text: "Nombre", value: "nombre" },
        { text: "Categorias", value: "categorias" },
        { text: "Precio", value: "precio" },
        { text: "Actions", value: "actions" },
      ],
      camposGenerales: [
        {
          label: `ID del producto`,
          dato: "",
          type: "text",
          disabled: true,
          visible: false,
          required: false,
          
        },
        {
          label: `Nombre del producto`,
          dato: "",
          type: "text",
          disabled: false,
          visible: true,
          required: true,          
        },
        {
          label: `Precio del producto`,
          dato: "",
          type: "number",
          disabled: false,
          visible: true,
          required: true,          
        },
      ],
      categorias: [],
      categorias_seleccionadas: [],
      id_proveedor: null,
      id_catalogo: null,
      id_producto: null,
      descripcion: null,
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      productos: [],
      editing: false,
    };
  },
  methods: {
    async validarParametro() {
      if (this.$route.params.id) {
        let { data } = await this.$axios.get(
          url + "productos/" + this.$route.params.id
        );
        this.loadProduct(data.info[0]);
      }
    },
    async cargarCategorias() {
      let { data } = await this.$axios.get(url + "categorias/");
      this.categorias = data.info;
    },
    async cargarProductos() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let proveedor = await this.$axios.get(url + "auth");
      this.id_proveedor = proveedor.data.info.id;
      let { data } = await this.$axios.get(
        url + "productos_por_proveedor/" + this.id_proveedor
      );
      this.id_catalogo = data.info[0].id_catalogo;     
      for (let index = 0; index < data.info.length; index++) {
        let producto = {
          id: data.info[index].id,
          nombre: data.info[index].nombre,
          descripcion: data.info[index].descripcion,
          precio: data.info[index].precio,
          categorias: await this.obtenerCategoriasProductoString(
            data.info[index].id
          ),
        };
        this.productos.push(producto);
      }
    },
    async obtenerCategoriasProductoString(id_producto) {
      let { data } = await this.$axios.get(
        url + "categorias_por_producto/" + id_producto
      );
      let string = "";
      data.info.forEach((element) => {
        string += element.categoria + ", ";
      });
      string = string.substring(0, string.length - 2);
      return string;
    },
    async obtenerCategoriasProducto(id_producto) {
      let { data } = await this.$axios.get(
        url + "categorias_por_producto/" + id_producto
      );
      this.categorias_seleccionadas = [];
      data.info.forEach((element) => {
        this.categorias_seleccionadas.push(element.id);
      });
    },
    loadProduct(product) {
      this.camposGenerales[0].dato = product.id;
      this.camposGenerales[0].visible = true;
      this.camposGenerales[1].dato = product.nombre;
      this.camposGenerales[2].dato = product.precio;
      this.descripcion = product.descripcion;           
      this.obtenerCategoriasProducto(product.id);
      this.editing = true;
      this.camposGenerales[0].disabled = true;
      /* this.product = Object.assign({}, product);
      this.editing = true; */
    },
    async agregarCategorias(id_producto) {
      let { data } = await this.$axios.get(
        url + "categorias_por_producto/" + id_producto
      );
      //Combinamos las categorias del select, con las obtenidas en la consulta
      let categoriasSeleccionadas = [];
      for (
        let index = 0;
        index < this.categorias_seleccionadas.length;
        index++
      ) {
        let categoria = {
          id: this.categorias_seleccionadas[index],
        };
        categoriasSeleccionadas.push(categoria);
      }
      let categoriasSobrantes = [];
      let categoriasBase = [];
      for (let index = 0; index < data.info.length; index++) {
        let existIndex = categoriasSeleccionadas.findIndex(
          (x) => x.id == data.info[index].id
        );
        let categoria = {
          id: data.info[index].id,
        };
        if (existIndex < 0) {
          categoriasSobrantes.push(categoria);
        }
        categoriasBase.push(categoria);
      }
      let categoriasCombinadas = [
        ...categoriasSeleccionadas,
        ...categoriasSobrantes,
      ];
      for (let index = 0; index < categoriasCombinadas.length; index++) {
        let existIndex = categoriasSeleccionadas.findIndex(
          (x) => x.id == categoriasCombinadas[index].id
        );
        if (existIndex > -1) {
          let existIndex2 = categoriasBase.findIndex(
            (x) => x.id == categoriasCombinadas[index].id
          );
          if (existIndex2 < 0) {
            let categoriaNueva = {
              id_categoria: categoriasCombinadas[index].id,
              id_producto: id_producto,
            };
            this.$axios.post(url + "categorias_productos", categoriaNueva);
          }
        } else {
          this.$axios.delete(
            url +
              "categorias_productos/?id_categoria=" +
              categoriasCombinadas[index].id +
              "&id_producto=" +
              id_producto
          );
        }
      }
    },
    async editarProductos() {
      if (this.$refs.formProducts.validate() && this.formProducts) {
        let existIndex = this.productos.findIndex(
          (x) => x.id == this.camposGenerales[0].dato
        );
        if (existIndex > -1) {
          let product = {
            nombre: this.camposGenerales[1].dato,
            precio: this.camposGenerales[2].dato,
            id_catalogo: this.id_catalogo,
            descripcion: this.descripcion,
          };
          console.log(product)
          this.$axios
            .put(url + "productos/" + this.camposGenerales[0].dato, product)
            .then((response) => {
              this.editing = false;
              this.$swal.fire(
                "Modificado.",
                "El producto ha sido modificado correctamente.!",
                "success"
              );
            })
            .catch((error) => {
              this.$swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al modificar el producto",
              });
              console.log(error);
            });

          await this.agregarCategorias(this.camposGenerales[0].dato);
          this.limpiarCampos();
          this.cargarProductos();
        } else {
          this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El producto NO existe en la tabla.",
          });
        }
        this.camposGenerales[0].visible = false;
      }
    },
    limpiarCampos() {
      this.estadoSeleccionado = "";
      this.productos = [];
      this.categorias_seleccionadas = null;
      this.camposGenerales.forEach((element) => {
        element.dato = "";
      });
      this.descripcion = "";
    },
    async enviar() {
      if (this.$refs.formProducts.validate() && this.formProducts) {
        let product = {
          nombre: this.camposGenerales[1].dato,
          precio: this.camposGenerales[2].dato,
          descripcion: this.descripcion,
          id_catalogo: this.id_catalogo,
        };
        let { data } = await this.$axios.post(url + "productos", product);
        await this.agregarCategoriasNuevas(data.info[0].id);
        this.limpiarCampos();
        this.cargarProductos();
        this.mensaje = `El producto fue registrado con éxito`;
        this.snackbar = true;
      }
    },
    agregarCategoriasNuevas(id_producto) {
      for (
        let index = 0;
        index < this.categorias_seleccionadas.length;
        index++
      ) {
        let categoriaNueva = {
          id_categoria: this.categorias_seleccionadas[index],
          id_producto: id_producto,
        };
        this.$axios.post(url + "categorias_productos", categoriaNueva);
      }
    },
    deleteProduct(producto) {
      let existIndex = this.productos.findIndex(
        (x) => x.id == producto.id
      );
      if (existIndex > -1) {
        this.$swal
          .fire({
            title: "Desea eliminar el producto?",
            text: "Este cambio no se puede revertir.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminalo!",
            cancelButtonText: "Cancelar",
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.$axios
                .delete(url + "productos/" + producto.id)
                .then((response) => {                  
                  this.$swal.fire(
                    "Eliminado.",
                    "El producto ha sido eliminado correctamente.!",
                    "success"
                  );
                })                
                this.limpiarCampos();
                this.cargarProductos();
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
  }
};
</script>