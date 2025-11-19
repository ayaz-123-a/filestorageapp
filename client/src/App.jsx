import { BrowserRouter, Route, Routes } from "react-router";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import Login from "./login";

function App() {
return(  <BrowserRouter>
<Routes>
  <Route path="/" element={<DirectoryView />} />
  <Route path="/directory/:dirId" element={<DirectoryView />} />
  <Route path="/user/register" element={<Register/>} />
  <Route path="/user/login" element={<Login/>}/>
</Routes>
</BrowserRouter>
)
}

export default App;