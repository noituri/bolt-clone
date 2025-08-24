import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PrimaryButton from "../../components/PrimaryButton";
import { dateFormatter } from "../../utils";
import {
    sendGetAvailableRidesRequest,
    sendGetAssignedRidesRequest,
    sendAcceptRideRequest,
    sendRejectRideRequest,
    sendCompleteRideRequest,
    sendCancelByDriverNoShowRequest,
    sendCancelByDriverAfterAcceptRequest,
} from "../../api/rides";
import "./DriverHome.css";

export default function DriverHome() {
    const { user } = useAuth();
    const [available, setAvailable] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function refresh() {
        try {
            setError("");
            const [a, b] = await Promise.all([
                sendGetAvailableRidesRequest(user),
                sendGetAssignedRidesRequest(user),
            ]);
            setAvailable(Array.isArray(a) ? a : []);
            setAssigned(Array.isArray(b) ? b : []);
        } catch (e) {
            setError(e.message || "Failed to load rides");
        }
    }

    useEffect(() => {
        document.title = "Driver – Home";
        refresh();
        const id = setInterval(refresh, 5000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]);

    const onAccept = async (id) => {
        try {
            setBusy(true);
            await sendAcceptRideRequest(user, id);
            await refresh();
        } catch (e) {
            setError(e.message || "Accept failed");
        } finally {
            setBusy(false);
        }
    };

    const onReject = async (id) => {
        try {
            setBusy(true);
            await sendRejectRideRequest(user, id);
            await refresh();
        } catch (e) {
            setError(e.message || "Reject failed");
        } finally {
            setBusy(false);
        }
    };

    const onComplete = async (id) => {
        try {
            setBusy(true);
            await sendCompleteRideRequest(user, id);
            await refresh();
        } catch (e) {
            setError(e.message || "Complete failed");
        } finally {
            setBusy(false);
        }
    };

    const onNoShow = async (id) => {
        try {
            setBusy(true);
            await sendCancelByDriverNoShowRequest(user, id);
            await refresh();
        } catch (e) {
            setError(e.message || "No-show failed");
        } finally {
            setBusy(false);
        }
    };

    const onCancelAfterAccept = async (id) => {
        try {
            setBusy(true);
            await sendCancelByDriverAfterAcceptRequest(user, id);
            await refresh();
        } catch (e) {
            setError(e.message || "Cancel failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="driver-container">
            {error && <div className="driver-alert">{error}</div>}

            <section className="driver-section">
                <h2 className="driver-h2">Available ride requests</h2>
                {available.length === 0 ? (
                    <div className="driver-empty">No pending rides.</div>
                ) : (
                    <ul className="driver-list">
                        {available.map((r) => (
                            <li key={r.id} className="driver-card">
                                <div className="driver-row">
                                    <div className="driver-main">
                                        <div className="driver-route">
                                            <span className="driver-address">{r.from_address || "-"}</span>
                                            <span className="driver-arrow">→</span>
                                            <span className="driver-address">{r.to_address || "-"}</span>
                                        </div>
                                        <div className="driver-meta">
                      <span className="driver-date">
                        {r.requested_at ? dateFormatter.format(new Date(r.requested_at)) : "-"}
                      </span>
                                            <span className="driver-price">
                        {r.amount != null ? `${r.amount} PLN` : "-"}
                      </span>
                                        </div>
                                    </div>
                                    <div className="driver-actions">
                                        <PrimaryButton disabled={busy} onClick={() => onAccept(r.id)}>
                                            Accept
                                        </PrimaryButton>
                                        <PrimaryButton disabled={busy} onClick={() => onReject(r.id)}>
                                            Reject
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="driver-section">
                <h2 className="driver-h2">Assigned / Active</h2>

                {assigned.filter((r) => r.status === "accepted").length === 0 ? (
                    <div className="driver-empty">active</div>
                ) : (
                    <ul className="driver-list">
                        {assigned
                            .filter((r) => r.status === "accepted")
                            .map((r) => (
                                <li key={r.id} className="driver-card">
                                    <div className="driver-row">
                                        <div className="driver-main">
                                            <div className="driver-route">
                                                <span className="driver-address">{r.from_address || "-"}</span>
                                                <span className="driver-arrow">→</span>
                                                <span className="driver-address">{r.to_address || "-"}</span>
                                            </div>
                                            <div className="driver-meta">
                        <span className="driver-date">
                          {r.requested_at ? dateFormatter.format(new Date(r.requested_at)) : "-"}
                        </span>
                                                <span className="driver-price">
                          {r.amount != null ? `${r.amount} PLN` : "-"}
                        </span>
                                            </div>
                                        </div>

                                        <div className="driver-actions driver-actions-column">
                                            <PrimaryButton disabled={busy} onClick={() => onComplete(r.id)}>
                                                Complete
                                            </PrimaryButton>
                                            <PrimaryButton
                                                disabled={busy}
                                                onClick={() => onNoShow(r.id)}
                                                className="danger"
                                            >
                                                Client no-show
                                            </PrimaryButton>
                                            <PrimaryButton
                                                disabled={busy}
                                                onClick={() => onCancelAfterAccept(r.id)}
                                                className="danger"
                                            >
                                                Cancel ride
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </li>
                            ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
