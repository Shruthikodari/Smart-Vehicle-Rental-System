import API, { errorMessage } from "../services/api";
import { formatDate, todayIso } from "../services/format";

// Start / end trip buttons for a driver's assigned booking; calls onChange with the updated booking
const TripActions = ({ trip, onChange }) => {
  const run = async (action, question) => {
    if (!confirm(question)) return;
    try {
      const res = await API.put(`/driver/bookings/${trip.id}/${action}`);
      onChange(res.data);
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  if (trip.status === "APPROVED") {
    return trip.pickupDate <= todayIso()
      ? <button className="btn-small start" onClick={() => run("start", `Start trip ${trip.bookingCode} with ${trip.customerName}?`)}>Start trip</button>
      : <span className="muted-text">Starts {formatDate(trip.pickupDate, false)}</span>;
  }
  if (trip.status === "ONGOING") {
    return <button className="btn-small approve" onClick={() => run("complete", `End trip ${trip.bookingCode}? Confirm the vehicle has been returned.`)}>End trip</button>;
  }
  return null;
};

export default TripActions;
