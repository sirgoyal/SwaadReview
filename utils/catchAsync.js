// util function to try and catch for handeling async errors
const catchAsync = (func)=>{
    return function(req, res,next){
        func(req, res, next).catch(e=>next(e));
    }
}
module.exports= catchAsync