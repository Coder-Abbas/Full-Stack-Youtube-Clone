const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error));
    }
}


export {asyncHandler};


// const asncHandler = (fn) => async () => {

//     try{

//         await fn(req, res, next);

//     }catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message || 'Server Error'
//         })
//     }
// };