import { useEffect, useMemo, useRef, useState } from "react";
import InputField from "../../../components/InputField";
import PrimaryButton from "../../../components/PrimaryButton";
import "./ClientHome.css";
import {
  sendCancelRideRequest,
  sendGetRideHistoryRequest,
  sendRequestRideRequest,
  sendRouteInfoRequest,
} from "../../../api/rides";
import { useAuth } from "../../../hooks/useAuth";
import { dateFormatter, getUserReadableRideStatus } from "../../../utils";

import { MapContainer, TileLayer, Marker, Polyline, Rectangle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function showNotification(msg) {
  toast.error(msg, { position: "top-right", autoClose: 5000 });
}


//Marker icons 
const pickupIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});
const destIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

//Nominatim helpers (reverse + search)
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=pl`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "bolt-clone-demo/1.0",
    },
  });
  const data = await res.json();
  return data?.display_name || "";
}

async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=jsonv2&addressdetails=1&limit=5&accept-language=pl`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "bolt-clone-demo/1.0",
    },
  });
  const data = await res.json();
  return (data || []).map((r) => ({
    label: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));
}

//  debouncer
function useDebouncedCallback(cb, delay) {
  const t = useRef(null);
  return (...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => cb(...args), delay);
  };
}

// Komponent zbierający kliknięcia na mapie (z refem do activeField)
function ClickPicker({ activeField, onPick }) {
  const fieldRef = useRef(activeField);
  useEffect(() => {
    fieldRef.current = activeField;
  }, [activeField]);

  useMapEvents({
    click: (e) => {
      onPick(fieldRef.current, e.latlng);
    },
  });

  return null;
}

