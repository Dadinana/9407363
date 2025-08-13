// User-Datenstruktur
type User = {
  id: string;         // UUID
  name: string;       // z. B. "Anna Müller"
  phone: string;      // z. B. "+491701234567"
  email: string;      // z. B. "anna@example.com"
};

// Expense-Datenstruktur
type Expense = {
  id: string;          // UUID
  userId: string;      // verweist auf User.id
  amount: number;      // z. B. 37.95
  description: string; // z. B. "Einkauf"
  date: string;        // z. B. "2025-08-13" (ISO-Format)
};
