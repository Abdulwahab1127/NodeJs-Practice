
const express = require('express');
const app = express();

// app.use((req,res,next) =>{

//     console.log("Using Middlewear!");
//     next();//this allow the request to continue to next middlewear

// })

app.use('/user',(req,res,next) =>{

    console.log("Using User Middlewear!");
    res.send('<h1>Hello From USER YAYYY!</h1>');

})


app.use((req,res,next) =>{

    console.log("Using Default Middlewear!");
    res.send('<h1>Hello From Express!</h1>');

})

// const server = http.createServer(app);
// server.listen(3000);
//We can Remove this in Express and Only use 
app.listen(3000);