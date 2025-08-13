import { useEffect, useState } from "react";
import { prisma } from "../lib/prisma";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string;
  user: {
    id: string;
    name: string;
  };
};

type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type Props = {
  initialExpenses: Expense[];
  initialUsers: User[];
};

export default function DashboardPage({ initialExpenses, initialUsers }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [users, setUsers] = useState(initialUsers);
  const [grouped, setGrouped] = useState<Record<string, Expense[]>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [minDate, setMinDate] = useState<string>("");

  const [adminPIN, setAdminPIN] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ amount: "", description: "" });
  const [editUserValues, setEditUserValues] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    const filtered = expenses.filter((e) => {
      const matchesUser = selectedUser ? e.user.id === selectedUser : true;
      const matchesDate = minDate ? new Date(e.date) >= new Date(minDate) : true;
      return matchesUser && matchesDate;
    });

    const group: Record<string, Expense[]> = {};
    for (const expense of filtered) {
      const userName = expense.user.name;
      if (!group[userName]) group[userName] = [];
      group[userName].push(expense);
    }
    setGrouped(group);
  }, [expenses, selectedUser, minDate]);

  const handleDeleteUser = async (id: string) => {
    if (confirm("Nutzer wirklich löschen?")) {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      location.reload();
    }
  };

  const handleUpdateUser = async (id: string) => {
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editUserValues),
    });
    setEditUserId(null);
    location.reload();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1 style={{ marginBottom: "1rem" }}>💸 Ausgaben-Dashboard</h1>

      {!isAdmin ? (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <label>
            Admin-PIN:
            <input
              type="password"
              value={adminPIN}
              maxLength={4}
              onChange={(e) => setAdminPIN(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => {
              if (adminPIN === "1234") setIsAdmin(true);
              else alert("Falsche PIN!");
            }}
          >
            Entsperren
          </button>
        </div>
      ) : (
        <p style={{ color: "green", fontWeight: "bold" }}>🔓 Admin-Modus aktiv</p>
      )}

      {/* Filter */}
      <div style={{ marginBottom: "1.5rem", marginTop: "1rem" }}>
        <label>
          Nutzer:
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(e.target.value || null)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">Alle</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Ab Datum:
          <input
            type="date"
            value={minDate}
            onChange={(e) => setMinDate(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      {selectedUser && (
        <p style={{ fontStyle: "italic", color: "#555" }}>
          Filter aktiv: {users.find((u) => u.id === selectedUser)?.name}
        </p>
      )}

      {Object.entries(grouped).length === 0 ? (
        <p style={{ color: "gray" }}>Keine Ausgaben für die aktuellen Filter gefunden.</p>
      ) : (
        <>
          {/* Diagramm */}
          <h2>📊 Gesamtausgaben pro Nutzer</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(grouped).map(([name, ex]) => ({
                name,
                total: ex.reduce((sum, e) => sum + e.amount, 0),
              }))}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#0070f3" />
            </BarChart>
          </ResponsiveContainer>

          {/* Nutzer anzeigen & bearbeiten */}
          {isAdmin && (
            <>
              <h2 style={{ marginTop: "2rem" }}>👤 Nutzerliste</h2>
              <ul>
                {users.map((u) => (
                  <li key={u.id} style={{ marginBottom: "0.5rem" }}>
                    {editUserId === u.id ? (
                      <>
                        <input
                          type="text"
                          value={editUserValues.name}
                          onChange={(e) =>
                            setEditUserValues({ ...editUserValues, name: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          value={editUserValues.phone}
                          onChange={(e) =>
                            setEditUserValues({ ...editUserValues, phone: e.target.value })
                          }
                        />
                        <input
                          type="email"
                          value={editUserValues.email}
                          onChange={(e) =>
                            setEditUserValues({ ...editUserValues, email: e.target.value })
                          }
                        />
                        <button onClick={() => handleUpdateUser(u.id)}>Speichern</button>
                        <button onClick={() => setEditUserId(null)}>Abbrechen</button>
                      </>
                    ) : (
                      <>
                        {u.name} – {u.phone} – {u.email}
                        <button
                          style={{ marginLeft: "1rem" }}
                          onClick={() => {
                            setEditUserId(u.id);
                            setEditUserValues({
                              name: u.name,
                              phone: u.phone,
                              email: u.email,
                            });
                          }}
                        >
                          ✏️ Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ marginLeft: "0.5rem", color: "red" }}
                        >
                          🗑️ Löschen
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Gruppierte Ausgaben */}
          <div className="dashboard-container" style={{ marginTop: "2rem" }}>
            
            {Object.entries(grouped).map(([userName, exList]) => {
              const sum = exList.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={userName} className="user-box">
                  <h3>{userName} – Gesamt: {sum.toFixed(2)} €</h3>
                  <div className="expense-list">
                    {exList.map((e) => (
                      <div key={e.id} className="expense-item">
                        {editExpenseId === e.id ? (
                          <>
                            <input
                              type="number"
                              value={editValues.amount}
                              onChange={(ev) =>
                                setEditValues({ ...editValues, amount: ev.target.value })
                              }
                            />
                            <input
                              type="text"
                              value={editValues.description}
                              onChange={(ev) =>
                                setEditValues({ ...editValues, description: ev.target.value })
                              }
                            />
                            <button
                              onClick={async () => {
                                await fetch(`/api/expenses/${e.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    amount: parseFloat(editValues.amount),
                                    description: editValues.description,
                                  }),
                                });
                                setEditExpenseId(null);
                                location.reload();
                              }}
                            >
                              Speichern
                            </button>
                            <button onClick={() => setEditExpenseId(null)}>Abbrechen</button>
                          </>
                        ) : (
                          <>
                          
                            {new Date(e.date).toLocaleDateString()} – {e.amount.toFixed(2)} € – {e.description}
                            {isAdmin && (
                              <>
                                <button
                                  style={{ marginLeft: "1rem" }}
                                  onClick={() => {
                                    setEditExpenseId(e.id);
                                    setEditValues({
                                      amount: e.amount.toString(),
                                      description: e.description,
                                    });
                                  }}
                                >
                                  ✏️ Bearbeiten
                                </button>
                                <button
                                  style={{ marginLeft: "0.5rem", color: "red" }}
                                  onClick={async () => {
                                    if (confirm("Wirklich löschen?")) {
                                      await fetch(`/api/expenses/${e.id}`, { method: "DELETE" });
                                      location.reload();
                                    }
                                  }}
                                >
                                  🗑️ Löschen
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// getServerSideProps für SSR
export async function getServerSideProps() {
  const expenses = await prisma.expense.findMany({
    include: { user: true },
    orderBy: { date: "desc" },
  });

  const users = await prisma.user.findMany();

  return {
    props: {
      initialExpenses: JSON.parse(JSON.stringify(expenses)),
      initialUsers: JSON.parse(JSON.stringify(users)),
    },
  };
}
