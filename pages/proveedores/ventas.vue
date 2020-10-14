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

    <v-data-table
      :headers="headers"
      :items="ventas"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="deleteVenta(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

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
      headers: [
        { text: "Id de la Venta", value: "id" },
        { text: "Id del Cliente", value: "idCliente" },
        { text: "Id del Proveedor", value: "idProveedor" },
        { text: "Fecha", value: "fecha" },
        { text: "Estado", value: "estado" },
        { text: "Acciones", value: "actions" }
      ],
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
    },
    limpiarCampos() {
      this.estadoSeleccionado = "";
      this.camposGenerales.forEach((element) => {
        element.dato = "";  
      });
    },
    loadVenta(venta) {
      this.venta = Object.assign({}, venta);
    }, 
    deleteVenta(venta) {
      let existIndex = this.ventas.findIndex((x) => x.id == venta.id);
      if (existIndex > -1) {
        this.$swal
          .fire({
            title: "¿Desea eliminar la venta?",
            text: "Este cambio no se puede revertir.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar.",
            cancelButtonText: "Cancelar",
          })
          .then((result) => {
            if (result.value) {
              let url = "http://localhost:3002/ventas/" + venta.id;
              this.$axios.delete(url).then((response) => {
                this.$swal.fire(
                  "Eliminado.",
                  "La venta ha sido eliminada correctamente.",
                  "success"
                );
                this.cargarVentas();
              });
            }
          });
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La venta no existe en la tabla.",
        });
      }
    }
  },
};
</script>
