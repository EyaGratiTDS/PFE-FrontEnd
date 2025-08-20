import { Link } from "react-router-dom";
import NexCardLogoFinal from "../atoms/Logo/NexCardLogoFinal";
import { useActiveSection } from "../hooks/useActiveSection";
import { useCallback } from "react";

const Header = () => {
  const activeSection = useActiveSection();

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "team", label: "Team" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="container-fluid position-relative p-0">
      <nav className="navbarfront navbarfront-expand-lg navbarfront-dark px-5 py-3 py-lg-0">
        <Link to="/" className="navbarfront-brand p-0">
          <div className="d-flex align-items-center">
            <NexCardLogoFinal size="lg" showText={true} />
          </div>
        </Link>
        <button
          className="navbarfront-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarfront"
        >
          <span className="fa fa-bars"></span>
        </button>
        <div className="navbarfront-collapse" id="navbarfront">
          <div className="navbarfront-nav ms-auto py-0">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`navbarfront-item navbarfront-link ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <Link
            to="/sign-up"
            className="btn btn-primary rounded-pill px-5 py-2 position-relative overflow-hidden fw-bold ms-3 ml-4"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
