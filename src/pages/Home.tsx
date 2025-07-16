import Header from "../template front/Header";
import Carousel from "../template front/Carousel";
import Facts from "../template front/Facts";
import Footer from "../template front/Footer";
import About from "../template front/About";
import Features from "../template front/Features";
import PircingPlan from "../template front/PircingPlan";
import Quote from "../template front/Quote";
import Testimonial from "../template front/Testimonial";
import Services from "../template front/Services";
import Team from "../template front/Team";
import SearchModal from "../modals/SearchModal";
import { useWowAnimations } from "../hooks/useWowAnimations";

const Home = () => {
    useWowAnimations();
    
    return (
        <>
            <div style={{ width: "100vw", overflowX: "hidden", minWidth: "100vw" }}>
                <Header />
                <div id="home">
                    <Carousel />
                </div>
                <SearchModal />
                <Facts />
                <div id="about">
                    <About />
                </div>
                <div id="features">
                    <Features />
                </div>
                <div id="services">
                    <Services />
                </div>
                <div id="pricing">
                    <PircingPlan />
                </div>
                <div id="contact">
                    <Quote />
                </div>
                <div id="testimonials">
                    <Testimonial />
                </div>
                <div id="team">
                    <Team />
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Home;

