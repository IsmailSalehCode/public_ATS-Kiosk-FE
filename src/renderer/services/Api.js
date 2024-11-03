import axios from "axios";
// there is a new software build for each kiosk where the kiosk id is hard-coded.
export default () => {
  const url = window.electronAPI.BASE_URL;
  return axios.create({
    baseURL: url || "http://localhost:8098/",
  });
};
