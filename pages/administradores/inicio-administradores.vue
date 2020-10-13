<template>
  <v-container v-if="usuario">
    <h1>Bienvenido al modulo de administración {{usuario[0].nombre}} </h1>
  </v-container>
</template>
<script>
export default {
  layout: "administradores",  
  beforeMount() {
    let url = "http://localhost:3002/usuario-ingresado";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.usuario = data;
      });
  },
  data() {
    return {      
      usuario: [{nombre: 'admin'}],
    };
  }
};
</script>