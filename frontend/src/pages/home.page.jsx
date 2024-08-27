import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";


const HomePage = () => {
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* artikel terbaru */}
                <div className="w-full">

                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <h1>Artikel Terbaru Disini</h1>

                        <h1>Trending Artikel Disini</h1>
                        
                    </InPageNavigation>

                </div>

                {/* filter & trending artikel */}
                <div>
                    
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;