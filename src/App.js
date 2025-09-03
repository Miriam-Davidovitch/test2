import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase.from('Users').select('*')
    if (error) {
      console.log('Error fetching data:', error)
    } else {
      setData(data)
    }
  }

  return (
    <div>
      <h1>Connected to Supabase!</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
