export default function pass_word_verify(text){
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if(regex.test(text)){
        console.log("Not met the required specification");
        
        return true;
    }
    else{
        console.log("Not met the required specification");
        
        return false;

    }
}