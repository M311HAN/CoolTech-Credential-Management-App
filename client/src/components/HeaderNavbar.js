import React from "react";
// Importing react-toastify for toasts
import { toast } from "react-toastify";

// Import Bootstrap components.
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function HeaderNavbar({
  isLoggedIn,
  setIsLoggedIn,
  setUserData,
}) {
  const handleLogout = () => {
    // Clear user session data
    setIsLoggedIn(false);
    setUserData(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // Show logout toast
    toast.success("Logged out successfully!");

    // Redirect user to login page after a brief delay to allow the toast to show
    setTimeout(() => {
      window.location.href = "/"; // Adjust the path if necessary
    }, 2000); // Adjust delay if necessary
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Container>
        {/* Navbar brand */}
        <a href={isLoggedIn ? "#dashboard" : "/"} className="navBarBrand py-2">
          CoolTech Credentials Manager
        </a>

        {/* Toggle links to collapsible hamburger on small viewports */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {/* When user is logged in, display a logout button */}
            {isLoggedIn && (
              <span
                className="navBarText py-2"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                Logout
              </span>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
