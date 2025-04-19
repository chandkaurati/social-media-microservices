

const logFile = (req,res, next)=>{

    console.log(req)
    console.log(req.file)
    console.log(req.headers)
    
    console.log(req.headers["content-type"].startsWith("multipart/form-data"))
  
    return res.status(200).json({message :"from middleware"})

    next()
}


export default logFile