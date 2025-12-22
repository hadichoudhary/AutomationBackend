const cronToReadable = (cron) => {
  if (!cron || typeof cron !== "string") {
    return { day: "Every day", time: "00:00" };
  }

  const parts = cron.trim().split(" ");
  if (parts.length !== 5) {
    return { day: "Every day", time: "00:00" };
  }

  const [minute, hour, , , dow] = parts;

  // Time (NO DEFAULTS)
  const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  // Day
  let day = "Every day";
  if (dow !== "*") {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    day = days[Number(dow)] || "Every day";
  }

  return { day, time };
};

module.exports = cronToReadable;
