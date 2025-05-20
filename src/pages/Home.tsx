import Header from "../template front/Header";
import Carousel from "../template front/Carousel";
import Facts from "../template front/Facts";
import Footer from "../template front/Footer";
import About from "../template front/About";
import Blog from "../template front/Blog";
import Features from "../template front/Features";
import PircingPlan from "../template front/PircingPlan";
import Quote from "../template front/Quote";
import Testimonial from "../template front/Testimonial";
import Services from "../template front/Services";
import Team from "../template front/Team";
import SearchModal from "../modals/SearchModal";

const Home = () => {
    return (
        <>
            <div style={{ width: "100vw", overflowX: "hidden",minWidth: "100vw", }}>
                <Header />
                <Carousel />
                <SearchModal />
                <Facts />
                <About />
                <Features />
                <Services />
                <PircingPlan />
                <Quote />
                <Testimonial />
                <Team />
                <Blog />
                <Footer />
            </div>
        </>
    );
};

export default Home;

