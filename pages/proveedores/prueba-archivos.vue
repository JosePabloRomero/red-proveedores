<template >
<div>
    <h1>Modulo de archivos</h1>
    
  <v-container>
      <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="archivo"
              :rules="fieldRequired"
              label="Archivo"
              required
            ></v-text-field>
          </v-col>

    

        
    

    
    
        <template slot="item.archivo" slot-scope="{ item }">
        <a :href="item.archivo" target="blank">Abrir imagen</a>
      </template>


   

   
    

    
   
      </v-row>
  </v-container>
    
</div>


</template>




<script>
export default {
  data() {
    return {
      headers: [
        { text: "archivo", value: "tipo archivo pdf", sortable: false },
      ],
    };
  }
 
};


</script>



