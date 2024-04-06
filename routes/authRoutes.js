import Local from '../config/LocalStrategy';
import {Router as expressRouter} from 'express'
const authRouter = expressRouter();

// local strategy routes
//user
authRouter.post('/register', Local.localRegister);
authRouter.post('/login', Local.localLogin);

//check athentication and return boolean + user
authRouter.post('/checkAuth', (req, res)=>{
    console.log('/checkAuth request');
    if(req.isAuthenticated()){
        console.log('user authenticated')
        res.json({auth: true})
    }
    else{
        console.log('user not authenticated')
        res.json({auth: false})}
})

// logout
authRouter.post('/logout', (req, res)=>{
    console.log('logout request')
    req.logout(err => {
        if (err) {
            console.log('logout failed: ' + err)
            res.json({success: false, message: err.message}) 
        }else{
            console.log('lougout successfull')
            res.json({success: true})
        }
    });
})

export default authRouter
