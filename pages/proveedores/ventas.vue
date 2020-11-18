<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Registro de Ventas</h1>
      </v-col>
    </v-row>

    <v-form v-model="formVentas" ref="formVentas" lazy-validation>
      <!-- Campos unicamente para editar venta -->
      <v-row>
        <v-col sm="4" v-if="editing">
          <v-text-field
            label="Nombre del Cliente"
            v-model="nombre_cliente"
            :rules="fieldRequired"
            type="text"
            required
          ></v-text-field>
        </v-col>
        <v-col sm="4" v-if="editing">
          <v-text-field
            label="Apellido del Cliente"
            v-model="apellido_cliente"
            :rules="fieldRequired"
            type="text"
            required
          ></v-text-field>
        </v-col>
        <v-col sm="4" v-if="editing">         
          <v-date-picker v-model="fecha_venta" :rules="fieldRequired"></v-date-picker>
        </v-col>
        <v-col md="6" v-if="editing">
          <v-select
            :items="estados_venta"
            item-value:="id"
            item-text="nombre"
            v-model="estado"
            @change="cambiarIdEstado"
            label="Seleccione el estado de la venta"
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col md="4">
          <v-btn color="succes" @click="editarVenta" v-if="editing" block
            >Editar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
    <h2>Lista de ventas procesadas</h2>
    <v-data-table
      :headers="headers"
      :items="ventas"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="eliminarVenta(item)"> mdi-delete </v-icon>
        <v-icon small @click="cargarVenta(item)"> mdi-pencil </v-icon>
      </template>
    </v-data-table>
    <h2>Lista de ventas en cola</h2>
    <v-data-table
      :headers="headers"
      :items="ventas_en_cola"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="aceptarVenta(item)">
          mdi-check-box-outline
        </v-icon>
        <v-icon small @click="eliminarVentaEnCola(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
const url = "http:///localhost:3002/api/v1/";
export default {
  layout: "proveedores",
  beforeMount() {
    this.cargarVentas();
    this.obtenerEstados();
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
        { text: "Id de la Venta", value: "id_venta" },
        { text: "Nombre Del Cliente", value: "nombre_cliente" },
        { text: "Apellido Del Cliente", value: "apellido_cliente" },
        { text: "Fecha", value: "fecha_venta"},
        { text: "Estado", value: "estado" },
        { text: "Acciones", value: "actions" },
      ],
      mensaje: "",
      snackbar: false,
      estados_venta: [],
      estadoSeleccionado: null,
      id_proveedor: null,
      id_usuario: null,
      id_venta: null,
      id_venta_en_cola: null,
      id_estado: null,
      nombre_cliente: null,
      apellido_cliente: null,
      fecha_venta: null,
      estado: null,
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      ventas: [],
      ventas_en_cola: [],
      idBuscado: "",
      editing: false,
    };
  },
  methods: {
    async obtenerEstados() {
      let { data } = await this.$axios.get(url + "estados");
      this.estados_venta = data.info;
    },
    cambiarIdEstado() {
      if (this.estado === this.estados_venta[0].nombre) {
        this.id_estado = 1;
      } else if (this.estado === this.estados_venta[1].nombre) {
        this.id_estado = 2;
      } else if (this.estado === this.estados_venta[2].nombre) {
        this.id_estado = 3;
      }
    },
    async cargarVentas() {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, "Bearer");
      let proveedor = await this.$axios.get(url + "auth");      
      this.id_proveedor = proveedor.data.info.id;
      let { data } = await this.$axios.get(url + "ventas/" + this.id_proveedor);
      this.ventas = data.info;
      let ventas_en_cola = await this.$axios.get(
        url + "ventas_en_cola/" + this.id_proveedor
      );
      this.ventas_en_cola = ventas_en_cola.data.info;
    },
    limpiarCampos() {
      this.estadoSeleccionado = "";
      this.id_venta = "";
      this.estado = "";
      this.nombre_cliente = "";
      this.apellido_cliente = "";
      this.fecha_venta = "";
    },
    cargarVenta(venta) {
      this.id_venta = venta.id_venta;
      this.estado = venta.estado;
      this.nombre_cliente = venta.nombre_cliente;
      this.apellido_cliente = venta.apellido_cliente;
      this.fecha_venta =  venta.fecha_venta;
      this.id_estado = venta.id_estado;
      this.id_usuario = venta.id_usuario;
      this.editing = true;
    },
    async aceptarVenta(venta) {
      let existIndex = this.ventas_en_cola.findIndex(
        (x) => x.id_venta == venta.id_venta
      );
      if (existIndex > -1) {
        console.log(
          "La venta existe y está en la posición del array",
          existIndex
        );
        let venta_en_cola = {
          id_estado: 1,
          id_proveedor: this.id_proveedor,
          id_usuario: venta.id_usuario,
          fecha: venta.fecha_venta,
        };
        this.$axios
          .put(url + "ventas/" + venta.id_venta, venta_en_cola)
          .then((response) => {
            this.editing = false;
            this.cargarVentas();
            this.mensaje = `La venta ahora se encuentra en proceso`;
            this.snackbar = true;
          });
      } else {
        this.mensaje = `La venta en cola no existe en la tabla`;
        this.snackbar = true;
      }
    },
    editarVenta() {
      if (this.$refs.formVentas.validate() && this.formVentas) {
        let existIndex = this.ventas.findIndex(
          (x) => x.id_venta == this.id_venta
        );
        if (existIndex > -1) {
          console.log(
            "La venta existe y está en la posición del array",
            existIndex
          );
          let venta = {
            id_estado: this.id_estado,
            id_proveedor: this.id_proveedor,
            id_usuario: this.id_usuario,
            fecha: this.fecha_venta,
          };
          this.$axios
            .put(url + "ventas/" + this.id_venta, venta)
            .then((response) => {
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
    eliminarVentaEnCola(venta) {
      let existIndex = this.ventas_en_cola.findIndex(
        (x) => x.id_venta == venta.id_venta
      );
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
              this.$axios
                .delete(url + "ventas/" + venta.id)
                .then((response) => {
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
          });
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La venta no existe en la tabla.",
        });
      }
    },
    eliminarVenta(venta) {
      let existIndex = this.ventas.findIndex(
        (x) => x.id_venta == venta.id_venta
      );
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
              this.$axios
                .delete(url + "ventas/" + venta.id)
                .then((response) => {
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
          });
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La venta no existe en la tabla.",
        });
      }
    },
  },
};
</script>
