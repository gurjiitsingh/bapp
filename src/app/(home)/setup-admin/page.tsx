"use client";

import { useEffect, useState } from "react";

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/setup-admin");
        const data = await res.json();
        setAdminExists(data.adminExists);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-4">Checking admin status...</p>;

  if (adminExists) {
    return (
      <div className="relative p-6 text-center">
        <h1 className="text-2xl font-bold">Admin Already Exists</h1>
        <p className="mt-2 text-gray-600">
          An admin user already exists. For security, delete this page.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center ">
      <div className=" p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Setup Admin</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
}
