module.exports =(role) =>{
    return(req,res,next)=>{
        if(req.dbUser.role != role){
            return res.status(403).json({message: "Forbidden"});
        }
        next();
    };
};