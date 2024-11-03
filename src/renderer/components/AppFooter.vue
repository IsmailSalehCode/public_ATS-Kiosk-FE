<template>
  <v-footer bottom absolute app theme="dark">
    <v-col>
      <v-row justify="center">
        <v-col
          cols="12"
          style="
            text-align: center;
            text-wrap: balance;
            letter-spacing: 2px;
            font-size: smaller;
          "
        >
          Version {{ appVersion }} - {{ appBrand }}
        </v-col>
      </v-row>
    </v-col>
  </v-footer>
</template>
<script>
export default {
  data() {
    return {
      appVersion: VITE_APP_VERSION,
      appBrand: "BSI Ltd.",
    };
  },
};
</script>
