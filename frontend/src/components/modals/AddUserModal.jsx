import React, { useState } from "react";
import { X } from "lucide-react";
import { userService } from "../../services/userService";

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      await userService.createUser(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {/* Fields */}
        <div className="space-y-3">
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <textarea
            className="input"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />

          <select
            name="role"
            className="input"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-5 space-x-3">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
