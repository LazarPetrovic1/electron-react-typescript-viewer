function About() {
  return (
    <div className="container mt-2">
      <h2>Electron-react-player</h2>
      <hr />
      <p>Uses the following</p>
      <ul className="list-group list-group-flush">
        <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>React</li>
        <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Router</li>
        <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Electron</li>
        <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>Canvas</li>
        <li className="list-group-item" style={{ background: 'transparent', color: 'white' }}>AudioContextAPI</li>
      </ul>
    </div>
  )
}

export default About;