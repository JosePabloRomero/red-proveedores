<template>
  <v-container>
    <h1>Catálogo de productos de {{nombre_proveedor}} {{apellido_proveedor}}</h1>
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
const url = "http:///localhost:3002/api/v1/";
export default {
  layout: "usuarios",
  beforeMount() {
    this.validarParametro();
    this.cargarCatalogo();
    this.infoProveedor();
  },
  data() {
    return {
      catalogo: [],
      nombre_proveedor: "",
      apellido_proveedor: "",
      id_proveedor: "",
      foobar: null,
    };
  },
  methods: {
    async validarParametro() {
      if (this.$route.params.id) {
        this.id_proveedor = this.$route.params.id;        
      }
    },
    async infoProveedor() {
      let { data } = await this.$axios.get(
        url + "proveedor_especifico_id/" + this.id_proveedor
      );
      console.log(data.info)
      this.nombre_proveedor = data.info[0].nombre;
      this.apellido_proveedor = data.info[0].apellido;
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
    async obtenerCategoriasProducto(id_producto) {
      let { data } = await this.$axios.get(
        url + "categorias_por_producto/" + id_producto
      );
      return data.info;
    },
  },
};
</script>