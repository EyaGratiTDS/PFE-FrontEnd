const Services = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase">Our Services</h5>
                    <h1 className="mb-0">Custom IT Solutions for Your Successful Business</h1>
                </div>
                <div className="row g-5">
                    {[
                        { icon: "fa-shield-alt", title: "Cyber Security" },
                        { icon: "fa-chart-pie", title: "Data Analytics" },
                        { icon: "fa-code", title: "Web Development" },
                        { icon: "fab fa-android", title: "Apps Development" },
                        { icon: "fa-search", title: "SEO Optimization" },
                    ].map((service, index) => (
                        <div key={index} className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay={`${0.3 * (index % 3 + 1)}s`}>
                            <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center">
                                <div className="service-icon">
                                    <i className={`fa ${service.icon} text-white`}></i>
                                </div>
                                <h4 className="mb-3">{service.title}</h4>
                                <p className="m-0">Amet justo dolor lorem kasd amet magna sea stet eos vero lorem ipsum dolore sed</p>
                                <a className="btn btn-lg btn-primary rounded" href="#">
                                    <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    ))}
                    <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.9s">
                        <div className="position-relative bg-primary rounded h-100 d-flex flex-column align-items-center justify-content-center text-center p-5">
                            <h3 className="text-white mb-3">Call Us For Quote</h3>
                            <p className="text-white mb-3">Clita ipsum magna kasd rebum at ipsum amet dolor justo dolor est magna stet eirmod</p>
                            <h2 className="text-white mb-0">+012 345 6789</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;