function ClientHome() {
  const { user } = useAuth();
  const [activeRide, setActiveRide] = useState();

  const [shownCancellationIds, setShownCancellationIds] = useState(new Set());
  const shownCancellationIdsRef = useRef(shownCancellationIds);

  useEffect(() => {
    shownCancellationIdsRef.current = shownCancellationIds;
  }, [shownCancellationIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      getActiveRide(user, shownCancellationIdsRef.current, setShownCancellationIds)
        .then((ride) => setActiveRide(ride));
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const onRideCancel = () => {
    setActiveRide(undefined);
    getActiveRide(user, shownCancellationIdsRef.current, setShownCancellationIds)
      .then((ride) => setActiveRide(ride));
  };

  if (activeRide) {
    return <ActiveRideScreen ride={activeRide} user={user} onCancel={onRideCancel} />;
  }
  return (
    <>
      <RequestRideScreen user={user} setActiveRide={setActiveRide} />
      <ToastContainer />
    </>
  );
}


function ActiveRideScreen({ ride, user, onCancel }) {
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
        <p>Requested at {dateFormatter.format(new Date(ride.requested_at))}</p>
        <p>{getUserReadableRideStatus(ride.status)}</p>
        <PrimaryButton onClick={cancelRide}>Cancel</PrimaryButton>
      </div>
    </div>
  );
}

function RequestRideScreen({ user, setActiveRide }) {
  // Pola / aktywne pole
  const [activeField, setActiveField] = useState("pickup"); 
  const [pickupAddress, setPickupAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [routeLine, setRouteLine] = useState([]);
  const [distanceM, setDistanceM] = useState(null);
  const [durationS, setDurationS] = useState(null);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("card");

  // Granice mapy 
  const maxBounds = useMemo(
    () => [
      [49.0, 14.0], // SW
      [55.0, 24.5], // NE
    ],
    []
  );

  // Debounce dla podpowiedzi
  const debouncedSearchPickup = useDebouncedCallback(async (q) => {
    setPickupSuggestions(await searchAddress(q));
  }, 300);

  const debouncedSearchDest = useDebouncedCallback(async (q) => {
    setDestSuggestions(await searchAddress(q));
  }, 300);

  const handlePickOnMap = async (field, ll) => {
    if (field === "pickup") {
      setPickupCoords(ll);
      const addr = await reverseGeocode(ll.lat, ll.lng);
      setPickupAddress(addr);
      setPickupSuggestions([]);
    } else {
      setDestCoords(ll);
      const addr = await reverseGeocode(ll.lat, ll.lng);
      setDestAddress(addr);
      setDestSuggestions([]);
    }
  };

  const onPickupChange = (e) => {
    const v = e.target.value;
    setPickupAddress(v);
    debouncedSearchPickup(v);
  };
  const onDestChange = (e) => {
    const v = e.target.value;
    setDestAddress(v);
    debouncedSearchDest(v);
  };

  const choosePickupSuggestion = (s) => {
    setPickupAddress(s.label);
    setPickupCoords({ lat: s.lat, lng: s.lng });
    setPickupSuggestions([]);
  };
  const chooseDestSuggestion = (s) => {
    setDestAddress(s.label);
    setDestCoords({ lat: s.lat, lng: s.lng });
    setDestSuggestions([]);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setError("");
        setRouteLine([]);
        setDistanceM(null);
        setDurationS(null);
        setAmount(null);

        if (!pickupCoords || !destCoords) return;

        const data = await sendRouteInfoRequest(user, pickupCoords, destCoords);
        setDistanceM(data.distance ?? null);
        setDurationS(data.duration ?? null);
        setAmount(data.amount ?? null);

        if (data.geometry && data.geometry.coordinates) {
          const line = data.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          setRouteLine(line);
        }
      } catch (e) {
        setError(e.message || "Failed to load route info");
      }
    };

    fetchRoute();
  }, [pickupCoords, destCoords, user]);

  // request przejazdu
  const onRequest = async (e) => {
    e.preventDefault();
    setError("");
    try { 
      if (!pickupCoords || !destCoords || !pickupAddress || !destAddress) {
        setError("Please select both addresses.");
        return;
      }
      const response = await sendRequestRideRequest(
        user,
        pickupAddress,
        destAddress,
        pickupCoords,
        destCoords,
        paymentMethod 
      );
      setActiveRide(response.ride);
    } catch (e) {
      setError(e.message || "Failed to request ride");
    }
  };


  const durationMin = durationS != null ? Math.round(durationS / 60) : null;
  const distanceKm = distanceM != null ? (distanceM / 1000).toFixed(2) : null;

  return (
    <div className="home-container">
      <h1>Request a ride</h1>
      {error !== "" && <p className="error-color">{error}</p>}

      <form className="ride-form" onSubmit={onRequest}>
        <div className="ride-request-form">
          <div
            className="input-with-suggestions"
            onMouseDown={() => setActiveField("pickup")}
            onFocus={() => setActiveField("pickup")}
            tabIndex={-1}
          >
            <InputField
              placeholder="Pickup location"
              name="pickup"
              value={pickupAddress}
              onChange={onPickupChange}
            />
            {pickupSuggestions.length > 0 && (
              <ul className="suggestions">
                {pickupSuggestions.map((s, i) => (
                  <li key={`p-${i}`} onMouseDown={() => choosePickupSuggestion(s)}>
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="input-with-suggestions"
            onMouseDown={() => setActiveField("destination")}
            onFocus={() => setActiveField("destination")}
            tabIndex={-1}
          >
            <InputField
              placeholder="Destination"
              name="destination"
              value={destAddress}
              onChange={onDestChange}
            />
            {destSuggestions.length > 0 && (
              <ul className="suggestions">
                {destSuggestions.map((s, i) => (
                  <li key={`d-${i}`} onMouseDown={() => chooseDestSuggestion(s)}>
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="payment-method">
          <label htmlFor="payment">Payment method:</label>
          <select
            id="payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div className="map-wrapper">
          <MapContainer
            center={[52.2297, 21.0122]}
            zoom={12}
            style={{ height: "420px", width: "100%" }}
            maxBounds={maxBounds}
            maxBoundsViscosity={1.0}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <ClickPicker activeField={activeField} onPick={handlePickOnMap} />

            <Rectangle bounds={maxBounds} pathOptions={{ weight: 1 }} />

            {pickupCoords && <Marker position={pickupCoords} icon={pickupIcon} />}
            {destCoords && <Marker position={destCoords} icon={destIcon} />}

            {routeLine.length > 0 && <Polyline positions={routeLine} />}
          </MapContainer>
        </div>

        <div className="route-stats">
          <div><strong>Distance:</strong> {distanceKm ? `${distanceKm} km` : "-"}</div>
          <div><strong>Duration:</strong> {durationMin != null ? `${durationMin} min` : "-"}</div>
          <div><strong>Estimated price:</strong> {amount != null ? `${amount} PLN` : "-"}</div>
        </div>

        <PrimaryButton type="submit" disabled={!pickupCoords || !destCoords}>
          Request ride
        </PrimaryButton>
      </form>

      <p className="nominatim-note">
        Search powered by OpenStreetMap Nominatim (for demo purposes).
      </p>
    </div>
  );
}

async function getActiveRide(user, shownCancellationIds, setShownCancellationIds) {
  const rides = await sendGetRideHistoryRequest(user);

  for (const ride of rides) {
    if (ride.status === "canceled" && ride.cancellation_reason && !shownCancellationIds.has(ride.id)) {
      switch (ride.cancellation_reason) {
        case "no_driver":
          showNotification("❌ Your ride was canceled because no drivers were available.");
          break;
        case "driver_cancelled":
          showNotification("❌ Your driver canceled the ride.");
          break;
        case "client_no_show":
          showNotification("❌ Ride canceled: you did not show up.");
          break;
        default:
          showNotification("❌ Ride was canceled.");
      }
      setShownCancellationIds(prev => new Set(prev).add(ride.id));
    }
  }

  for (const ride of rides) {
    if (ride.status !== "completed" && ride.status !== "canceled") {
      return ride;
    }
  }

  return undefined;
}




export default ClientHome;
