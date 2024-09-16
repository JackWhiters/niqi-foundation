import { Link } from "react-router-dom";
import lightPageNotFoundImage from "../imgs/404-light.png";
import darkPageNotFoundImage from "../imgs/404-dark.png";
import fullLogo from "../imgs/logo-niqi.png";
// import lightFullLogo from "../imgs/full-logo-light.png";
// import darkFullLogo from "../imgs/full-logo-dark.png";
import { useContext } from "react";
import { ThemeContext } from "../App";

// Page Not Found
const PageNotFound = () => {

    let { theme } = useContext(ThemeContext);

    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
            <img src={ theme == "light" ? darkPageNotFoundImage : lightPageNotFoundImage } className="select-none border-2 border-grey w-72 aspect-square object-cover rounded" />

            <h1 className="text-4xl font-gelasio leading-7">Halaman tidak ditemukan</h1>
            <p className="text-dark-grey text-xl leading-7 -mt-8">Halaman yang kamu cari tidak tersedia. Kembali ke <Link to="/" className="text-black underline"> halaman utama</Link></p>

            <div className="mt-auto">
                {/* <img src={ theme == "light" ? darkFullLogo : lightFullLogo } className="h-8 object-contain block mx-auto select-none" /> */}
                <img src={fullLogo} className="h-8 object-contain block mx-auto select-none" />
                <p className="mt-5 text-dark-grey">Niqi Foundation</p>
            </div>
        </section>
    )
}

export default PageNotFound;