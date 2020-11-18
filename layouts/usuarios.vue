<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <span v-if="user" class="px-1">
        {{user.nombre}} {{user.apellido}}
      </span>  
      <v-btn color="accent" to="/">Salir</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Inicio',
          to: '/usuarios/inicio-usuarios'
        },
        {
          icon: 'mdi-account-search',
          title: 'Buscar Proveedor',
          to: '/usuarios/buscar-proveedores'
        },
        {
          icon: 'mdi-account-clock',
          title: 'Reseñas pendientes',
          to: '/usuarios/resenas-pendientes'
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Red de proveedores - Clientes',
      user: null
    }
  },
  beforeMount() {
    this.cargarUsuario();
  },
  methods: {
    async cargarUsuario() {
      try {
      let token = localStorage.getItem('token');
      let url = 'http://localhost:3002/api/v1/auth/';
      this.$axios.setToken(token, 'Bearer');
      let {data} = await this.$axios.get(url);
      console.log(data.info.rol)
      switch (data.info.rol) {
        case "1":
          this.user = data.info
        break;
        case "2":     
          this.$router.push('/proveedores/inicio-proveedores');
        break;
        case "3":
          this.$router.push('/administradores/inicio-administradores');
        break;      
        default:
          break;
      }
       
      }       
      catch (error) {
        console.log(error)
        this.$router.push('/');
      }
    },
    salir() {
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
}
</script>