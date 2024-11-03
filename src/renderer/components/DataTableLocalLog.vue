<template>
  <!-- Offline logging of activities -->
  <v-container fluid>
    <h3>Activities' local log for {{ kioskName }}</h3>
    <div v-if="alert.show">
      <v-alert :type="alert.type">{{ alert.message }}</v-alert>
    </div>
    <v-data-table
      density="compact"
      :loading="isLoading"
      :headers="activityHeaders"
      :items="activities"
      page-text="{0}-{1} of {2}"
      :sort-by="sortBy"
    ></v-data-table>
  </v-container>
</template>
<script>
import {
  getActivities,
  addNewActivity,
  reinitActivities,
} from "../dexie/dbController";
import { determineErrMessageInAlert } from "../errHandler";
import KioskService from "../services/KioskService";
export default {
  props: { newActivity: String },
  async mounted() {
    this.isLoading = true;
    try {
      const res = await KioskService.getStartUpVars();
      this.kioskName = res.data.name;
      const shouldResetLocalDBOnStartup = res.data.shouldResetLocalDBOnStartup;
      if (shouldResetLocalDBOnStartup === 1) {
        this.resetTable();
      } else {
        this.getActs();
      }
    } catch (err) {
      this.handleErr(err);
    } finally {
      this.isLoading = false;
    }
  },
  watch: {
    newActivity(newValue, oldValue) {
      if (newValue != null && newValue !== oldValue) {
        this.insertNewActivity(newValue);
      }
    },
  },
  data() {
    return {
      kioskName: "...",
      isLoading: true,
      activities: [],
      activityHeaders: [
        {
          title: "ID",
          align: "start",
          key: "id",
          width: "9%",
        },
        {
          title: "Date",
          key: "date",
          width: "10%",
        },
        {
          title: "Time",
          key: "time",
          width: "9%",
        },
        {
          title: "Event",
          key: "content",
          width: "72%",
        },
      ],
      sortBy: [{ key: "id", order: "desc" }],
      alert: {
        show: false,
        type: "info",
        message: null,
      },
    };
  },
  methods: {
    async resetTable() {
      const result = await reinitActivities();
      if (result instanceof Error) {
        this.handleErr(result);
      } else {
        await this.getActs();
      }
    },
    async insertNewActivity(data) {
      this.isLoading = true;
      const result = await addNewActivity(data);
      if (result instanceof Error) {
        this.handleErr(result);
      } else {
        await this.getActs();
      }
      this.isLoading = false;
    },
    resetAlert() {
      this.alert = {
        show: false,
        type: "info",
        message: null,
      };
    },
    showAlert(pType, pMsg) {
      this.alert = {
        show: true,
        type: pType,
        message: pMsg,
      };
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
    async getActs() {
      this.isLoading = true;
      this.resetAlert();
      try {
        this.activities = await getActivities();
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
