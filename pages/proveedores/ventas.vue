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
            :items="estados_venta"    
            item-value:="id"
            item-text="nombre"        
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
        <v-icon small @click="eliminarVenta(item)">
          mdi-delete
        </v-icon>
        <v-icon small @click="cargarVenta(item)">
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>

  </v-container>
</template>

<script>
const url = "http:///localhost:3002/api/v1/"
export default {
  layout: "proveedores",
  beforeMount() {
    this.cargarVentas();
  },
  beforeUpdate() {
    try {
      this.$refs.formVentas.validate();
    } catch (error) {}
  },
  data() {
    return {
      formVentas: true,
      headers: [
        { text: "Id de la Venta", value: "id" },
        { text: "Id del Cliente", value: "id_cliente" },
        { text: "Id del Proveedor", value: "id_proveedor" },
        { text: "Fecha", value: "fecha" },
        { text: "Estado", value: "estado" },
        { text: "Acciones", value: "actions" }
      ],
      mensaje: '',
      snackbar: false,
      estados_venta: [],
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
      ventas: [],
      idBuscado : ""
    };
  },
  methods: {
    async obtenerEstados() {
      let { data } = await this.$axios.get(url + "estados");
      this.estados_venta = data.info;
    },
    async cargarVentas() {
      let { data } = await this.$axios.get(url + "ventas")
      this.ventas = data.info;
      console.log(this.ventas)
    },
    async enviar() {
      if (this.$refs.formVentas.validate() && this.formVentas) {
        const ventas = {
        id_estado: this.estadoSeleccionado,
        id_proveedor : this.camposGenerales[1].dato,
        id_usuario : this.camposGenerales[0].dato,
        fecha : this.camposGenerales[2].dato,        
        }
        let { data } = await this.$axios.post(url + "ventas", ventas);
        this.mensaje = `La venta fue registrada con éxito`
        this.snackbar = true
        this.limpiarCampos();
        this.cargarVentas();
      }   
    },
    limpiarCampos() {
      this.estadoSeleccionado = "";
      this.camposGenerales.forEach((element) => {
        element.dato = "";  
      });
    },
    async cargarVenta(venta) {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, 'Bearer');
      let {data} = await this.$axios.get(url + "auth");
      this.camposGenerales[0].dato = venta.id_usuario;
      this.camposGenerales[1].dato = data.info.id;
      this.camposGenerales[2].dato = venta.fecha;
      this.estadoSeleccionado = venta.id_estado;
      this.idBuscado = venta.id;
      this.editing = true;

    },
    editarVenta(venta) {
      if (this.$refs.formVentas.validate() && this.formVentas) {
        let existIndex = this.ventas.findIndex(
          (x) => x.id == this.idBuscado
        );
        if (existIndex > -1) {
          console.log("La venta existe y está en la posición del array", existIndex);
          let venta = {
            fecha: this.camposGenerales[2].dato,
            id_estado: this.estadoSeleccionado
          };
            this.$axios.put(url + "ventas", venta).then((response) => {
            this.editing = false;
            this.limpiarCampos();
            this.cargarVentas();              
            this.mensaje = `La venta fue actualizada con exito`;
            this.snackbar = true;
          });
        } else {
          this.mensaje = `La venta no existe en la tabla`;
          this.snackbar = true;
        }   
      }
    },
    eliminarVenta(venta) {
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
            if (result.isConfirmed) {
              this.$axios.delete(url + "ventas/" + venta.id).then((response) => {
                this.$swal.fire(
                  "Eliminado.",
                  "La venta ha sido eliminada correctamente.",
                  "success"
                );
                this.cargarVentas();
              })
              .catch((error) => {
                this.$swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Error eliminando la venta",
                });
              });
            }
          })
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
