import { db } from "./db";

function logErr(err) {
  window.electronAPI.addLog(err);
}

async function reinitTable(tableName) {
  try {
    const result = await db.table(tableName).clear();
    return result;
  } catch (err) {
    logErr(err);
    return err;
  }
}

async function reinitActivities() {
  await reinitTable("activities");
}

function getCurrentDate() {
  const currentDate = new Date();
  // Extracting date components
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding leading zero if needed
  const day = ("0" + currentDate.getDate()).slice(-2); // Adding leading zero if needed
  // Returning ISO formatted date
  // return `${year}-${month}-${day}`;
  return currentDate.toLocaleDateString("bg");
}

function getCurrentTime() {
  const currentTime = new Date();
  const hours = ("0" + currentTime.getHours()).slice(-2);
  const minutes = ("0" + currentTime.getMinutes()).slice(-2);
  // const seconds = ("0" + currentTime.getSeconds()).slice(-2);
  // Returning formatted time
  return `${hours}:${minutes}`;
}

async function getActivities() {
  try {
    const activities = await db.activities.toArray();
    return activities;
  } catch (err) {
    logErr(err);
    return err;
  }
}

async function addNewActivity(data) {
  const currDT = getCurrentDate();
  const currTime = getCurrentTime();
  try {
    await db.activities.add({
      date: currDT,
      time: currTime,
      content: data,
    });
  } catch (err) {
    logErr(err);
    return err;
  }
}

async function deleteActivites(ids) {
  try {
    const result = await db.activities.bulkDelete(ids);
    return result;
  } catch (err) {
    logErr(err);
    return err;
  }
}

export { getActivities, addNewActivity, deleteActivites, reinitActivities };
