import { useState } from "react";

export default function AddUserPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email }),
    });

    if (res.ok) {
      setMessage("✅ Nutzer wurde gespeichert");
      setName("");
      setPhone("");
      setEmail("");
    } else {
      setMessage("❌ Fehler beim Speichern");
    }
  };

  return (
    <div className="container">
      <h1>Nutzer hinzufügen</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Telefon
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label>
          E-Mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button type="submit">Speichern</button>
      </form>
      {message && <p className={message.startsWith("✅") ? "success" : "error"}>{message}</p>}
    </div>
  );
}