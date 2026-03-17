export default function validator(text) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
        console.log("Invalid email id!");
        
        return false;
    }

    if (emailRegex.test(text)) {
        {
            return true;
        }
    } else {
        return false;
    }

};