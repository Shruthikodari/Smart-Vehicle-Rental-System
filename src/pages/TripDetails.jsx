import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { formatDate, rupees, titleCase } from "../services/format";
import DriverLayout from "../components/DriverLayout";
import TripActions from "../components/TripActions";
import StatusTimeline from "../components/StatusTimeline";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/driver/bookings/${id}`)
      .then(res => setTrip(res.data))
      .catch(err => setError(errorMessage(err, "Could not load this trip")));
  }, [id]);

  if (error) return <DriverLayout title="Trip details"><div className="form-error">{error}</div></DriverLayout>;
  if (!trip) return <DriverLayout title="Trip details"><p>Loading...</p></DriverLayout>;

  return (
    <DriverLayout
      title={`${trip.vehicleName} · ${trip.bookingCode}`}
      subtitle={`${formatDate(trip.pickupDate)} – ${formatDate(trip.returnDate)}`}
      actions={<button className="btn-small" onClick={() => navigate("/driver/bookings")}>← All trips</button>}
    >
      <div className="two-col">
        <section className="admin-section">
          <div className="section-header">
            <h2>Trip</h2>
            <span className={`status-badge ${trip.status.toLowerCase()}`}>{titleCase(trip.status)}</span>
          </div>
          <StatusTimeline status={trip.status} />
          <dl className="detail-list">
            <dt>Vehicle</dt><dd>{trip.vehicleName}</dd>
            <dt>Pick-up location</dt><dd>{trip.pickupLocation}</dd>
            <dt>Pick-up date</dt><dd>{formatDate(trip.pickupDate)}</dd>
            <dt>Return date</dt><dd>{formatDate(trip.returnDate)}</dd>
            <dt>Duration</dt><dd>{trip.days} day{trip.days === 1 ? "" : "s"}</dd>
          </dl>
          <div className="trip-actions" style={{ marginTop: 16 }}>
            <TripActions trip={trip} onChange={setTrip} />
          </div>
        </section>

        <section className="admin-section">
          <h2>Customer</h2>
          <dl className="detail-list">
            <dt>Name</dt><dd>{trip.customerName}</dd>
            <dt>Phone</dt><dd><a href={`tel:${trip.customerPhone}`}>{trip.customerPhone}</a></dd>
            <dt>Email</dt><dd>{trip.customerEmail}</dd>
          </dl>
          <h2 style={{ marginTop: 20 }}>Payment</h2>
          <dl className="detail-list">
            <dt>Your fee</dt><dd>{rupees(trip.driverCost)} ({trip.days} × ₹500)</dd>
            <dt>Customer pays</dt><dd>{rupees(trip.total)} by {trip.paymentMethod}</dd>
            <dt>Payment status</dt><dd>{titleCase(trip.paymentStatus)}{trip.paymentMethod === "CASH" && trip.paymentStatus === "PENDING" ? " (collect at pickup)" : ""}</dd>
          </dl>
        </section>
      </div>
    </DriverLayout>
  );
};

export default TripDetails;
