<template>
  <v-container>
    <h1 v-if="usuario">Bienvenido {{usuario[0].nombre}} </h1>
  </v-container>
</template>
<script>
export default {
  layout: "usuarios",  
  beforeMount() {
    this.obtenerUsuario();
  },
  data() {
    return {
      //Como puedo usar los datos recolectados aqui?
      usuario: undefined,
    };
  },
  methods: {
    obtenerUsuario() {
      let url = "http://localhost:3002/usuario-ingresado";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.usuario = data;
      });
    },
  },
};
</script>
