import Dexie from "dexie";

export const db = new Dexie("AttendanceDB");
db.version(1).stores({
  activities: "++id,date,time,content",
});
