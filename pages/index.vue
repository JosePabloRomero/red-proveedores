<template>
  <v-container>
    <v-row>
      <v-col class="primary" align="center">
        <h1 class="white--text">Bienvenido a la aplicación red de proveedores</h1>
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
                label="Seleccione un rol *"
                :rules="fieldRequired"
                required
              ></v-select>
              <v-text-field
                label="Correo *"
                prepend-icon="mdi-email-open"
                type="email"
                :rules="emailRules"
                v-model="email"
              ></v-text-field>

              <v-text-field
                label="Contraseña *"
                prepend-icon="mdi-lock"
                type="password"
                :rules="fieldRequired"
                v-model="clave"
              ></v-text-field>
              <v-btn color="accent" @click="ingresar"> Ingresar </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="text--primary mt-0">
            <div>
              ¿Aún no tienes una cuenta?
              <v-btn color="accent" to="/usuarios/registro-usuarios" text>
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
  data() {
    return {
      formLogin: true,
      rol: ["Usuario", "Proveedor", "Administrador"],
      rolSeleccionado: null,
      email: null,
      clave: null,
      snackbar: false,
      mensaje: "",
      url: "http://localhost:3002/api/v1/login/",
      urlPush: "/",
      fieldRequired: [(v) => !!v || "Este campo es requerido"],
      emailRules: [
        (v) => !!v || "El e-mail es requerido",
        (v) => /.+@.+/.test(v) || "El e-mail debe de ser valido",
      ],
    };
  },
  methods: {
    async ingresar() {
      if (this.$refs.formLogin.validate() && this.formLogin) {
        switch (this.rolSeleccionado) {
          case this.rol[0]:
            this.url += 1;
            this.urlPush = "/usuarios/inicio-usuarios";
            break;
          case this.rol[1]:
            this.url += 2;
            this.urlPush = "/proveedores/inicio-proveedores";
            break;
          case this.rol[2]:
            this.url += 3;
            this.urlPush = "/administradores/inicio-administradores";
            break;
          default:
            break;
        }
        try {
          let payload = {};
          payload.email = this.email;
          payload.clave = this.clave;
          let {data} = await this.$axios.post(this.url, payload);
          if(data.ok) {            
            localStorage.setItem('token', data.info);
            this.$router.push(this.urlPush);
          } else {
            this.$swal.fire({
              icon: "error",
              title: "Ocurrió un error!",
              text: data.message,
            });
          }
        } catch (error) {
          if (error.response) {
            this.$swal.fire({
              icon: "error",
              title: "Ocurrió un error!",
              text: error.response.data.message,
            });
          } else {
              this.$swal.fire({
              icon: "error",
              title: "Ocurrió un error!",
              text: error,
            });
          }
        }
      }
    },
  },
};
</script>
