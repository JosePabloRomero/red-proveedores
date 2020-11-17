<template>
  <v-container>
    <h1>Mi catálogo de productos</h1>
    <v-row>
      <v-col sm="4" v-for="(item, index) in catalogo" :key="index">
        <v-card class="mx-auto" max-width="344" outlined>
          <v-card-title>{{item.nombre}}</v-card-title>
          <v-card-text>
            <div class="my-4 subtitle-1">$ {{item.precio}}</div>
            <div class="my-4 subtitle-1">Categorías</div>
            <div>
              {{item.descripcion}}
            </div>
          </v-card-text>
          <v-divider class="mx-4"></v-divider>
          <v-card-actions>
            <v-btn color="accent lighten-2" text> Editar </v-btn>
            <v-btn color="error lighten-2" text> Eliminar </v-btn>
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
      this.cargarCatalogo()
  },
  data() {
      return {
          catalogo: [],
          id_proveedor: null
      }
  },
  methods: {
      async cargarCatalogo() {
        let token = localStorage.getItem("token");
        this.$axios.setToken(token, "Bearer");
        let proveedor = await this.$axios.get(url + "auth");      
        this.id_proveedor = proveedor.data.info.id;
        let {data}= await this.$axios.get(url + "productos_por_proveedor/" + this.id_proveedor);
        data.info.forEach((element) => {
            let producto = {
                id: element.id,
                nombre: element.nombre,
                descripcion: element.descripcion,
                precio: element.precio,
            }
            this.catalogo.push(producto)
        }); 
      }
  }
};
</script>