<template>
  <div v-if="isLoading === false" class="text-center">
    <v-container v-if="isWorkingWithTag">
      <v-row>
        <v-col>
          <h1>Current tag: {{ tagId }}</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <h2>Please select an action.</h2>
        </v-col>
        <v-col cols="6">
          <v-btn
            style="width: 100%"
            size="x-large"
            stacked
            prepend-icon="mdi-location-enter"
            @click="submitATE(1)"
            color="info"
            >Starting or resuming work</v-btn
          >
        </v-col>
        <v-col cols="6">
          <v-btn
            style="width: 100%"
            size="x-large"
            stacked
            prepend-icon="mdi-location-exit"
            @click="submitATE(0)"
            color="success"
            >Leaving or taking a break</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else
      ><h1>Awaiting employee badge ...</h1>
      <br/>
      <img style="border-radius: 5%;" :width="180" src="../assets/instruct-nfc-card-read.gif"></img>
    </v-container>
  </div>
  <v-expand-transition>
    <v-row no-gutters v-if="alerts.length > 0">
      <v-col v-for="alert in alerts" :key="alert.message" cols="12">
        <div>
          <v-alert rounded="0" :type="alert.type">
            <!-- writing v-html=alert.message directly in v-alert bugs the title and icon of the component. DO NOT do <v-alert v-html="..." -->
            <template v-slot:text>
              <div v-html="alert.message"></div>
            </template>
          </v-alert>
        </div>
      </v-col>
    </v-row>
  </v-expand-transition>
  <div v-if="isLoading === true" class="text-center">
    <h1>Loading... please wait.</h1>
    <br />
    <v-progress-circular
      color="blue"
      :size="70"
      :width="7"
      indeterminate
    ></v-progress-circular>
  </div>
</template>
<script>
import { determineErrMessageInAlert } from "../errHandler";
import KioskService from "../services/KioskService";
export default {
  emits: ["logOfflineATE"],
  data() {
    return {
      isLoading: false,
      alerts: [],
      tagId:null
    };
  },
  methods: {
    updateTagId(newTagId){
      this.tagId=newTagId;
      this.resetAlerts();
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.addAlert("error", msg);
    },
    addAlert(pType, pMsg) {
      this.alerts.push({
        type: pType,
        message: pMsg,
      });
    },
    resetAlerts() {
      this.alerts = [];
    },
    getTimeStringWithoutSeconds(pDate) {
      const hours = pDate.getHours().toString().padStart(2, "0");
      const minutes = pDate.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes} ч.`;
    },
    notifyIfWarning(warnIsWorkingFieldHasUnexpectedValue) {
      if (warnIsWorkingFieldHasUnexpectedValue === true) {
        const msg =
          "You made the same selection twice in a row! Contact a sys admin or your employer if you made a mistake.";
        this.addAlert("warning", msg);
      }
    },
    notifySuccess(res) {
      const empName = res.data.employee.name;
      const empOccupation = res.data.employee.occupation;
      const empTasks = res.data.employee.assignedTasks;
      const entryCreatedAt = res.data.entry.createdAt;
      const empStatus = res.data.entry.isWorking
        ? "started/resumed work"
        : "took a break";
      const dateEntryCreatedAt = new Date(entryCreatedAt);
      const localizedDateEntryCreatedAt =
        dateEntryCreatedAt.toLocaleDateString("bg");
      const localizedTimeEntryCreatedAt = this.getTimeStringWithoutSeconds(
        dateEntryCreatedAt,
        "bg"
      );
      const message = `${empName}| Occupation: ${empOccupation}</br>On ${localizedDateEntryCreatedAt} you ${empStatus} at ${localizedTimeEntryCreatedAt}</br>Your tasks: ${
        empTasks ? empTasks : "none specified."
      }`;
      this.addAlert("success", message);
      // log locally
      this.logLocally(`${empName} ${empStatus}.`);
    },
    logLocally(str) {
      this.$emit("logOfflineATE", str);
    },
    errLogATELocally(employeeTagId, goesToWork) {
      const activity = goesToWork ? "enters" : "leaves";
      const str = `[OFFLINE] Employee w/ tag ${employeeTagId} ${activity} the construction site.`;
      this.logLocally(str);
    },
    async submitATE(goesToWork) {
      this.isLoading = true;
      const tagId=this.tagId;
      // Log ATE online
      try {
        const res = await KioskService.postATE({
          goes_to_work: goesToWork,
          tag_id: tagId,
        });
        if (res.status == 200) {
          this.notifySuccess(res);
          this.notifyIfWarning(res.data.warnIsWorkingFieldHasUnexpectedValue);
        }
      } catch (err) {
          this.handleErr(err);
          // Log ATE locally in case of accidental server unavailability.
          this.errLogATELocally(tagId, goesToWork);
      } finally {
        this.isLoading = false;
        this.clearCurrentNfcTagId();
      }
    },
    clearCurrentNfcTagId() {
      this.tagId = null;
    },
  },
  computed: {
    isWorkingWithTag() {
      if (this.tagId===null) {
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>
