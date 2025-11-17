import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { storeService } from "../../services/storeService";
import { userService } from "../../services/userService";

const AddStoreModal = ({ isOpen, onClose, onSuccess }) => {
  // Hooks MUST ALWAYS RUN FIRST
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load owners list ALWAYS — modal visibility doesn't matter
  useEffect(() => {
    if (!isOpen) return; // OK: we skip logic but NOT hooks
    loadOwners();
  }, [isOpen]);

  const loadOwners = async () => {
    try {
      const res = await userService.getAllUsers({ limit: 100 });
      const storeOwners = (res.users || []).filter(
        (u) => u.role === "store_owner"
      );
      setOwners(storeOwners);
    } catch (err) {
      console.error("Failed to load owners", err);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      await storeService.createStore(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create store");
    }

    setLoading(false);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ❗ IMPORTANT: return null AFTER hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Store</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {error && <p className="text-red-600 mb-1">{error}</p>}

        <div className="space-y-3">
          <input
            className="input"
            name="name"
            placeholder="Store Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="input"
            name="email"
            placeholder="Store Email"
            value={form.email}
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
            className="input"
            name="owner_id"
            value={form.owner_id}
            onChange={handleChange}
          >
            <option value="">Select Owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-5 space-x-3">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Create Store"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStoreModal;
