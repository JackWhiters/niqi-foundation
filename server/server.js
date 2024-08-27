import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import admin from 'firebase-admin';
import serviceAccountKey from "./niqi-foundation-firebase-adminsdk-e4zaf-700f672b98.json" assert{ type:"json" }
import {getAuth} from 'firebase-admin/auth'
import aws from "aws-sdk";


import User from './Schema/User.js';
import Blog from './Schema/Blog.js';


const server = express();
let PORT = 3000;


admin.initializeApp({
    credential:admin.credential.cert(serviceAccountKey)
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors())

mongoose.connect(process.env.DB_LOCATION,{
    autoIndex: true
})


// setting up s3 bucket
const s3 = new aws.S3({
    region:'ap-southeast-2',
    accessKeyId:process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY

})

const generateUploadURL = async () => {

    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject',{
        Bucket:'niqi-foundation',
        Key:imageName,
        Expires:1000,
        ContentType:"image/jpeg"
    })
}

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(token == null){
        return res.status(401).json({"error":"Tidak ada Access Token"})
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err,user) => {
        if(err){
            return res.status(403).json({error:"Access Token Salah/Tidak Sah"})
        }

        req.user = user.id
        next()
    })
}

const formatDatatoSend = (user) => {

    const access_token = jwt.sign({id: user._id},process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img : user.personal_info.profile_img,
        username:user.personal_info.username,
        fullname:user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameNotUnique = await User.exists({"personal_info.username": username}).then((result) => result)

    isUsernameNotUnique ? username += nanoid().substring(0,5) : "";

    return username;
}

// Upload image URL Route
server.get('/get-upload-url',(req,res) => {
    generateUploadURL().then(url => res.status(200).json({uploadURL:url}))
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({error:err.message})
    })
})

server.post("/signup",(req,res) => {
    // console.log(req.body);
    // res.json(req.body)
    let {fullname,email,password} = req.body;

    req.body.fullname

    // validating the data from frontend
    if(fullname.length < 3) {
        return res.status(403).json({"error": "nama lengkap harus lebih panjang dari 3 huruf"})
    }
    if(!email.length) {
        return res.status(403).json({"error":"Masukkan Email"})
    }
    if(!emailRegex.test(email)) {
        return res.status(403).json({"error":"Email invalid"})
    }
    if(!passwordRegex.test(password)){
        return res.status(403).json({"error":"Password harus memiliki panjang 6 sampai 10 dengan angka serta campuran huruf besar dan kecil"})
    }

    bcrypt.hash(password,10,async (err,hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: {fullname,email,password:hashed_password,username}
        })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        }).catch(err=>{
            if(err.code = 110000) {
                return res.status(500).json({"error":"Email Sudah ada"})
            }
            return res.status(500).json({"error":err.message})
        })

        // console.log(hashed_password);
    })

    // return res.status(200).json({"status":"oke"})


})

server.post("/signin",(req,res) => {
    let {email,password} = req.body;

    User.findOne({"personal_info.email":email})
    .then((user) => {
        if(!user){
            // throw 'error';
            return res.status(403).json({"error":"Email tidak ditemukan"})
        }
        bcrypt.compare(password, user.personal_info.password,(err,result) => {
            if(err){
                return res.status(403).json({"error":"terjadi kesalahan saat login, silakan coba lagi"})
            }

            if(!result){
               return res.status(403).json({"error":"Password salah"}) 
            } else {
                return res.status(200).json(formatDatatoSend(user))
            }
        })
        // console.log(user)
        // return res.json({"status":"mendapatkan user document"})
    })
    .catch(err=> {
        console.log(err.message);
        return res.status(500).json({"error":err.message})
    })

})

server.post("/google-auth", async (req,res) => {
    let {access_token} = req.body;
    getAuth()
    .verifyIdToken(access_token)
    .then(async (decodecUser) => {
        let {email,name,picture} = decodecUser;
        picture = picture.replace("s96-c","s384-c");
        let user = await User.findOne({"personal_info.email":email}).select("personal_info.fullname personal_info.username personal_info.profile_image google_auth").then((u) => {
            return u || null
        })
        .catch(err => {
            return res.status(500).json({"error":err.message})
        })

        if(user) {
            if(!user.google_auth){
                return res.status(403).json("error","Email ini terdafter tanpa google.Tolong login dengan password untuk access account ini")
            }
        } else {
            let username = await generateUsername(email);
            user = new User({
                personal_info: { fullname:name, email,profile_image:picture, username},
                google_auth:true
            })

            await user.save().then((u) => {
                user = u;
            })
            .catch(err=>{
                return res.status(500).json({"error":err.message})
            })
        }

        return res.status(200).json(formatDatatoSend(user))
    })
    .catch(err => {
        return res.status(500).json({"error":"Gagal authentikasi. Coba dengan akun google lain"})
    })
})

server.get('/latest-blogs',(req,res) => {
    let maxLimit = 5;

    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({blogs})
    })
    .catch(err => {
        return res.status(500).json({error:err.message})
    })
})

server.post('/create-blog', verifyJWT, (req, res) => {

    // console.log(req.body)
    // return res.json(req.body)

    let authorId = req.user;
    let { title, des, banner, tags, content, draft } = req.body;

    if(!title.length){
        return res.status(403).json({error:"Kamu harus memasukan title/judul"});
    }

    if(!draft){
        if(!des.length || des.length > 200){
            return res.status(403).json({error:"Kamu harus mengisi deskripsi blog dibawah 200 karakter"});
        }
    
        if(!banner.length){
            return res.status(403).json({ error:"Kamu harus mengisi blog banner untuk mempublish"})
        }
    
        if(!content.blocks.length) {
            return res.status(403).json({error:"harus ada beberapa konten blog untuk mempublikasikannya"})
        }
        
        if(!tags.length || tags.length > 10){
            return res.status(403).json({error:"Masukan urutan tags untuk mempublish, maksimal 10"})
        }
    
    }
    

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g,"-").trim() + nanoid();
    // console.log(blog_id);

    let blog = new Blog({
        title,des,banner,content,tags,author:authorId,blog_id,draft: Boolean(draft)
    })

    blog.save().then(blog => {
        let incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate({_id:authorId,}, { $inc : {"account_info.total_posts": incrementVal},$push:{"_blogs":blog_id}})
        .then(user=> {
            return res.status(200).json({id:blog.blog_id})
        })
        .catch(err => {
            return res.status(500).json({error:"Gagal mengupdate nomor total posts"})
        })
    })
    .catch(err=> {
        return res.status(500).json({error:err.message})
    })

    // return res.json({status:"done"})
})

server.listen(PORT,() => {
    console.log("listening on port ->" + PORT);
})