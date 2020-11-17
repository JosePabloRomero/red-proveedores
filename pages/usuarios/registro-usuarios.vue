<template>
  <v-container>
    <v-row>
      <v-col class="primary white--text" align="center">
        <h1>Formulario Registro de Usuarios</h1>
      </v-col>
    </v-row>

    <v-form v-model="formUsers" ref="formUsers" lazy-validation>
      <!-- Seleccionar un rol -->
      <v-row justify="center">
        <v-col sm="4" class="mt-5">
          <v-select
            :items="rol"
            @change="actualizarRol"
            v-model="rolSeleccionado"
            label="Seleccione un rol"
            outlined
          ></v-select>
        </v-col>
      </v-row>

      <!-- Formularios generales para proveedor y usuario -->
      <v-row v-if="rolSeleccionado">
        <v-col sm="4" v-for="(item, index) in camposGenerales" :key="index">
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            :rules="emailRules"
            :type="item.type"
            required
            v-if="index === 2"
          ></v-text-field>
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            :rules="fieldRequired"
            :type="item.type"
            required
            v-if="index !== 2"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Campos solo para proveedores -->
      <v-row v-if="rolSeleccionado === rol[0]">
        <v-col md="6">
          <v-select
            label="Tipo Identificacion"
            :items="tipo_identificaciones"
            item-value="id"
            item-text="nombre"
            v-model="tipoId_seleccionado"
            required
          ></v-select>
        </v-col>

        <v-col md="6" v-for="(item, index) in camposProveedor" :key="index">
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            required
            :rules="fieldRequired"
          >
          </v-text-field>
        </v-col>

        <v-col md="6">
          <v-textarea
            label="Descripción"
            filled
            auto-grow
            rows="2"
            row-height="30"
            :rules="fieldRequired"
            required
            v-model="descripcion"
          >
          </v-textarea>
        </v-col>
      </v-row>
      <v-row justify="center" v-if="rolSeleccionado">
        <v-col md="4">
          <v-btn class="success black--text" @click="enviar" block>Enviar </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  layout: "default",
  beforeMount() {
    this.loadPage();
  },
  data() {
    return {
      formUsers: true,
      mensaje: "",
      snackbar: false,
      rol: ["Proveedor", "Usuario"],
      rolSeleccionado: null,
      camposGenerales: [],
      camposProveedor: [
        { label: "Numero Identificación", dato: "" },
        { label: "Dirección del proveedor", dato: "" },
      ],
      descripcion: null,
      tipo_identificaciones: [],
      tipoId_seleccionado: null,
      /* Comprobar Campos */
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      emailRules: [
        (v) => !!v || "El e-mail es requerido",
        (v) => /.+@.+/.test(v) || "El e-mail debe de ser valido",
      ],
      url: "http://localhost:3002/api/v1/",
    };
  },
  methods: {
    loadPage() {
      this.obtenerIdentificaciones();
    },
    actualizarRol() {
      this.camposGenerales = [
        {
          label: `Nombre del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
        },
        {
          label: `Apellido del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
        },
        {
          label: `E-mail del ${this.rolSeleccionado}`,
          dato: "",
          type: "email",
        },
        {
          label: `Contraseña del ${this.rolSeleccionado}`,
          dato: "",
          type: "password",
        },
        {
          label: `Telefono del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
        },
      ];
    },
    async obtenerIdentificaciones() {
      let { data } = await this.$axios.get(this.url + "identificaciones");
      this.tipo_identificaciones = data.info;
    },
    async enviar() {
      if (this.$refs.formUsers.validate() && this.formUsers) {
        /* Generamos el objeto usuario con los datos */
        let user = {
          nombre: this.camposGenerales[0].dato,
          apellido: this.camposGenerales[1].dato,
          email: this.camposGenerales[2].dato,
          clave: this.camposGenerales[3].dato,
          contacto: this.camposGenerales[4].dato,
        };
        try {
          if (this.rolSeleccionado === this.rol[0]) {
            user = {
              identificacion: this.camposProveedor[0].dato,
              tipo_id: this.tipoId_seleccionado,
              ...user,
              direccion: this.camposProveedor[1].dato,
              descripcion: this.descripcion,
            };
            console.log(user);
            let { data } = await this.$axios.post(
              this.url + "proveedores",
              user
            );
          } else {
            let { data } = await this.$axios.post(this.url + "usuarios", user);
          }
          this.$swal.fire(
            "Creado",
            "La cuenta ha sido creada correctamente!",
            "success"
          );
          this.$router.push("/");
        } catch (error) {
          this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error al crear la cuenta.",
          });
        }
      }
    },
  },
};
</script>