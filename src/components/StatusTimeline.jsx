import "../styles/timeline.css";

const STEPS = [
  { status: "PENDING", label: "Requested" },
  { status: "APPROVED", label: "Approved" },
  { status: "ONGOING", label: "Ongoing" },
  { status: "COMPLETED", label: "Completed" },
];

// Shows where a booking is in its lifecycle: Requested → Approved → Ongoing → Completed
const StatusTimeline = ({ status }) => {
  if (status === "REJECTED" || status === "CANCELLED") {
    return (
      <div className="timeline">
        <div className="timeline-step done"><span className="dot">✓</span><span>Requested</span></div>
        <div className="timeline-line" />
        <div className="timeline-step stopped"><span className="dot">✕</span><span>{status === "REJECTED" ? "Rejected" : "Cancelled"}</span></div>
      </div>
    );
  }

  const current = STEPS.findIndex(s => s.status === status);
  return (
    <div className="timeline">
      {STEPS.map((step, i) => (
        <div key={step.status} className="timeline-group">
          {i > 0 && <div className={`timeline-line ${i <= current ? "done" : ""}`} />}
          <div className={`timeline-step ${i < current || status === "COMPLETED" ? "done" : i === current ? "current" : ""}`}>
            <span className="dot">{i < current || status === "COMPLETED" ? "✓" : i + 1}</span>
            <span>{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;
