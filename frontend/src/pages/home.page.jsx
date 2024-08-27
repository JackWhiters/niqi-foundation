import AnimationWrapper from "../common/page-animation";

const HomePage = () => {
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* artikel terbaru */}
                <div className="w-full">

                    <InPageNavigation></InPageNavigation>

                </div>

                {/* filter & trending artikel */}
                <div>
                    
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;