const fetch = require('node-fetch');
const cors = require('cors')
const express = require('express');
const app = express();

app.use(cors())

app.get("/",async (req,res)=>{
    let test = await fetch('https://yehudaba.wixsite.com/pushing-data/_functions/survey');
    let data = await test.json()
    delete data[0]._id
    delete data[0]._owner
    delete data[0]._createdDate
    delete data[0]._updatedDate
    res.send(data)
})

let PORT = "8081";

app.listen(proccess.env.PORT || PORT)