// App.js

import React, { useState } from "react";
import { ToastContainer } from "react-toastify"; // Import ToastContainer from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles

// Import stylesheet.
import "./App.css";

// Import components.
import HeaderNavbar from "./components/HeaderNavbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ErrorBoundary from "./components/ErrorBoundary"; // Import the ErrorBoundary component

function App() {
  // Set global states for login, OU, and User data.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState();
  const [ouData, setOuData] = useState();
  const [allUsersData, setAllUsersData] = useState();

  return (
    <div className="App mx-5">
      {/* ToastContainer to handle all toast messages globally */}
      <ToastContainer
        position="top-right"
        autoClose={3000} // Automatically close after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* ErrorBoundary wraps the main content to catch errors in child components */}
      <ErrorBoundary>
        {/* Navbar component */}
        <HeaderNavbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setUserData={setUserData}
        />

        {/* If isLoggedIn state is true, display the Dashboard component, else, display the Login component */}
        {isLoggedIn ? (
          <Dashboard
            isLoggedIn={isLoggedIn}
            userData={userData}
            ouData={ouData}
            setOuData={setOuData}
            allUsersData={allUsersData}
            setAllUsersData={setAllUsersData}
          />
        ) : (
          <Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />
        )}
      </ErrorBoundary>
    </div>
  );
}

export default App;
