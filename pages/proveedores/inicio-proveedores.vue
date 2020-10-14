<template>
  <v-container v-if="usuario">
    <h1>Bienvenido {{usuario[0].nombre}} </h1>
  </v-container>
</template>
<script>
export default {
  layout: "proveedores",  
  beforeMount() {
     let url = "http://localhost:3002/usuario-ingresado";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.usuario = data;
      }).catch(error => {
        console.log(error)
      })
  },
  data() {
    return {      
       usuario: [{nombre: 'proveedor'}]
    };
  },
};
</script>