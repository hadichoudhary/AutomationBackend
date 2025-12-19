const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

module.exports = function cronToReadable(cron) {
  if (!cron) return { day: "-", time: "-" };

  const [minute, hour, , , dayField] = cron.split(" ");

  const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  let day = "Every day";

  if (dayField !== "*") {
    if (dayField.includes(",")) {
      day = dayField
        .split(",")
        .map((d) => DAYS[Number(d)])
        .join(", ");
    } else {
      day = DAYS[Number(dayField)];
    }
  }

  return { day, time };
};
