import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import FormBuildPage from "./pages/FormBuildPage";
import FormFillPage from "./pages/FormFillPage";
import FormResponsesPage from "./pages/FormResponsesPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/forms/new" element={<FormBuildPage />} />
      <Route path="/forms/:id/fill" element={<FormFillPage />} />
      <Route path="/forms/:id/responses" element={<FormResponsesPage />} />
    </Routes>
  );
}

export default App;
