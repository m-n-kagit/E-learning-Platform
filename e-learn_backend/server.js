const express = require("express");
const cors  = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors);


const port =  process.env.PORT || 3000;
app.post("/api/validate-email", (req, res) => {

    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if (emailRegex.test(email)) {
        return res.json({
            success: true,
            message: "Valid email format"
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

});

app.get('/',(req,res)=>{
    res.send('Server is ready')
})

app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
});