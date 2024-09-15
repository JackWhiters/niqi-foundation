import axios from "axios";
import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation"
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from "../App";

const ChangePassword = () => {

    let { userAuth: { access_token } } = useContext(UserContext);

    let changePasswordForm = useRef();

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(changePasswordForm.current);
        let formData = { };

        for(let [key, value] of form.entries()){
            formData[key] = value
        }

        let { currentPassword, newPassword } = formData;

        if(!currentPassword.length || !newPassword.length){
            return toast.error("Isi semua inputan")
        }

        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
            return toast.error("Password harus memiliki panjang 6 sampai 10 dengan angka serta campuran huruf besar dan kecil")
        }

        e.target.setAttribute("disabled", true);

        let loadingToast = toast.loading("Sedang Mengubah...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.success("Password Berhasil Diubah");
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(response.data.error);
        })
 
    }

    return (
        <AnimationWrapper>
            <Toaster />
            <form ref={changePasswordForm}>

                <h1 className="max-md:hidden">Ubah Password</h1>

                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Password Sekarang" icon="fi-rr-unlock" />
                    <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="Password Baru" icon="fi-rr-unlock" />

                    <button onClick={handleSubmit} className="btn-dark px-10" type="submit">Ganti Password</button>
                </div>

            </form>
        </AnimationWrapper>
    )
}

export default ChangePassword;