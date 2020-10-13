<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>Registro de Ventas</h1>
      </v-col>
    </v-row>

    <v-form v-model="formVentas" ref="formVentas" lazy-validation>
      <v-row>
        <v-col sm="4" v-for="(item, index) in camposGenerales" :key="index">
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            :rules="fieldRequired"
            :type="item.type"
            required
          ></v-text-field>
        </v-col>

        <v-col md="6">
          <v-select
            :items="estado"
            @change="actualizarEstado"
            v-model="estadoSeleccionado"
            label="Seleccione el estado de la venta"
            outlined
           ></v-select> 
        </v-col>

      </v-row>
      <v-row justify="center">
        <v-col md="4">
          <v-btn color="success" @click="enviar" block>Enviar </v-btn>
        </v-col>
      </v-row>
    </v-form>

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
  layout: "proveedores",
  beforeMount() {
    this.cargarVentas();
  },
  data() {
    return {
      formVentas: true,
      mensaje: '',
      snackbar: false,
      estado: ["En progreso", "Finalizada"],
      estadoSeleccionado: null,
      camposGenerales: [
        {
          label: `ID del Cliente`,
          dato: "",
          type: "text",
        },
        {
          label: `Id del Proveedor`,
          dato: "",
          type: "text",
        },
        {
          label: `Fecha de la venta`,
          dato: "",
          type: "text",
        }
      ],
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      ventas: []
    };
  },
  methods: {
    cargarVentas() {
      let url ="http://localhost:3002/ventas";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.ventas = data;
      })
    },
    enviar() {
      let url = "http://localhost:3002/ventas";
      const ventas = {
        idCliente : this.camposGenerales[0].dato,
        idProveedor : this.camposGenerales[1].dato,
        fecha : this.camposGenerales[2].dato,
        estado: this.estadoSeleccionado
      }
      this.$axios.post(url, ventas).then((response) => {
        this.cargarVentas();
        this.mensaje = `La venta fue registrada con éxito`
        this.snackbar = true
        this.limpiarCampos();
      })
      console.log(this.ventas);
    },
    limpiarCampos() {
      this.estadoSeleccionado = "";
      this.camposGenerales.forEach((element) => {
        element.dato = "";  
      });
    } 
  },
};
</script>