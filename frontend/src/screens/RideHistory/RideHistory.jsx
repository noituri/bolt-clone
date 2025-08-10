import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import { useState } from "react";
import { sendGetRideHistoryRequest } from "../../api/rides";
import "./RideHistory.css";
import { dateFormatter, getUserReadableRideStatus } from "../../utils";

function RideHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState();

  useEffect(() => {
    document.title = "Ride History";
    sendGetRideHistoryRequest(user).then(setHistory);
  }, [user, setHistory]);

  const historyList =
    history?.map((entry) => <HistoryEntry entry={entry} key={entry.id} />) ??
    [];

  return (
    <>
      <Navbar active="Ride History" />
      <table className="ride-history-list">
        <thead>
          <tr className="ride-history-entry">
            <th>Pickup -&gt; Destination</th>
            <th>Date</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{historyList}</tbody>
      </table>
    </>
  );
}

function HistoryEntry({ entry }) {
  return (
    <tr className="ride-history-entry">
      <td>
        {entry.from_address} -&gt; {entry.to_address}
      </td>
      <td>{dateFormatter.format(new Date(entry.requested_at))}</td>
      <td>${entry.amount}</td>
      <td>{getUserReadableRideStatus(entry.status)}</td>
    </tr>
  );
}

export default RideHistory;
