export default function registrarUsuario({ route, isAdmin }) {
    console.log(route.path)    
    if (route.path === '/registro-usuarios') {
        isAdmin = false
    } else { 
        isAdmin = true
    }

}