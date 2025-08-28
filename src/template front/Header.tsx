import { Link } from "react-router-dom";
import NexCardLogoFinal from "../atoms/Logo/NexCardLogoFinal";
import { useActiveSection } from "../hooks/useActiveSection";
import { useCallback, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";


const Header = () => {
  const activeSection = useActiveSection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Fermer le menu mobile après le clic
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
    <>
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
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <FaTimes size={20} color="#06A3DA" />
            ) : (
              <FaBars size={20} color="#06A3DA" />
            )}
          </button>
          <div className={`navbarfront-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarfront">
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
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </div>

      <style>{`
        /* Styles uniquement pour MOBILE - le desktop garde vos styles CSS existants */
        @media (max-width: 991.98px) {
          .navbarfront {
            justify-content: space-between !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          .navbarfront-collapse {
            order: 3;
            width: 100%;
            background-color: #ffffff !important;
            margin-top: 10px;
            padding: 0 15px;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease-in-out;
          }

          .navbarfront-collapse.show {
            max-height: 500px;
            opacity: 1;
            transform: translateY(0);
            padding: 15px;
          }

          .navbarfront-nav {
            flex-direction: column !important;
            align-items: stretch !important;
            margin-bottom: 10px;
          }

          .navbarfront-item {
            margin-right: 0 !important;
            margin-bottom: 0;
          }

          .navbarfront-link {
            padding: 12px 15px !important;
            color: #333333 !important;
            display: block !important;
            text-decoration: none !important;
            transition: all 0.3s ease !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            background: transparent !important;
          }

          .navbarfront-link:hover {
            color: #06A3DA !important;
            background-color: rgba(6, 163, 218, 0.1) !important;
            text-decoration: none !important;
          }

          .navbarfront-link.active {
            color: #06A3DA !important;
            background-color: rgba(6, 163, 218, 0.15) !important;
          }

          .navbarfront-toggler {
            display: block;
            padding: 8px 12px;
            background-color: transparent !important;
            border: 1px solid #06A3DA !important;
            border-radius: 4px;
            margin-left: auto;
            order: 2;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .navbarfront-toggler:focus {
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(6, 163, 218, 0.25);
          }

          .navbarfront-toggler:hover {
            background-color: rgba(6, 163, 218, 0.1) !important;
          }

          .btn-primary {
            width: 100% !important;
            margin-left: 0 !important;
            margin-top: 15px !important;
            background-color: #06A3DA !important;
            border-color: #06A3DA !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .btn-primary svg {
            color: #ffffff !important;
            margin-right: 8px !important;
            font-size: 16px !important;
          }

          .btn-primary:hover {
            background-color: #0591c2 !important;
            border-color: #0591c2 !important;
            color: #ffffff !important;
          }

          .btn-primary:hover svg {
            color: #ffffff !important;
          }
        }

        /* Pour s'assurer que le desktop n'est pas affecté */
        @media (min-width: 992px) {
          .navbarfront-toggler {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Header;