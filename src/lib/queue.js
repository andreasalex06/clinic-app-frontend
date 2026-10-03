function formatDoctorQueuePrefix(queueIndex) {
  let value = Math.max(Math.floor(queueIndex ?? 1), 1);
  let prefix = "";

  while (value > 0) {
    value -= 1;
    prefix = String.fromCharCode(65 + (value % 26)) + prefix;
    value = Math.floor(value / 26);
  }

  return prefix;
}

export function formatQueueCode(queueNumber, doctorQueueIndex) {
  if (queueNumber === null || queueNumber === undefined) {
    return "-";
  }

  return `${formatDoctorQueuePrefix(doctorQueueIndex)}-${String(queueNumber).padStart(3, "0")}`;
}
