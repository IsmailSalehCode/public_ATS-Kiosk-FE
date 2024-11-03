import Api from "./Api";
const kioskId = window.electronAPI.KIOSK_ID;
const qparamKioskId = `kiosk_id=${kioskId}`;
export default {
  postATE(body) {
    return Api().post(`insert-attendance-entry?${qparamKioskId}`, body);
  },
  getStartUpVars() {
    return Api().get(`get-startup-vars?${qparamKioskId}`);
  },
};
