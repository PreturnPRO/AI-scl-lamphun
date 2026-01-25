import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>AI SCL Lamphun</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  )
}

export default App
