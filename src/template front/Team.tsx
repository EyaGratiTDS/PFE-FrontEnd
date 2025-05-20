const teamMembers = [
    {
        name: "John Doe",
        position: "CEO & Founder",
        image: "src/assets/styleTemplate/img/team-1.jpg",
        socialLinks: {
            twitter: "#",
            facebook: "#",
            instagram: "#",
            linkedin: "#",
        }
    },
    {
        name: "Jane Smith",
        position: "Project Manager",
        image: "src/assets/styleTemplate/img/team-2.jpg",
        socialLinks: {
            twitter: "#",
            facebook: "#",
            instagram: "#",
            linkedin: "#",
        }
    },
    {
        name: "Michael Brown",
        position: "Lead Developer",
        image: "src/assets/styleTemplate/img/team-3.jpg",
        socialLinks: {
            twitter: "#",
            facebook: "#",
            instagram: "#",
            linkedin: "#",
        }
    }
];

const Team = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase">Team Members</h5>
                    <h1 className="mb-0">Professional Staff Ready to Help Your Business</h1>
                </div>
                <div className="row g-5">
                    {teamMembers.map((member, index) => (
                        <div className="col-lg-4 wow slideInUp" data-wow-delay={`${0.3 + index * 0.3}s`} key={index}>
                            <div className="team-item bg-light rounded overflow-hidden">
                                <div className="team-img position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src={member.image} alt={member.name} />
                                    <div className="team-social">
                                        <a className="btn btn-lg btn-primary btn-lg-square rounded" href={member.socialLinks.twitter}><i className="fab fa-twitter fw-normal"></i></a>
                                        <a className="btn btn-lg btn-primary btn-lg-square rounded" href={member.socialLinks.facebook}><i className="fab fa-facebook-f fw-normal"></i></a>
                                        <a className="btn btn-lg btn-primary btn-lg-square rounded" href={member.socialLinks.instagram}><i className="fab fa-instagram fw-normal"></i></a>
                                        <a className="btn btn-lg btn-primary btn-lg-square rounded" href={member.socialLinks.linkedin}><i className="fab fa-linkedin-in fw-normal"></i></a>
                                    </div>
                                </div>
                                <div className="text-center py-4">
                                    <h4 className="text-primary">{member.name}</h4>
                                    <p className="text-uppercase m-0">{member.position}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Team;
