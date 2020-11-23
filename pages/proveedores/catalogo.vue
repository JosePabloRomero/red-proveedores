<template>
  <v-container>
    <v-row justify="center">
      <v-col sm="12">
        <h1>Mi catálogo de productos</h1>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="nuevoCatalogo">
      <v-col sm="8">
        <h3>
          Parece que aún no tienes un catálogo...
          <v-btn color="error lighten-2" text @click="crearCatalogo()">
            Crear mi catálogo
          </v-btn>
        </h3>
      </v-col>
      
    </v-row>
    <v-row>
      <v-col sm="4" v-for="(producto, index) in catalogo" :key="index">
        <v-card class="mx-auto" max-width="344" outlined>
          <v-card-title class="justify-center success">{{
            producto.nombre
          }}</v-card-title>
          <v-card-text>
            <h3 class="my-2">Precio</h3>
            <v-card-subtitle>$ {{ producto.precio }}</v-card-subtitle>
            <h3>Categorias</h3>
            <v-card-subtitle>
              <v-chip
                v-for="(item, index) in producto.categorias"
                :key="index"
                class="mr-2 my-2"
                >{{ item.categoria }}</v-chip
              >
            </v-card-subtitle>
            <h3>Descripcion</h3>
            <v-card-subtitle>
              {{ producto.descripcion }}
            </v-card-subtitle>
          </v-card-text>
          <v-divider class="mx-4"></v-divider>
          <v-card-actions class="justify-center">
            <v-btn
              color="accent lighten-2"
              text
              @click="editarProducto(producto.id)"
            >
              Editar
            </v-btn>
            <v-btn
              color="error lighten-2"
              text
              @click="eliminarProducto(producto.id)"
            >
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
const url = "http:///localhost:3002/api/v1/";
export default {
  layout: "proveedores",
  beforeMount() {
    this.comprobarCatalogo();
  },
  data() {
    return {
      catalogo: [],
      id_proveedor: null,
      foobar: null,
      nuevoCatalogo: false,
    };
  },
  methods: {
    async comprobarCatalogo() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let proveedor = await this.$axios.get(url + "auth");
      this.id_proveedor = proveedor.data.info.id;
      let {data} = await this.$axios.get(url + "catalogos/" + this.id_proveedor);
      if(data.metainfo.total > 0){
        this.nuevoCatalogo = false
        await this.cargarCatalogo()
      } else {
        this.nuevoCatalogo = true
      }
    },
    async cargarCatalogo() {
      this.catalogo = [];      
      let { data } = await this.$axios.get(
        url + "productos_por_proveedor/" + this.id_proveedor
      );
      for (let index = 0; index < data.info.length; index++) {
        let producto = {
          id: data.info[index].id,
          nombre: data.info[index].nombre,
          descripcion: data.info[index].descripcion,
          precio: data.info[index].precio,
          categorias: await this.obtenerCategoriasProducto(data.info[index].id),
        };
        this.catalogo.push(producto);
      }
    },
    async crearCatalogo() {
      let catalogo = {
        id_proveedor: this.id_proveedor
      }
      let { data } = await this.$axios.post(
        url + "catalogos/",
        catalogo
      );
      this.$swal.fire(
        "Creado",
         `El catálogo fue creado con exito. Serás redirigido al módulo de productos!`,
          "success"
      );
      this.$router.push('/proveedores/registro-productos/');
    },
    async obtenerCategoriasProducto(id_producto) {
      let { data } = await this.$axios.get(
        url + "categorias_por_producto/" + id_producto
      );
      return data.info;
    },
    editarProducto(id_producto) {
      this.foobar = id_producto;
      this.$router.push("/proveedores/registro-productos/" + id_producto);
    },
    eliminarProducto(id_producto) {
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
              .delete(url + "productos/" + id_producto)
              .then((response) => {
                this.$swal.fire(
                  "Eliminado.",
                  "El producto ha sido eliminado correctamente.!",
                  "success"
                );
              });
            this.cargarCatalogo();
          }
        });
    },
  },
};
</script>