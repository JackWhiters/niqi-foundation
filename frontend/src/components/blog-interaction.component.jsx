import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {

    let { blog, blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, isLikedByUser, setLikedByUser, setCommentsWrapper } = useContext(BlogContext);

    let { userAuth: { username, access_token } } = useContext(UserContext);
                
    useEffect(() => {

        if( access_token ){
            // buat request ke server untuk like data
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data: { result } }) => {
                setLikedByUser(Boolean(result))
                // console.log(result);
            })
            .catch(err => {
                console.log(err);
            })
        }

    }, [])

    const handleLike = () => {

        if(access_token){
            // menyukai artikel
            // console.log('like')
            setLikedByUser(preVal => !preVal);

            !isLikedByUser ? total_likes++ : total_likes--;

            setBlog({ ...blog, activity: { ...activity, total_likes } })

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", { _id, isLikedByUser }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data }) => {
                console.log(data);
            })
            .catch(err => {
                console.log(err); 
            })

        }
        else{
            // tidak login
            toast.error("login untuk menyukai artikel ini")
        }

    }

    return (
        <>
            <Toaster />
            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">
                    <button 
                        onClick={handleLike}
                        className={"w-10 h-10 rounded-full flex items-center justify-center " + ( isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80")}
                    >
                        <i className={"fi " + ( isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
                    </button>
                    <p className="text-xl text-dark-grey">{ total_likes }</p>

                    <button
                        onClick={() => setCommentsWrapper(preVal => !preVal)} 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                    >
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>
                    <p className="text-xl text-dark-grey">{ total_comments }</p>
                </div>

                <div className="flex gap-6 items-center">
                        
                    {
                        username == author_username ?
                        <Link to={`/editor/${blog_id}`} className="underline hover:etxt-purple">Edit</Link> : ""
                    }

                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`} ><i className="fi fi-rr-brands-twitter text-xl hover:text-twitter"></i></Link>
                </div>
            </div>


            <hr className="border-grey my-2" />
        </>
    )
}

export default BlogInteraction;