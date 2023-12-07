import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Files, Main } from "./pages";
import { Nav } from "./components";
type Wrappers = { children?: React.ReactNode }
const Wrapper = (props: Wrappers) => (
  <div className="wrapper container-fluid px-1">{props.children}</div>
)

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Wrapper>
        <Routes>
          <Route path="/" element={<Main />}></Route>
          <Route path="/files" element={<Files />}></Route>
        </Routes>
      </Wrapper>
    </BrowserRouter>    
  );
}

export default App;
