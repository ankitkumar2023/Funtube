const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
            catch((err)=>next(err))
    }
}

export default asyncHandler;

//for understanding of function inside function

//const asyncHandler = ()={}
//const asyncHandler = (func) => () => {}
//const asynchandler = (func) => async () => {}
    
/*
const asyncHandler = (requestHandler) = > async (req, res, next)=>{
    try{
        await requestHandler(req,res,next)

    }catch(error){
        res.status(err.code || 500).json({
            success : false,
            message : err.message
        })
    }
    }
*/     