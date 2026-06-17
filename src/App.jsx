function Hilsen({ navn }) {
  return <h2>Hei, {navn}! 👋</h2>
}

function App() {
  return (
    <div>
      <h1>Ziimo</h1>
      <Hilsen navn="Emil" />
      <Hilsen navn="Martha" />
      <Hilsen navn="Verden" />
    </div>
  )
}

export default App