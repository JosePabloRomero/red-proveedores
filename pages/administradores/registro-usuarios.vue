<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>CRUD Usuarios</h1>
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
            :disabled="editing"
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
            :diabled="editing && rolSeleccionado === rol[0]"
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
          <v-btn color="success" @click="enviar" v-if="!editing" block
            >Enviar
          </v-btn>
        </v-col>
        <v-col md="4">
          <v-btn color="warning" @click="editUser" v-if="editing" block
            >Actualizar</v-btn
          >
        </v-col>
      </v-row>
    </v-form>

    <v-data-table
      :headers="headers"
      :items="usuariosBuscados"
      :items-per-page="5"
      class="elevation-1"
      v-if="rolSeleccionado"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="loadUser(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteUser(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  layout: "administradores",
  beforeMount() {
    this.obtenerProveedores();
    this.obtenerUsuarios();
    this.obtenerAdministradores();
  }, 
  data() {
    return {
      formUsers: true,
      mensaje: "",
      snackbar: false,
      rol: ["Proveedor", "Usuario", "Administrador"],
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
      usuarios: [],
      proveedores: [],
      administradores: [],
      usuariosBuscados: [],
      headers: [
        { text: "Identificación", value: "id" },
        { text: "Nombre", value: "nombre" },
        { text: "Email", value: "email" },
        { text: "Actions", value: "actions" },
      ],
      editing: false,
      idBuscado: "",
      urlObjetivo: "",
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
      switch (this.rolSeleccionado) {
        case this.rol[0]:
          this.usuariosBuscados = this.proveedores;
          this.urlObjetivo = "http://localhost:3002/proveedores";
          break;
        case this.rol[1]:
          this.usuariosBuscados = this.usuarios;
          this.urlObjetivo = "http://localhost:3002/usuarios";
          break;
        case this.rol[2]:
          this.usuariosBuscados = this.administradores;
          this.urlObjetivo = "http://localhost:3002/administradores";
          break;
        default:
          break;
      }
    },
    obtenerProveedores() {
      let url = "http://localhost:3002/proveedores";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.proveedores = data;
      });
    },
    obtenerUsuarios() {
      let url = "http://localhost:3002/usuarios";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.usuarios = data;
      });
    },
    obtenerAdministradores() {
      let url = "http://localhost:3002/administradores";
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.administradores = data;
      });
    },
    obtenerIdUsuario() {
      if (this.usuarios.length !== 0) {
        let id = (
          parseInt(this.usuarios[this.usuarios.length - 1].id) + 1
        ).toString();
        return id;
      } else {
        return "0";
      }
    },
    limpiarCampos() {
      this.actualizarRol();
      this.tipoId.tipoSeleccionado = "";
      this.descripcion = null;
      this.camposProveedor.forEach((element) => {
        element.dato = "";
      });
      this.idBuscado = "";
    },
    loadUser(user) {
      this.camposGenerales[0].dato = user.nombre;
      this.camposGenerales[1].dato = user.apellido;
      this.camposGenerales[2].dato = user.email;
      this.camposGenerales[3].dato = user.password;
      this.camposGenerales[4].dato = user.contacto;
      this.idBuscado = user.id;
      if (this.rolSeleccionado === this.rol[0]) {
        this.tipoId.tipoSeleccionado = user.tipoId;
        this.camposProveedor[0].dato = user.id;
        this.camposProveedor[1].dato = user.direccion;
        this.descripcion = user.descripcion;
      }
      this.editing = true;
    },
    editUser() {
      if (this.$refs.formUsers.validate() && this.formUsers) {
        // Encontrar la posición que esta el usuario en el array
        let existIndex = this.usuariosBuscados.findIndex(
          (x) => x.id == this.idBuscado
        );
        // Validación si la identificación de una persona ya existe en el array
        if (existIndex > -1) {
          console.log(
            "La persona existe y esta en la posición del array",
            existIndex
          );
          //Modificar la persona del array
          let url = `${this.urlObjetivo}/${this.idBuscado}`;
          let user = {
            nombre: this.camposGenerales[0].dato,
            apellido: this.camposGenerales[1].dato,
            email: this.camposGenerales[2].dato,
            password: this.camposGenerales[3].dato,
            contacto: this.camposGenerales[4].dato,
          };
          if(this.rolSeleccionado === this.rol[0]) {
            user = {
              ...user,
              tipoId: this.tipoId.tipoSeleccionado,
              id: this.camposProveedor[0].dato,
              direccion: this.camposProveedor[1].dato,
              descripcion: this.descripcion,
            };
          }          
          this.$axios.put(url,user).then((response) => {
            this.editing = false;
            this.obtenerProveedores();
            this.obtenerUsuarios();
            this.obtenerAdministradores();
            this.limpiarCampos();
            this.mensaje = `El ${this.rolSeleccionado} fue actualizado con exito`;
            this.snackbar = true;
          });
        } else {
          this.mensaje = `La persona no existe en la tabla`;
          this.snackbar = true;
        }
      }
    },
    enviar() {
      if (this.$refs.formUsers.validate() && this.formUsers) {
        /* Generamos el objeto usuario con los datos */
        let url = "http://localhost:3002/";
        let user = {
          nombre: this.camposGenerales[0].dato,
          apellido: this.camposGenerales[1].dato,
          email: this.camposGenerales[2].dato,
          password: this.camposGenerales[3].dato,
          contacto: this.camposGenerales[4].dato,
        };

        if (this.rolSeleccionado === this.rol[0]) {
          url += "proveedores";
          let exist = this.proveedores.find(
            (x) => x.id == this.camposProveedor[0].dato
          );
          console.log(exist);
          if (exist == undefined) {
            user = {
              ...user,
              tipoId: this.tipoId.tipoSeleccionado,
              id: this.camposProveedor[0].dato,
              direccion: this.camposProveedor[1].dato,
              descripcion: this.descripcion,
            };
            this.$axios.post(url, user).then((response) => {
              this.obtenerProveedores();
              this.mensaje = `El ${this.rolSeleccionado} fue registrado con exito`;
              this.snackbar = true;
              this.limpiarCampos();
            });
          } else {
            this.mensaje = `El ${this.rolSeleccionado} ya existe en la base de datos`;
            this.snackbar = true;
          }
        } else {
          url += "usuarios";
          user = {
            ...user,
            id: this.obtenerIdUsuario(),
          };
          this.$axios.post(url, user).then((response) => {
            this.obtenerProveedores();
            this.mensaje = `El ${this.rolSeleccionado} fue registrado con exito`;
            this.snackbar = true;
            this.limpiarCampos();
          });
        }
      }
    },
  },
};
</script>