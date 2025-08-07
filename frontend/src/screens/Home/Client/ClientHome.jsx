import { useState } from "react";
import InputField from "../../../components/InputField";
import PrimaryButton from "../../../components/PrimaryButton";
import "./ClientHome.css";
import {
  sendCancelRideRequest,
  sendGetRideHistoryRequest,
  sendRequestRideRequest,
} from "../../../api/rides";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect } from "react";
import { dateFormatter } from "../../../utils";

// TODO: Verify inputs
// TODO: Payment
function ClientHome() {
  const { user } = useAuth();
  const [activeRide, setActiveRide] = useState();

  useEffect(() => {
    getActiveRide(user).then((ride) => setActiveRide(ride));
  }, [user]);

  const onRideCancel = () => {
    setActiveRide(undefined);
    getActiveRide(user).then((ride) => setActiveRide(ride));
  };

  if (activeRide) {
    return (
      <ActiveRideScreen ride={activeRide} user={user} onCancel={onRideCancel} />
    );
  }
  return <RequestRideScreen user={user} setActiveRide={setActiveRide} />;
}

function ActiveRideScreen({ ride, user, onCancel }) {
  const getStatusText = () => {
    if (ride.status === "pending") {
      return "Looking for a driver";
    } else if (ride.status === "assigned") {
      return "Waiting for the driver to accept";
    } else if (ride.status === "accepted") {
      return "Your ride was accepted by the driver";
    } else {
      return "Unknown status: " + ride.status;
    }
  };

  const cancelRide = async () => {
    await sendCancelRideRequest(user, ride.id);
    onCancel();
  };

  return (
    <div className="home-container">
      <div className="active-ride-card">
        <h1>Your ride</h1>
        <p>
          {ride.from_address} -&gt; {ride.to_address}{" "}
        </p>
        <p>Requested at {dateFormatter.format(ride.requested)}</p>
        <p>{getStatusText()}</p>
        <PrimaryButton onClick={cancelRide}>Cancel</PrimaryButton>
      </div>
    </div>
  );
}

function RequestRideScreen({ user, setActiveRide }) {
  const [error, setError] = useState("");

  const onRequest = async (data) => {
    setError("");
    const pickup = data.get("pickup");
    const destination = data.get("destination");

    try {
      const response = await sendRequestRideRequest(
        user,
        pickup,
        destination,
        20,
      );
      console.log(response);
      setActiveRide(response.ride);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="home-container">
      <h1>Request a ride</h1>
      <form className="" action={onRequest}>
        <div className="ride-request-form">
          <InputField placeholder="Pickup location" name="pickup" />
          <InputField placeholder="Destination" name="destination" />
        </div>
        <PrimaryButton type="submit">Request</PrimaryButton>
      </form>
    </div>
  );
}

async function getActiveRide(user) {
  const rides = await sendGetRideHistoryRequest(user);
  for (const ride of rides) {
    if (ride.status !== "completed" && ride.status !== "canceled") {
      return ride;
    }
  }
}

export default ClientHome;
