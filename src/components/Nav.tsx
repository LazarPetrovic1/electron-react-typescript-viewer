import { Link } from 'react-router-dom';
import notes from '../assets/notes.svg';

function Nav() {
  return (
    <nav style={{ borderBottom: '1px solid white' }} className="navbar navbar-expand-lg bg-body-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={notes} alt="Logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Music</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Nav