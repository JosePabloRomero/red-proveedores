<template>
  <v-container v-if="usuario">
    <h1>Bienvenido {{ usuario[0].nombre }}</h1>
  </v-container>
</template>
<script>
export default {
  layout: "usuarios",
  beforeMount() {
    let url = "http://localhost:3002/usuario-ingresado";
    this.$axios.get(url).then((response) => {
      let data = response.data;
      this.usuario = data;
    });
  },
  data() {
    return {
      //Como puedo usar los datos recolectados aqui?
      usuario: [{nombre: 'usuario'}],
    };
  }
};
</script>
