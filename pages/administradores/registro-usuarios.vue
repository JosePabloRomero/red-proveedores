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
            v-if="index === 3"
          ></v-text-field>
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            :rules="fieldRequired"
            :type="item.type"
            required
            v-if="index !== 3 && index !== 2"
          ></v-text-field>
          <v-text-field
            :label="item.label"
            v-model="item.dato"
            :rules="fieldRequired"
            :type="item.type"
            required
            v-if="rolSeleccionado !== rol[2] && index === 2"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            label="Contraseña"
            v-model="clave"
            :rules="fieldRequired"
            type="password"
            required
            v-if="!editing"
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
          <v-select
            v-model="categorias_seleccionadas"
            :items="categorias"
            :menu-props="{ maxHeight: '400' }"
            item-value="id"
            item-text="nombre"
            label="Categorias"
            multiple
            required
            hint="Seleccione las categorías a las que pertenece el producto"
            persistent-hint
          ></v-select>
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
  async beforeMount() {
    await this.obtenerProveedores();
    await this.obtenerUsuarios();
    await this.obtenerAdministradores();
    await this.obtenerIdentificaciones();
    await this.cargarCategorias()
  },
  data() {
    return {
      formUsers: true,
      mensaje: "",
      snackbar: false,
      rol: ["Proveedor", "Cliente", "Administrador"],
      rolSeleccionado: null,
      camposGenerales: [],
      clave: null,
      camposProveedor: [
        { label: "Numero Identificación", dato: "" },
        { label: "Dirección del proveedor", dato: "" },
      ],
      descripcion: null,
      tipo_identificaciones: [],
      tipoId_seleccionado: null,
      categorias: [],
      categorias_seleccionadas: [],
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
    async cargarDatos() {
      await this.obtenerProveedores();
      await this.obtenerUsuarios();
      await this.obtenerAdministradores();
      await this.obtenerIdentificaciones();
      await this.actualizarRol();
    },
    async cargarCategorias() {
      let { data } = await this.$axios.get(this.url + "categorias/");
      this.categorias = data.info;
    },
    actualizarRol() {
      this.camposGenerales = [
        {
          label: `Nombre del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
          mostrar: true,
        },
        {
          label: `Apellido del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
          mostrar: true,
        },
        {
          label: `Telefono del ${this.rolSeleccionado}`,
          dato: "",
          type: "text",
          mostrar: true,
        },
        {
          label: `E-mail del ${this.rolSeleccionado}`,
          dato: "",
          type: "email",
          mostrar: true,
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
      let url = "http://localhost:3002/api/v1/" + "identificaciones";
      let { data } = await this.$axios.get(url);
      this.tipo_identificaciones = data.info;
    },
    async obtenerProveedores() {
      let url = "http://localhost:3002/api/v1/" + "proveedores";
      let { data } = await this.$axios.get(url);
      this.proveedores = [];
      this.proveedores = data.info;      
    },
    async obtenerCategorias(id_proveedor) {
      let url = "http://localhost:3002/api/v1/"
      let { data } = await this.$axios.get(
        url + "categorias_proveedor/" + id_proveedor
      );           
      this.categorias_seleccionadas = [];
      data.info.forEach((element) => {
      this.categorias_seleccionadas.push(element.id_categoria);
      });
    },
    async agregarCategorias(id_proveedor) {
      let url = "http://localhost:3002/api/v1/"
      let { data } = await this.$axios.get(
        url + "categorias_proveedor/" + id_proveedor
      );
      //Combinamos las categorias del select, con las obtenidas en la consulta
      let categoriasSeleccionadas = [];
      for (
        let index = 0;
        index < this.categorias_seleccionadas.length;
        index++
      ) {
        let categoria = {
          id_categoria: this.categorias_seleccionadas[index],
        };
        categoriasSeleccionadas.push(categoria);
      }
      let categoriasSobrantes = [];
      let categoriasBase = [];
      for (let index = 0; index < data.info.length; index++) {
        let existIndex = categoriasSeleccionadas.findIndex(
          (x) => x.id_categoria == data.info[index].id_categoria
        );
        let categoria = {
          id: data.info[index].id_categoria,
        };
        if (existIndex < 0) {
          categoriasSobrantes.push(categoria);
        }
        categoriasBase.push(categoria);
      }
      let categoriasCombinadas = [
        ...categoriasSeleccionadas,
        ...categoriasSobrantes,
      ];
      for (let index = 0; index < categoriasCombinadas.length; index++) {
        let existIndex = categoriasSeleccionadas.findIndex(
          (x) => x.id_categoria == categoriasCombinadas[index].id_categoria
        );
        if (existIndex > -1) {
          let existIndex2 = categoriasBase.findIndex(
            (x) => x.id_categoria == categoriasCombinadas[index].id_categoria
          );         
          if (existIndex2 < 0) {
            let categoriaNueva = {
              id_categoria: categoriasCombinadas[index].id_categoria,
              id_proveedor: id_proveedor,
            };
            this.$axios.post(url + "categorias_proveedores", categoriaNueva);
          }
        } else {
          this.$axios.delete(
            url +
              "categorias_proveedores/?id_categoria=" +
              categoriasCombinadas[index].id +
              "&id_proveedor=" +
              id_proveedor
          );
        }
      }
    },
    async obtenerUsuarios() {
      let url = "http://localhost:3002/api/v1/" + "usuarios";
      let { data } = await this.$axios.get(url);
      this.usuarios = [];
      this.usuarios = data.info;
    },
    async obtenerAdministradores() {
      let url = "http://localhost:3002/api/v1/" + "administradores";
      let { data } = await this.$axios.get(url);
      this.administradores = [];
      this.administradores = data.info;
    },
    limpiarCampos() {
      (this.tipoId_seleccionado = null), (this.descripcion = null);
      this.camposProveedor.forEach((element) => {
        element.dato = "";
      });
      this.camposGenerales.forEach((element) => {
        element.dato = "";
      });
      this.idBuscado = "";
      this.clave = null;
      this.url = "http://localhost:3002/api/v1/";
    },
    async loadUser(user) {
      this.camposGenerales[0].dato = user.nombre;
      this.camposGenerales[1].dato = user.apellido;
      this.camposGenerales[2].dato = user.contacto;
      this.camposGenerales[3].dato = user.email;
      this.idBuscado = user.id;
      
      if (this.rolSeleccionado === this.rol[0]) {
        this.tipoId_seleccionado = user.tipo_id;
        await this.obtenerCategorias(user.id)
        this.camposProveedor[0].dato = user.identificacion;
        this.camposProveedor[1].dato = user.direccion;
        this.descripcion = user.descripcion;
      }
      this.editing = true;
    },
    async editUser() {
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
          let url = `${this.url}${this.idBuscado}`;
          let user = {
            nombre: this.camposGenerales[0].dato,
            apellido: this.camposGenerales[1].dato,
            email: this.camposGenerales[3].dato,
            contacto: this.camposGenerales[2].dato,
          };
          if (this.rolSeleccionado === this.rol[0]) {
            user = {
              ...user,
              tipo_id: this.tipoId_seleccionado,
              identificacion: this.camposProveedor[0].dato,
              direccion: this.camposProveedor[1].dato,
              descripcion: this.descripcion,
            };
          }
          this.$axios.put(url, user).then((response) => {
            this.mensaje = `El ${this.rolSeleccionado} fue actualizado con exito`;
            this.snackbar = true;
          });
          this.editing = false;
          await this.agregarCategorias(this.idBuscado);
          await this.cargarDatos();
          this.limpiarCampos();
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
              this.$axios
                .delete(this.url + user.id)
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
          });
        this.cargarDatos();
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "La persona no existe en la tabla.",
        });
      }
    },
    async enviar() {
      if (this.$refs.formUsers.validate() && this.formUsers) {
        /* Generamos el objeto usuario con los datos */
        let user = {
          nombre: this.camposGenerales[0].dato,
          apellido: this.camposGenerales[1].dato,
          email: this.camposGenerales[3].dato,
          clave: this.clave,
          contacto: this.camposGenerales[2].dato,
        };
        try {
          if (this.rolSeleccionado === this.rol[0]) {
            let exist = this.proveedores.find(
              (x) => x.identificacion == this.camposProveedor[0].dato
            );
            if (exist == undefined) {
              user = {
                identificacion: this.camposProveedor[0].dato,
                tipo_id: this.tipoId_seleccionado,
                ...user,
                direccion: this.camposProveedor[1].dato,
                descripcion: this.descripcion,
              };
              let { data } = await this.$axios.post(this.url, user);
              await this.agregarCategoriasNuevas(data.info[0].id);
              this.$swal.fire(
                "Creado",
                `El ${this.rolSeleccionado} fue registrado con exito`,
                "success"
              );
            } else {
              this.mensaje = `El ${this.rolSeleccionado} ya existe en la base de datos`;
              this.snackbar = true;
            }
          } else if (this.rolSeleccionado === this.rol[1]) {
            let exist = this.usuarios.find(
              (x) => x.email == this.camposGenerales[3].dato
            );
            if (exist == undefined) {
              let { data } = await this.$axios.post(this.url, user);

              this.$swal.fire(
                "Creado",
                `El ${this.rolSeleccionado} fue registrado con exito`,
                "success"
              );
            } else {
              this.mensaje = `El ${this.rolSeleccionado} con dicho email ya existe en la base de datos`;
              this.snackbar = true;
            }
          } else if (this.rolSeleccionado === this.rol[2]) {
            let exist = this.administradores.find(
              (x) => x.email == this.camposGenerales[3].dato
            );
            if (exist == undefined) {
              let { data } = await this.$axios.post(this.url, user);

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
          await this.cargarDatos();
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
    async agregarCategoriasNuevas(id_proveedor) {
      let url = "http://localhost:3002/api/v1/";
      for (
        let index = 0;
        index < this.categorias_seleccionadas.length;
        index++
      ) {        
        let categoriaNueva = {
          id_categoria: this.categorias_seleccionadas[index],
          id_proveedor: id_proveedor,
        };        
        this.$axios.post(url + "categorias_proveedores", categoriaNueva);
      }
    },
  },
};
</script>