<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>Registro de Reseñas</h1>
      </v-col>
    </v-row>

    <v-form v-model="formResenas" ref="formResenas" lazy-validation>
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
          <v-textarea
            label="Comentario"
            auto-grow
            rows="2"
            row-height="10"
            :rules="fieldRequired"
            required
            v-model="comentario"
          >
          </v-textarea>
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
        <v-icon small @click="eliminarResena(item)">
          mdi-delete
        </v-icon>
        <v-icon small @click="cargarResena(item)">
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>

  </v-container>
</template>

<script>
const url = "http:///localhost:3002/api/v1/"
export default {
  layout: "usuarios",
  beforeMount() {
    this.cargarResenas();
  },
  beforeUpdate() {
    try {
      this.$refs.formResenas.validate();
    } catch (error) {}
  },
  data() {
    return {
      formResenas: true,
      headers: [
        { text: "Nivel de Satisfacción", value: "nivel_satisfaccion" },
        { text: "Comentario", value: "comentario" },
        { text: "Id de Venta", value: "id_venta" },
        { text: "Acciones", value: "actions" }
      ],
      mensaje: '',
      snackbar: false,
      estadoSeleccionado: null,
      camposGenerales: [
        {
          label: `Nivel de satisfacción`,
          dato: "",
          type: "text",
        },
        {
          label: `Id de Venta`,
          dato: "",
          type: "text",
        }
      ],
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      resenas: [],
      idBuscado : ""
    };
  },
  methods: {
    async cargarResenas() {
      let { data } = await this.$axios.get(url + "resenas")
      this.ventas = data.info;
      console.log(this.resenas)
    },
    async enviar() {
      if (this.$refs.formResenas.validate() && this.formResenas) {
        const resenas = {
        nivel_satisfaccion : this.camposGenerales[0].dato,
        id_venta : this.camposGenerales[1].dato,
        comentario: this.comentario       
        }
        let { data } = await this.$axios.post(url + "resenas", resenas);
        this.mensaje = `La venta fue registrada con éxito`
        this.snackbar = true
        this.limpiarCampos();
        this.cargarResenas();
      }   
    },
    limpiarCampos() {
      this.camposGenerales.forEach((element) => {
        element.dato = "";  
      });
      this.comentario = "";
    },
    async cargarResena(resena) {
      let token = localStorage.getItem("token");
      this.$axios.setToken(token, 'Bearer');
      let {data} = await this.$axios.get(url + "auth");
      this.camposGenerales[0].dato = resenas.nivel_satisfaccion;
      this.camposGenerales[1].dato = resenas.id_venta
      this.comentario = resenas.comentario;
      this.idBuscado = resenas.id;
      this.editing = true;

    },
    editarResena(resena) {
      if (this.$refs.formResenas.validate() && this.formResenas) {
        let existIndex = this.resenas.findIndex(
          (x) => x.id == this.idBuscado
        );
        if (existIndex > -1) {
          console.log("La reseña existe y está en la posición del array", existIndex);
          let resena = {
            nivel_satisfaccion: this.camposGenerales[0].dato,
            id_venta: this.camposGenerales[1].dato,
            comentario: this.comentario,
          };
            this.$axios.put(url + "resenas", resena).then((response) => {
            this.editing = false;
            this.limpiarCampos();
            this.cargarResenas();              
            this.mensaje = `La reseña fue actualizada con exito`;
            this.snackbar = true;
          });
        } else {
          this.mensaje = `La reseña no existe en la tabla`;
          this.snackbar = true;
        }   
      }
    },
    eliminarResena(resena) {
      let existIndex = this.resenas.findIndex((x) => x.id == resenas.id);
      if (existIndex > -1) {
        this.$swal
          .fire({
            title: "¿Desea eliminar la reseña?",
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
              this.$axios.delete(url + "resenas/" + resena.id).then((response) => {
                this.$swal.fire(
                  "Eliminado.",
                  "La reseña ha sido eliminada correctamente.",
                  "success"
                );
                this.cargarResenas();
              })
              .catch((error) => {
                this.$swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Error eliminando la reseña",
                });
              });
            }
          })
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La reseña no existe en la tabla.",
        });
      }
    }
  },
};
</script>
