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
            :disbled="item.editing"
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
            :disabled="editing"
            v-model="tipoId_seleccionado"
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
        <v-row v-if="!editing" justify="center">
          <v-col md="4">
            <v-btn color="success" @click="enviar" block>Enviar </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="editing" justify="center">
          <v-col md="4">
            <v-btn color="warning" @click="editUser" block>Actualizar</v-btn>
          </v-col>
        </v-row>
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
    this.obtenerIdentificaciones();
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
      tipo_identificaciones: [],
      tipoId_seleccionado: null,
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
      url: "http://localhost:3002/api/v1/",
    };
  },
  methods: {
    cargarDatos() {
      this.obtenerProveedores();
      this.obtenerUsuarios();
      this.obtenerAdministradores();
      this.obtenerIdentificaciones();
      this.actualizarRol();
    },
    actualizarRol() {
      this.camposGenerales = [
        {
          label: `Nombre del ${this.rolSeleccionado}`,
          dato: "",
          type: "text"
        },
        {
          label: `Apellido del ${this.rolSeleccionado}`,
          dato: "",
          type: "text"
        },
        {
          label: `E-mail del ${this.rolSeleccionado}`,
          dato: "",
          type: "email"         
        },
        {
          label: `Contraseña del ${this.rolSeleccionado}`,
          dato: "",
          type: "password"
          
        },
        {
          label: `Telefono del ${this.rolSeleccionado}`,
          dato: "",
          type: "text"          
        },
      ];
      this.url = "http://localhost:3002/api/v1/";
      switch (this.rolSeleccionado) {        
        case this.rol[0]:
          this.usuariosBuscados = this.proveedores;
          this.url += "proveedores/";
          break;
        case this.rol[1]:
          this.usuariosBuscados = this.usuarios;
          this.url += "usuarios/";
          break;
        case this.rol[2]:
          this.usuariosBuscados = this.administradores;
          this.url += "administradores/";
          break;
        default:
          break;
      }
    },
    async obtenerIdentificaciones() {
      this.url = "http://localhost:3002/api/v1/";
      let {data} = await this.$axios.get(this.url + "identificaciones");
      this.tipo_identificaciones = data.info;
    },
    async obtenerProveedores() {     
      this.url = "http://localhost:3002/api/v1/";
      let {data} = await this.$axios.get(this.url + "proveedores");
      this.proveedores = data.info;
    },
    async obtenerUsuarios() {
      this.url = "http://localhost:3002/api/v1/";
      let {data} = await this.$axios.get(this.url + "usuarios");
      this.usuarios = data.info;
    },
    async obtenerAdministradores() {
      this.url = "http://localhost:3002/api/v1/";
      let {data} = await this.$axios.get(this.url + "usuarios");
      this.administradores = data.info;
    },
    limpiarCampos() {          
      this.tipoId_seleccionado= null,
      this.descripcion = null;
      this.camposProveedor.forEach((element) => {
        element.dato = "";
      });
      this.camposGenerales.forEach((element) => {
        element.dato = "";
      });
      this.idBuscado = "";
      this.url = "http://localhost:3002/api/v1/";
    },
    loadUser(user) {      
      this.camposGenerales[0].dato = user.nombre;
      this.camposGenerales[1].dato = user.apellido;
      this.camposGenerales[2].dato = user.email;
      this.camposGenerales[3].dato = user.clave;
      this.camposGenerales[3].editing = true;
      this.camposGenerales[4].dato = user.contacto;
      this.idBuscado = user.id;
      if (this.rolSeleccionado === this.rol[0]) {
        this.this.tipoId_seleccionado = user.tipo_id;
        this.camposProveedor[0].dato = user.identificacion;
        this.camposProveedor[1].dato = user.direccion;
        this.descripcion = user.descripcion;
      }
      this.editing = true;
    },
    editUser() {      
      if (this.$refs.formUsers.validate() && this.formUsers) {
        // Encontrar la posición que esta el usuario
        let existIndex = this.usuariosBuscados.findIndex(
          (x) => x.id == this.idBuscado
        );
        // Validación si la identificación de una persona ya existe
        if (existIndex > -1) {
          console.log(
            "La persona existe y esta en la posición del array",
            existIndex
          );
          //Modificar la persona del array
          let url = `${this.url}/${this.idBuscado}`;
          let user = {
            nombre: this.camposGenerales[0].dato,
            apellido: this.camposGenerales[1].dato,
            email: this.camposGenerales[2].dato,
            clave: this.camposGenerales[3].dato,
            contacto: this.camposGenerales[4].dato,
          };
          if (this.rolSeleccionado === this.rol[0]) {
            user = {
              ...user,
              tipo_id: this.tipoId.tipoSeleccionado,
              identificacion: this.camposProveedor[0].dato,
              direccion: this.camposProveedor[1].dato,
              descripcion: this.descripcion,
            };
          }
          this.$axios.put(url, user).then((response) => {
            this.editing = false;
            this.camposGenerales[3].editing = false;
            this.limpiarCampos();
            this.cargarDatos();           
            
            this.mensaje = `El ${this.rolSeleccionado} fue actualizado con exito`;
            this.snackbar = true;
          });
        } else {
          this.mensaje = `La persona no existe en la tabla`;
          this.snackbar = true;
        }
      }
    },
    deleteUser(user) {     
        let existIndex = this.usuariosBuscados.findIndex((x) => x.id == user.id);
        if (existIndex > -1) {
          this.$swal
            .fire({
              title: "Desea eliminar el usuario?",
              text: "Este cambio no se puede revertir.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Si, eliminalo!",
              cancelButtonText: "Cancelar",
            })
            .then((result) => {         
              if (result.isConfirmed) {              
                this.$axios.delete(this.url + user.id)
                .then((response) => {
                  this.cargarDatos();
                   this.$swal.fire(
                      "Eliminado.",
                      "La persona ha sido eliminada correctamente.!",
                      "success"
                    );        
                })
                .catch((error) => {
                    this.$swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Error eliminando la persona",
                    });
                });   
              }         
            })
            this.cargarDatos();            
        } else {
            this.$swal.fire({
              icon: "error",
              title: "Oops...",
              text: "La persona no existe en la tabla.",
            });
        }
        
      }
    ,
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
              let exist = this.proveedores.find(
                (x) => x.identificacion == this.camposProveedor[0].dato
              );          
            if (exist == undefined) {
              user = {              
                identificacion: this.camposProveedor[0].dato,
                tipo_id: this.tipoId.tipoSeleccionado,       
                ...user,       
                direccion: this.camposProveedor[1].dato,
                descripcion: this.descripcion,
              };
              let {data} = await this.$axios.post(this.url, user)
                             
                this.$swal.fire(
                  "Creado",
                  `El ${this.rolSeleccionado} fue registrado con exito`,
                  "success"
                );
                          
            } else {
              this.mensaje = `El ${this.rolSeleccionado} ya existe en la base de datos`;
              this.snackbar = true;
            }
          } else if(this.rolSeleccionado === this.rol[1]) {
              let exist = this.usuarios.find(
                (x) => x.email == this.camposGenerales[2].dato
              );  
              if (exist == undefined) {
                let {data} = await this.$axios.post(this.url, user);
                
                this.$swal.fire(
                  "Creado",
                  `El ${this.rolSeleccionado} fue registrado con exito`,
                  "success"
                );
                        
              } else {
                this.mensaje = `El ${this.rolSeleccionado} con dicho email ya existe en la base de datos`;
                this.snackbar = true;
              }              
          } else if(this.rolSeleccionado === this.rol[2]) {
              let exist = this.administradores.find(
                (x) => x.email == this.camposGenerales[2].dato
              );  
              if (exist == undefined) {
                let {data} = await this.$axios.post(this.url, user);
                
                this.$swal.fire(
                  "Creado",
                  `El ${this.rolSeleccionado} fue registrado con exito`,
                  "success"
                );
                      
              } else {
                this.mensaje = `El ${this.rolSeleccionado} con dicho email ya existe en la base de datos`;
                this.snackbar = true;
              }              
          }
          this.cargarDatos();  
          this.limpiarCampos();                  
        } catch (error) {
          this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Error al agregar el ${this.rolSeleccionado}`,
          });         
        }
        
      }
    },
  },
};
</script>