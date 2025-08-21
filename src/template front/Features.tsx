import { useState } from "react";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    description: string;
    delay: string;
}

const cardBaseStyle = {
    transition: "all 0.3s ease",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
};

const hoverStyle = {
    transform: "translateY(-10px)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    borderColor: "var(--bs-primary)"
};

const FeatureCard = ({ icon, title, subtitle, description, delay }: FeatureCardProps) => {
    const [hover, setHover] = useState(false);
    return (
        <div className="col-12 wow zoomIn" data-wow-delay={delay}>
            <div
                className="feature-card p-4 rounded-4 border bg-light h-100 position-relative overflow-hidden"
                style={{ ...cardBaseStyle, ...(hover ? hoverStyle : {}) }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div className="position-absolute top-0 end-0 m-3" style={{ opacity: "0.1" }}>
                    {icon}
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center me-3 shadow-sm"
                        style={{ width: "60px", height: "60px" }}>
                        {icon}
                    </div>
                    <div className="flex-grow-1">
                        <h4 className="mb-1 fw-bold">{title}</h4>
                        <small className="text-primary fw-medium">{subtitle}</small>
                    </div>
                </div>
                <p className="mb-0 text-muted lh-lg">{description}</p>
            </div>
        </div>
    );
};

const Features = () => {
    const featureCardsLeft = [
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    <circle cx="12" cy="14" r="2" />
                </svg>
            ),
            title: "Digital vCards",
            subtitle: "Professional & Modern",
            description: "Create and customize professional digital business cards with our intuitive editor",
            delay: "0.2s"
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
            ),
            title: "Project Management",
            subtitle: "Organized & Efficient",
            description: "Organize your vCards by projects and manage them efficiently from a centralized dashboard",
            delay: "0.6s"
        }
    ];

    const featureCardsRight = [
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
            ),
            title: "Responsive Design",
            subtitle: "Mobile First",
            description: "Optimal experience across all devices: mobile, tablet, and desktop",
            delay: "0.4s"
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4v4z" />
                </svg>
            ),
            title: "API Integration",
            subtitle: "Developer Friendly",
            description: "Easily integrate our services with your system using our comprehensive API",
            delay: "0.8s"
        }
    ];

    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase position-relative">
                        <span className="bg-light px-3 py-1 rounded-pill">Our Features</span>
                    </h5>
                    <h1 className="mb-0 mt-2 position-relative">
                        Complete Digital Business Card <span className="text-primary">Solution</span>
                    </h1>
                    <div className="position-absolute bottom-0 start-50 translate-middle-x"
                        style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
                </div>

                <div className="row g-5">
                    {/* Left Column */}
                    <div className="col-lg-4">
                        <div className="row g-4">
                            {featureCardsLeft.map((card, i) => (
                                <FeatureCard key={i} {...card} />
                            ))}
                        </div>
                    </div>

                    {/* Center Image */}
                    <div className="col-lg-4 wow zoomIn" data-wow-delay="0.9s" style={{ minHeight: "350px" }}>
                        <div className="position-relative h-100">
                            <div className="position-absolute top-0 start-0 w-100 h-100">
                                <div className="position-absolute top-0 end-0 bg-primary rounded-circle"
                                    style={{ width: "80px", height: "80px", opacity: "0.1", transform: "translate(20px, -20px)" }}></div>
                                <div className="position-absolute bottom-0 start-0 bg-secondary rounded-circle"
                                    style={{ width: "60px", height: "60px", opacity: "0.1", transform: "translate(-20px, 20px)" }}></div>
                            </div>

                            <div className="position-relative h-100 rounded-4 overflow-hidden shadow-lg"
                                style={{ transition: "all 0.3s ease" }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = ""; }}>
                                <img className="position-absolute w-100 h-100"
                                    src="/assets/styleTemplate/img/feature.jpg"
                                    alt="Feature"
                                    style={{ objectFit: "cover" }} />

                                <div className="position-absolute w-100 h-100 d-flex align-items-end"
                                    style={{ background: "linear-gradient(to top, rgba(6, 163, 218, 0.8) 0%, transparent 50%)" }}>
                                    <div className="text-white p-4 w-100">
                                        <h4 className="fw-bold mb-2">Professional Platform</h4>
                                        <p className="mb-0 small">Built for modern professionals who value efficiency and style</p>
                                        <div className="d-flex gap-2 mt-3">
                                            <span className="badge bg-white text-primary rounded-pill px-3">Secure</span>
                                            <span className="badge bg-white text-primary rounded-pill px-3">Fast</span>
                                            <span className="badge bg-white text-primary rounded-pill px-3">Reliable</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-4">
                        <div className="row g-4">
                            {featureCardsRight.map((card, i) => (
                                <FeatureCard key={i} {...card} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
