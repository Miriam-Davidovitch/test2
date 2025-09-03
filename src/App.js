import React, { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:8080/api/getData');
        const json = await res.json();
        console.log("Response from server:", json);
        setUsers(json.data || json);
        console.log("uu" , users);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1>Data from Database</h1>
      <ul>
        שלום
        {/* {users.map(u => <li key={u.id}>{u.name} — {u.email}</li>)} */}
      </ul>
      <p>Total users: {users.length}</p>
    </div>
  );
}

export default App;
