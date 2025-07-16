const Quote = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase position-relative">
                        <span className="bg-light px-3 py-1 rounded-pill">Get Started Today</span>
                    </h5>
                    <h1 className="mb-0 mt-2 position-relative">
                        Ready to Transform Your 
                        <span className="text-primary"> Networking?</span> Contact Us
                    </h1>
                    <div className="position-absolute bottom-0 start-50 translate-middle-x" 
                         style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
                </div>
                
                <div className="row g-5">
                    <div className="col-lg-7">
                        <div className="row g-3 mb-4">
                            <div className="col-sm-6 wow zoomIn" data-wow-delay="0.2s">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 h-100 position-relative overflow-hidden"
                                     style={{ transition: "all 0.3s ease" }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = "translateX(5px)";
                                         e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = "translateX(0)";
                                         e.currentTarget.style.boxShadow = "";
                                     }}>
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "40px", height: "40px" }}>
                                            <i className="fa fa-rocket text-white"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Quick Setup Support</h6>
                                        <small className="text-muted">Get started in minutes</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 wow zoomIn" data-wow-delay="0.4s">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 h-100 position-relative overflow-hidden"
                                     style={{ transition: "all 0.3s ease" }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = "translateX(5px)";
                                         e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = "translateX(0)";
                                         e.currentTarget.style.boxShadow = "";
                                     }}>
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "40px", height: "40px" }}>
                                            <i className="fa fa-headset text-white"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">24/7 Customer Support</h6>
                                        <small className="text-muted">Always here to help</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <p className="mb-4 fs-6 text-muted lh-lg">
                            Join <span className="fw-bold text-primary">thousands of professionals</span> who have revolutionized their networking with NexCard. 
                            Our digital business card platform offers seamless integration, powerful analytics, and 
                            professional designs that make lasting impressions. Get started today and experience 
                            the future of business networking.
                        </p>
                        
                        <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 wow zoomIn" data-wow-delay="0.6s"
                             style={{ transition: "all 0.3s ease" }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = "translateX(5px)";
                                 e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = "translateX(0)";
                                 e.currentTarget.style.boxShadow = "";
                             }}>
                            <div className="me-3">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: "50px", height: "50px" }}>
                                    <i className="fa fa-envelope text-white"></i>
                                </div>
                            </div>
                            <div>
                                <h6 className="mb-1 text-muted">Email us for any questions</h6>
                                <h5 className="text-primary mb-0 fw-bold">support@nexcard.com</h5>
                                <small className="text-muted">We respond within 2 hours</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="service-item bg-light rounded-3 d-flex flex-column align-items-center justify-content-center text-center p-4 h-100 position-relative overflow-hidden shadow-sm border wow zoomIn" data-wow-delay="0.9s"
                             style={{ 
                                 transition: "all 0.3s ease-in-out",
                                 transform: "translateY(0)",
                                 background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
                             }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = "translateY(-10px)";
                                 e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
                                 e.currentTarget.style.borderColor = "var(--bs-primary)";
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = "translateY(0)";
                                 e.currentTarget.style.boxShadow = "";
                                 e.currentTarget.style.borderColor = "";
                             }}>
                            
                            <div className="position-absolute top-0 end-0 m-3" style={{ opacity: "0.1" }}>
                                <i className="fa fa-quote-left" style={{ fontSize: "3rem", color: "var(--bs-primary)" }}></i>
                            </div>
                            
                            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center mb-4 shadow-sm" 
                                 style={{ width: "80px", height: "80px" }}>
                                <i className="fa fa-envelope text-white" style={{ fontSize: "2rem" }}></i>
                            </div>
                            
                            <h3 className="mb-2 fw-bold text-primary">Request Your Quote</h3>
                            <p className="text-muted mb-4">Let's discuss your project needs</p>
                            
                            <form onSubmit={(e) => e.preventDefault()} className="w-100">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <input type="text" className="form-control bg-white border-0 shadow-sm" placeholder="Your Name" style={{ height: "55px" }} />
                                    </div>
                                    <div className="col-12">
                                        <input type="email" className="form-control bg-white border-0 shadow-sm" placeholder="Your Email" style={{ height: "55px" }} />
                                    </div>
                                    <div className="col-12">
                                        <select className="form-select bg-white border-0 shadow-sm" style={{ height: "55px" }} defaultValue="">
                                            <option value="" disabled>Select A Service</option>
                                            <option value="digital-cards">Digital Business Cards</option>
                                            <option value="analytics">Analytics & Tracking</option>
                                            <option value="custom-design">Custom Design</option>
                                            <option value="enterprise">Enterprise Solutions</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <textarea className="form-control bg-white border-0 shadow-sm" rows={3} placeholder="Tell us about your project requirements..."></textarea>
                                    </div>
                                    <div className="col-12">
                                        <button className="btn bg-primary text-white w-100 py-3 fw-bold shadow-sm" type="submit">
                                            <i className="fa fa-paper-plane me-2"></i>
                                            Request A Quote
                                        </button>
                                    </div>
                                </div>
                            </form>
                            
                            <div className="mt-3">
                                <small className="text-muted">
                                    <i className="fa fa-shield-alt me-1 text-primary"></i>
                                    Your information is secure and confidential
                                </small>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Quote;
