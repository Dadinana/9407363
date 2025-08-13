import { useState, useEffect } from "react";

type User = { id: string; name: string };

export default function AddExpensePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: parseFloat(amount), description, date }),
    });
    if (res.ok) {
      setMessage("✅ Ausgabe gespeichert");
      setUserId("");
      setAmount("");
      setDescription("");
      setDate("");
    } else {
      setMessage("❌ Fehler beim Speichern");
    }
  };

  const setToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="container">
      <h1>Neue Ausgabe hinzufügen</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nutzer
          <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">-- Nutzer auswählen --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <label>
          Betrag (€)
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          Beschreibung
          <input value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Datum
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <button type="button" onClick={setToday}>Heute</button>
          </div>
        </label>
        <button type="submit">Speichern</button>
      </form>
      {message && <p className={message.startsWith("✅") ? "success" : "error"}>{message}</p>}
    </div>
  );
} 