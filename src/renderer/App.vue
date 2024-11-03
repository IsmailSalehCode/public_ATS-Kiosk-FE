<template>
  <v-app>
    <v-main>
      <v-alert
        rounded="0"
        prominent
        type="error"
        v-if="isReaderConnected === false"
        text="No NFC Reader detected!"
      >
      </v-alert>
      <EmployeeDash
        v-if="isReaderConnected === true"
        ref="employee_dash"
        @logOfflineATE="insertActivity"
      />
      <br />
      <DataTableLocalLog ref="dt_activities" :newActivity="contentActivity" />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script>
import AppFooter from "./components/AppFooter.vue";
import EmployeeDash from "./components/EmployeeDash.vue";
import DataTableLocalLog from "./components/DataTableLocalLog.vue";

export default {
  components: {
    AppFooter,
    EmployeeDash,
    DataTableLocalLog,
  },
  created() {
    window.electronAPI.onReaderConnectionStatusChanged((isConnected) => {
      this.isReaderConnected = isConnected;
    });
    window.electronAPI.onReceivedTagIdFromReader((tagId) => {
      // console.log(tagId); //i.e. 0e646590
      // this.nfcTagId = tagId;
      this.$refs.employee_dash.updateTagId(tagId);
    });
    window.electronAPI.onReceivedAlertFromReader((alert) => {
      console.log(alert);
      this.$refs.employee_dash.addAlert(alert.type, alert.message);
    });
  },
  data() {
    return {
      isReaderConnected: false,
      nfcTagId: null,
      contentActivity: null,
    };
  },
  methods: {
    insertActivity(newActivity) {
      this.contentActivity = newActivity;
    },
  },
};
</script>

<style>
.v-application {
  font-family: sans-serif, Times;
}
a:-webkit-any-link {
  text-decoration: none;
  transition: all 0.3s;
}
a:-webkit-any-link:hover {
  color: rgb(38, 172, 255);
}
</style>
