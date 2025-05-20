import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const testimonials = [
  { name: "Alice Johnson", profession: "Designer", image: "src/assets/styleTemplate/img/testimonial-1.jpg", text: "Great service, very happy!" },
  { name: "Bob Smith", profession: "Developer", image: "src/assets/styleTemplate/img/testimonial-2.jpg", text: "Excellent support and features." },
  { name: "Charlie Lee", profession: "Entrepreneur", image: "src/assets/styleTemplate/img/testimonial-3.jpg", text: "Really improved my business!" },
  { name: "Diana Miller", profession: "Photographer", image: "src/assets/styleTemplate/img/testimonial-4.jpg", text: "Fantastic team, highly recommend!" }
];

const Testimonial = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="section-title text-center position-relative pb-3 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          <h5 className="fw-bold text-primary text-uppercase">Testimonial</h5>
          <h1 className="mb-0">What Our Clients Say About Our Digital Services</h1>
        </div>
        <OwlCarousel
          className="owl-theme"
          loop
          margin={10}
          nav
          autoplay
          smartSpeed={1500}
          dots={true}
          center
          responsive={{
            0: { items: 1 },
            576: { items: 1 },
            768: { items: 2 },
            992: { items: 3 },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-item bg-light my-4" key={index}>
              <div className="d-flex align-items-center border-bottom pt-5 pb-4 px-5">
                <img className="img-fluid rounded" src={testimonial.image} style={{ width: "60px", height: "60px" }} alt={testimonial.name} />
                <div className="ps-4">
                  <h4 className="text-primary mb-1">{testimonial.name}</h4>
                  <small className="text-uppercase">{testimonial.profession}</small>
                </div>
              </div>
              <div className="pt-4 pb-5 px-5">{testimonial.text}</div>
            </div>
          ))}
        </OwlCarousel>
      </div>
    </div>
  );
};

export default Testimonial;
