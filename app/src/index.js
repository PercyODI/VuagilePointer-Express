///@ts-check
import $ from "jquery"
import io from "socket.io-client"
import "./styles.css"

const appSettings = {
    hostUrl: process.env.NODE_ENV == "production" 
        ? "https://vuagile-pointer.herokuapp.com" 
        :"http://localhost:3000"
}

// $(function(){
//     alert("It worked! or did it?");
// })

let socket = io.connect("http://localhost:3000");
socket.on("news", function(data){
    console.dir(data)
})