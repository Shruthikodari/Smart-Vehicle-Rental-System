// Small display helpers shared by customer, admin and driver pages

export const formatDate = (iso, withYear = true) =>
  new Date(iso).toLocaleDateString("en-IN", withYear
    ? { day: "numeric", month: "short", year: "numeric" }
    : { day: "numeric", month: "short" });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const rupees = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

// "APPROVED" -> "Approved"
export const titleCase = (s = "") => s.charAt(0) + s.slice(1).toLowerCase();

export const driverLabel = (b) =>
  b.driverType === "SELF_DRIVE" ? "Self-drive" : `${b.driverName || "Driver"} (${b.driverPhone || "-"})`;

export const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} hours ago`;
  return `${Math.round(mins / (60 * 24))} days ago`;
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const daysUntil = (date) =>
  Math.round((new Date(date) - new Date(todayIso())) / (24 * 60 * 60 * 1000));

export const downloadReceipt = (b) => {
  const lines = [
    "SMARTRIDE - RENTAL RECEIPT",
    "==========================",
    `Booking ID     : ${b.bookingCode}`,
    `Customer       : ${b.customerName} (${b.customerEmail})`,
    `Vehicle        : ${b.vehicleName}`,
    `Pickup         : ${b.pickupLocation}`,
    `Dates          : ${b.pickupDate} to ${b.returnDate} (${b.days} days)`,
    `Driver         : ${driverLabel(b)}`,
    "",
    `Base price     : Rs. ${b.basePrice}`,
    `Driver charges : Rs. ${b.driverCost}`,
    `Taxes (5%)     : Rs. ${b.taxes}`,
    `TOTAL          : Rs. ${b.total}`,
    "",
    `Payment        : ${b.paymentMethod} - ${b.paymentStatus}`,
    `Transaction ID : ${b.transactionId || "-"}`,
    `Status         : ${b.status}`,
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${b.bookingCode}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
