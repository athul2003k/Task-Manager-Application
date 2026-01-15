exports.getMe = async (req,res) => {
    try{
        res.json({
            id: req.dbUser._id,
            email: req.dbUser.email,
            role: req.dbUser.role,
        });
    } catch(err){
        res.status(500).json({message: "Failed to fetch user"});
    }
};