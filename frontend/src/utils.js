export const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "short",
  timeStyle: "long",
  timeZone: "Europe/Warsaw",
});

export function getUserReadableRideStatus(status) {
  if (status === "pending") {
    return "Looking for a driver";
  } else if (status === "assigned") {
    return "Waiting for the driver to accept";
  } else if (status === "accepted") {
    return "Your ride was accepted by the driver";
  } else if (status === "completed") {
    return "Ride completed";
  } else if (status === "canceled") {
    return "Ride canceled";
  } else {
    return "Unknown status: " + status;
  }
}
