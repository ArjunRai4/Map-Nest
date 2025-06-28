const jwt=require('jsonwebtoken');
const User = require('../models/User');

const generateToken=(userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'7d',
    })
}

async function signup(req,res) {
    try {
        const {username,email,password}=req.body;

        if(!email || !username || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        if(password.length<6){
            return res.status(400).json({message:"Password must be atleast 6 characters"});
        }
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)){
            return res.status(400).json({message:"Invalid email format"});
        }

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(409).json({ message: "Email already exists" });
        }

        const newUser=await User.create({
            username,
            email,
            password
        });

        const token=generateToken(newUser._id);

        res.cookie("jwt",token,{
            maxAge:7*24*60*60*1000,
            httpOnly:true,  //prevents XSS attacks,
            sameSite:"None",  //prevents CSRF attacks
            secure:process.env.NODE_ENV==="production"
        })

        res.status(201).json({
            success:true,
            user:{id:newUser._id,name:newUser.username,email:newUser.email},
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

async function login(req,res){
    try {
        const {email,password}=req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect=await user.matchPassword(password);
        if(!isPasswordCorrect){
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token=generateToken(user._id);

        res.cookie("jwt",token,{
            maxAge:7*24*60*60*1000,
            httpOnly:true,  //prevents XSS attacks,
            sameSite:"None",  //prevents CSRF attacks
            secure:process.env.NODE_ENV==="production"
        })

        res.status(200).json({success:true,user:{
            _id:user._id,
            username:user.username,
            email:user.email,
        }})
    } catch (error) {
        console.log("Error in login controller",error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function logout(req,res){
    res.clearCookie("jwt");
    res.status(200).json({success:true,message:"Logout successful"})
}

module.exports={signup,login,logout};
