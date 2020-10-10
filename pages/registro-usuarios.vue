<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>Formulario Registro de Usuarios</h1>
      </v-col>
    </v-row>

    <v-form v-model="formUsers" ref="formUsers">
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
            :rules="fieldRequired"
            :type="item.type"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Campos solo para proveedores -->
      <v-row v-if="rolSeleccionado === rol[0]">
        <v-col md="6">
          <v-select
            :label="tipoId.label"
            :items="tipoId.items"
            v-model="tipoId.tipoSeleccionado"
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
          <v-btn color="success" @click="enviar" block>Enviar </v-btn>
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
  beforeMount() {
    this.cargarUsuarios();
  },
  data() {
    return {
      formUsers: null,
      mensaje: '',
      snackbar: false,
      rol: ["Proveedor", "Usuario"],
      rolSeleccionado: null,
      camposGenerales: [],
      camposProveedor: [
        { label: "Numero Identificación", dato: "" },
        { label: "Dirección del proveedor", dato: "" },
      ],
      descripcion: null,
      tipoId: {
        label: "Tipo de Identificación",
        items: ["cedula", "pasaporte"],
        tipoSeleccionado: "",
      },
      /* Comprobar Campos */
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      emailRules: [
        (v) => !!v || "El e-mail es requerido",
        (v) => /.+@.+/.test(v) || "El e-mail debe de ser valido",
      ],
      usuarios: []
    };
  },
  methods: {
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
        /* Es necesario agregar este campo? */
        {
          label: `Telefono del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
        },
      ];
    },
    cargarUsuarios() {
      let url = "http://localhost:3002/proveedores";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.usuarios = data;
      })
    },
    enviar() {      
      /* Generamos el objeto usuario con los datos */
      let url = "http://localhost:3002/proveedores";
      const defaultUser = {
          nombre : this.camposGenerales[0].dato,
          apellido : this.camposGenerales[1].dato,
          email : this.camposGenerales[2].dato,
          password : this.camposGenerales[3].dato,
          contacto : this.camposGenerales[4].dato
        }
        
      if(this.rolSeleccionado === this.rol[0]) {
        const user = {
          ...defaultUser,
          tipoId : this.tipoId.tipoSeleccionado,
          id : this.camposProveedor[0].dato,
          direccion : this.camposProveedor[1].dato,
          descripcion : this.descripcion
        }        
        this.$axios.post(url, user).then((response) => {
          this.cargarUsuarios();
          this.mensaje = `El ${this.rolSeleccionado} fue registrado con exito`
          this.snackbar = true
        });    
        console.log(this.usuarios)     
      }
    }
  }
}
</script>