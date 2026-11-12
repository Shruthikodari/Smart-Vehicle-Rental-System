import { useState } from "react";
import API, { errorMessage } from "../services/api";

// Name / phone (and optionally licence) form; `url` is /me/profile for customers or /driver/profile for drivers
export const DetailsForm = ({ url, initial, withLicense, onSaved }) => {
  const [form, setForm] = useState({ name: initial.name || "", phone: initial.phone || "", licenseNumber: initial.licenseNumber || "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await API.put(url, form);
      onSaved(res.data);
      setMessage({ type: "ok", text: "Details saved." });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err, "Could not save your details") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="profile-form">
      <label>Full name</label>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <label>Mobile number</label>
      <input value={form.phone} maxLength="10" onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
      {withLicense && (
        <>
          <label>Driving licence number</label>
          <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
        </>
      )}
      <label>Email</label>
      <input value={initial.email || ""} disabled />
      {message.text && <p className={`note ${message.type === "ok" ? "note-ok" : "note-error"}`}>{message.text}</p>}
      <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save details"}</button>
    </form>
  );
};

// Change password form; `url` is /me/password or /driver/password
export const PasswordForm = ({ url }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const save = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setMessage({ type: "error", text: "New passwords don't match" });
      return;
    }
    try {
      await API.put(url, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setMessage({ type: "ok", text: "Password changed." });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err, "Could not change password") });
    }
  };

  return (
    <form onSubmit={save} className="profile-form">
      <label>Current password</label>
      <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      <label>New password</label>
      <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      <label>Confirm new password</label>
      <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
      {message.text && <p className={`note ${message.type === "ok" ? "note-ok" : "note-error"}`}>{message.text}</p>}
      <button className="btn-secondary">Change password</button>
    </form>
  );
};
