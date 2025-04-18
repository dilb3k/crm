import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ElonlarRoyxati from "./pages/ElonlarRoyxati";
import PrivateRoute from "./components/PrivateRoute";
import MainPage from "./pages/MainPage";
import ApartmentDetails from "./pages/ApartmentDetailsPage";
import Maklerlar from "./pages/Maklerlar";
import AddApartment from "./components/AddApartment";
import MaklerForm from "./components/MaklerForm";
import TaskPage from "./crm/page/tasks/TaskPage";
import TaskDetailsPage from "./crm/page/tasks/TasksDetails";
import MyTaskPage from "./crm/page/tasks/MyTasks";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainPage />}>
            {/* Dashboard - admin only */}
            <Route index element={<Dashboard />} />

            {/* Common routes for all roles */}
            <Route path="elonlarRoyxati" element={<ElonlarRoyxati />} />
            <Route path="apartment/:id" element={<ApartmentDetails />} />
            <Route path="/projects/:id" element={<TaskDetailsPage />} />

            {/* Admin-only routes */}
            <Route path="tasks" element={<TaskPage />} />
            <Route path="maklerlar" element={<Maklerlar />} />
            <Route path="/add-apartment" element={<AddApartment />} />
            <Route path="/maklerlar/add" element={<MaklerForm />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;