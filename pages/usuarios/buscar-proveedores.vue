<template>
  <v-container>
    <v-row justify="center">
      <v-col sm="4">
        <v-select
          v-model="filtrado_seleccionado"
          :items="categorias_filtrado"
          :menu-props="{ maxHeight: '400' }"
          item-value="id"
          item-text="nombre"
          label="Filtrar *"
          outlined
          hint="Seleccione la opción de filtrado"
          persistent-hint
        >
          <template v-slot:prepend>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
              </template>
              Selecciona el metodo por el cual quieres buscar un proveedor
            </v-tooltip>
          </template>
        </v-select>
      </v-col>
      <v-col sm="1">
        <v-btn class="mx-2" fab dark small color="primary" @click="buscar()">
          <v-icon dark> mdi-account-search </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" sm="6" v-if="filtrado_seleccionado == 1">
        <v-text-field
          v-model="nombre_buscado"
          outlined
          clearable
          label="Nombre del proveedor *"
          type="text"
        >
          <template v-slot:prepend>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
              </template>
              Ingresa el nombre con el que el proveedor está registrado
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" sm="6" v-if="filtrado_seleccionado == 1">
        <v-text-field
          v-model="apellido_buscado"
          outlined
          clearable
          label="Apellido del proveedor *"
          type="text"
        >
          <template v-slot:prepend>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
              </template>
              Aquí puedes buscar un proveedor por su nombre completo
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" sm="6" v-if="filtrado_seleccionado == 2">
        <v-select
          v-model="categoria_seleccionada"
          :items="categorias"
          :menu-props="{ maxHeight: '400' }"
          item-value="id"
          item-text="nombre"
          label="Categoria Buscada *"
          outlined
        >
          <template v-slot:prepend>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
              </template>
              Selecciona la categoria a la cual pertenece el proveedor para
              buscarlo
            </v-tooltip>
          </template>
        </v-select>
      </v-col>
    </v-row>

    <v-row v-if="buscar_proveedor">
      <v-col sm="4" v-for="(proveedor, index) in proveedores_procesados" :key="index">
        <v-card class="mx-auto" max-width="344" outlined>
          <v-card-title class="justify-center success">
            {{proveedor.nombre}} {{proveedor.apellido}}
            </v-card-title>
          <v-card-text>
            <h3 class="my-2">Direccion</h3>
            <v-card-subtitle>{{ proveedor.direccion }}</v-card-subtitle>
            <h3>Categorias</h3>
            <v-card-subtitle>
              <v-chip
                v-for="(item, index) in proveedor.categorias"
                :key="index"
                class="mr-2 my-2"
                >{{ item.nombre_de_la_categoria }}</v-chip
              >
            </v-card-subtitle>           
          </v-card-text>
          <v-divider class="mx-4"></v-divider>
          <v-card-actions class="justify-center">
            <v-btn
              color="accent lighten-2"
              text
              @click="contactarProveedor(proveedor.id)"
            >
              Contactar
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
  layout: "usuarios",
  async beforeMount() {
    await this.cargarCategorias();
  },
  data: () => ({
    nombre_buscado: "",
    apellido_buscado: "",
    categorias_filtrado: [
      { nombre: "Filtrar por Nombre completo", id: 1 },
      { nombre: "Filtrar por categoría", id: 2 },
    ],
    categorias: null,
    categoria_seleccionada: null,
    filtrado_seleccionado: null,
    buscar_proveedor: false,
    proveedores: [],
    proveedores_procesados: []
  }),
  methods: {
    async cargarCategorias() {
      let { data } = await this.$axios.get(url + "categorias/");
      this.categorias = data.info;
    },
    async buscar() {
      if(this.filtrado_seleccionado !== null) {
        switch (this.filtrado_seleccionado) {
          case 1:
            let proveedores_especificos = await this.$axios.get(`${url}proveedor_especifico/?nombre=${this.nombre_buscado}&apellido=${this.apellido_buscado}`);
            this.proveedores = proveedores_especificos.data.info
            this.buscar_proveedor = true
          break;
          case 2:
            let proveedores_categoria = await this.$axios.get(url + "proveedores_categoria/" + this.categoria_seleccionada);
            this.proveedores = proveedores_categoria.data.info
            this.buscar_proveedor = true
          break;      
          default:
          break;
        }
        for (let index = 0; index < this.proveedores.length; index++) {
        let proveedor = {
          id: this.proveedores[index].id,
          nombre: this.proveedores[index].nombre,
          apellido: this.proveedores[index].apellido,
          direccion: this.proveedores[index].direccion,
          categorias: await this.obtenerCategoriasProveedor(this.proveedores[index].id),
        };
        this.proveedores_procesados.push(proveedor);        
      }
      } 
    },   
    async obtenerCategoriasProveedor(id_proveedor) {
      let { data } = await this.$axios.get(
        url + "categorias_proveedor/" + id_proveedor
      );
      return data.info;
    },
    contactarProveedor(id_proveedor) {      
      this.$router.push("/usuarios/perfil-proveedor/" + id_proveedor);
    } 
    
  },
};
</script>
