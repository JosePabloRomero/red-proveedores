<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1>Bienvenido a la aplicación red de proveedores</h1>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col sm="7">
        <v-card class="mt-6">
          <v-card-title class="secondary justify-center">
            Ingresar a la aplicación
          </v-card-title>
          <v-card-text class="pa-4 pb-0">
            <v-form v-model="formLogin" ref="formLogin" lazy-validation>
              <v-select
                :items="rol"
                v-model="rolSeleccionado"
                prepend-icon="mdi-account"
                label="Seleccione un rol"
                :rules="fieldRequired"
                required
              ></v-select>
              <v-text-field
                label="Correo"
                prepend-icon="mdi-email-open"
                type="email"
                :rules="emailRules"
                v-model="email"
              ></v-text-field>

              <v-text-field
                label="Contraseña"
                prepend-icon="mdi-lock"
                type="password"
                :rules="fieldRequired"
                v-model="password"
              ></v-text-field>
              <v-btn color="orange" @click="ingresar"> Ingresar </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="text--primary mt-0">
            <div>
              ¿Aun no tienes una cuenta?
              <v-btn color="orange" to="/usuarios/registro-usuarios" text>
                Registrate
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar">
      {{ mensaje }}
      <v-btn color="pink" text @click="snackbar = false"> Cerrar </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  layout: "blank",
  beforeMount() {
    this.obtenerUsuarios();
    let url = "http://localhost:3002/usuario-ingresado";   
    this.$axios.get(url).then((response) => {
      let data = response.data;      
      this.usuarioPrevio = data
      if(data && data.length !== 0) {
          this.idUsuarioPrevio = data[0].id      
          this.$axios
          .delete(url + `/${this.idUsuarioPrevio}`)
          .then((response) => {});
      }      
    }).catch(error => {
      console.log(error)
    })
  },
  data() {
    return {
      formLogin: true,
      rol: ["Proveedor", "Usuario", "Administrador"],
      rolSeleccionado: null,
      email: null,
      password: null,
      proveedores: [],
      usuarios: [],
      administradores: [],
      snackbar: false,
      mensaje: "",
      usuario: undefined,
      urlNuevaDireccion: "/",
      usuarioPrevio: undefined,
      idUsuarioPrevio: "",
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      emailRules: [
        (v) => !!v || "El e-mail es requerido",
        (v) => /.+@.+/.test(v) || "El e-mail debe de ser valido",
      ],
    };
  },
  methods: {
    obtenerUsuarios() {
      let url = `http://localhost:3002/proveedores`;
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.proveedores = data;
      });
      url = `http://localhost:3002/usuarios`;
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.usuarios = data;
      });
      url = `http://localhost:3002/administradores`;
      this.$axios.get(url).then((response) => {
        let data = response.data;
        this.administradores = data;       
      }); 
    },
    ingresarUsuario() {
      let url = "http://localhost:3002/usuario-ingresado";
      let user = {
        id: this.usuario.id,
        rol: this.rolSeleccionado.toLowerCase(),
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
      };     
      this.$axios.post(url, user).then((response) => {});
      this.$router.push(this.urlNuevaDireccion); 
    },
    ingresar() {
      if (this.$refs.formLogin.validate() && this.formLogin) {
        this.obtenerUsuarios();

        switch (this.rolSeleccionado) {
          case this.rol[0]:
            this.usuario = this.proveedores.find((x) => x.email === this.email);
            this.urlNuevaDireccion = "/proveedores/inicio-proveedores";
            break;
          case this.rol[1]:
            this.usuario = this.usuarios.find((x) => x.email === this.email);
            this.urlNuevaDireccion = "/usuarios/inicio-usuarios";
            break;
          case this.rol[2]:
            this.usuario = this.administradores.find((x) => x.email === this.email);
            this.urlNuevaDireccion = '/administradores/inicio-administradores'
            break; 
          default:
            break;
        }

        if (this.usuario !== undefined) {
          if (this.usuario.password === this.password) {
            //Ingresamos el usuario a la app con su rol
            this.ingresarUsuario();
          } else {
            this.mensaje = "La contraseña es incorrecta";
            this.snackbar = true;
          }
        } else {
          this.mensaje = `No encontramos un ${this.rolSeleccionado} correspondiente a ese correo`;
          this.snackbar = true;
        }
      }
    },
  },
};
</script>
