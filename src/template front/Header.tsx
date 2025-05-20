import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="container-fluid position-relative p-0">
      <nav className="navbarfront navbarfront-expand-lg navbarfront-dark px-5 py-3 py-lg-0">
        <a href="index.html" className="navbarfront-brand p-0">
          <h1 className="m-0">
            <i className="fa fa-user-tie me-2"></i>Startup
          </h1>
        </a>
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
            <a href="/" className="navbarfront-item navbarfront-link active">
              Home
            </a>
            <a href="about.html" className="navbarfront-item navbarfront-link">
              About
            </a>
            <a href="service.html" className="navbarfront-item navbarfront-link">
              Services
            </a>
            <div className="navbarfront-item dropdown">
              <a href="#" className="navbarfront-link dropdown-toggle" data-bs-toggle="dropdown">
                Blog
              </a>
              <div className="dropdown-menu m-0">
                <a href="blog.html" className="dropdown-item">
                  Blog Grid
                </a>
                <a href="detail.html" className="dropdown-item">
                  Blog Detail
                </a>
              </div>
            </div>
            <div className="navbarfront-item dropdown">
              <a href="#" className="navbarfront-link dropdown-toggle" data-bs-toggle="dropdown">
                Pages
              </a>
              <div className="dropdown-menu m-0">
                <a href="price.html" className="dropdown-item">
                  Pricing Plan
                </a>
                <a href="feature.html" className="dropdown-item">
                  Our Features
                </a>
                <a href="team.html" className="dropdown-item">
                  Team Members
                </a>
                <a href="testimonial.html" className="dropdown-item">
                  Testimonial
                </a>
                <a href="quote.html" className="dropdown-item">
                  Free Quote
                </a>
              </div>
            </div>
            <a href="contact.html" className="navbarfront-item navbarfront-link">
              Contact
            </a>
          </div>
          <button
            type="button"
            className="btn text-primary ms-3"
            data-bs-toggle="modal"
            data-bs-target="#searchModal"
          >
            <i className="fa fa-search"></i>
          </button>
          <Link
            to="/sign-up"
            className="btn btn-primary py-2 px-4 ms-3"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;