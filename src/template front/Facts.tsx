import { useState } from "react";

interface FactCardProps {
  bgColor: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  delay: string;
  iconOpacity?: number;
}

const cardBaseStyle = {
  height: "170px",
  transform: "translateY(0)",
  transition: "all 0.3s ease"
};

const hoverStyle = {
  transform: "translateY(-5px)",
  boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
};

const FactCard = ({ bgColor, iconBg, icon, title, value, subtitle, delay, iconOpacity = 0.1 }: FactCardProps) => {
  const [hover, setHover] = useState(false);

  return (
    <div className="col-lg-4 wow zoomIn" data-wow-delay={delay}>
      <div
        className={`shadow d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden ${bgColor}`}
        style={{ ...cardBaseStyle, ...(hover ? hoverStyle : {}) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Logo en arrière-plan */}
        <div className="position-absolute top-0 end-0" style={{ opacity: iconOpacity }}>
          {icon}
        </div>

        {/* Icône principale */}
        <div
          className={`d-flex align-items-center justify-content-center rounded mb-2 ${iconBg}`}
          style={{ width: "70px", height: "70px" }}
        >
          {icon}
        </div>

        <div className="ps-4">
          <h5 className={bgColor.includes("primary") ? "text-white" : "text-primary"} mb-0>
            {title}
          </h5>
          <h1 className={bgColor.includes("primary") ? "text-white" : ""} mb-0 data-toggle="counter-up">
            {value}
          </h1>
          <small className={bgColor.includes("primary") ? "text-white" : "text-muted"} style={{ opacity: 0.8 }}>
            {subtitle}
          </small>
        </div>
      </div>
    </div>
  );
};

const Facts = () => {
  const factCards = [
    {
      bgColor: "bg-primary",
      iconBg: "bg-white",
      title: "Active Users",
      value: "5,432",
      subtitle: "+12% this month",
      delay: "0.1s",
      iconOpacity: 0.1,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--bs-primary)" }}>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          <circle cx="18.5" cy="10.5" r="2.5"/>
          <path d="M18.5 13c-1.67 0-5 .84-5 2.5V17h10v-1.5c0-1.66-3.33-2.5-5-2.5z"/>
        </svg>
      )
    },
    {
      bgColor: "bg-light",
      iconBg: "bg-primary",
      title: "vCards Created",
      value: "18,250",
      subtitle: "+8% this month",
      delay: "0.3s",
      iconOpacity: 0.05,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: "white" }}>
          <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
          <path d="M12 15l4-4H8l4 4z"/>
        </svg>
      )
    },
    {
      bgColor: "bg-primary",
      iconBg: "bg-white",
      title: "API Calls",
      value: "2.5M",
      subtitle: "+25% this month",
      delay: "0.6s",
      iconOpacity: 0.1,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--bs-primary)" }}>
          <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-1.96l3.54 3.54 7.07-7.07 1.41 1.41-8.48 8.48-4.95-4.95 1.41-1.41z"/>
          <path d="M12 6c3.31 0 6 2.69 6 6 0 1.66-.67 3.16-1.76 4.24l-1.42-1.42C15.59 14.05 16 13.08 16 12c0-2.21-1.79-4-4-4s-4 1.79-4 4c0 1.08.41 2.05 1.18 2.82l-1.42 1.42C6.67 15.16 6 13.66 6 12c0-3.31 2.69-6 6-6z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="container-fluid facts py-5 pt-lg-0">
      <div className="container py-5 pt-lg-0">
        <div className="row gx-4">
          {factCards.map((card, i) => (
            <FactCard key={i} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Facts;
