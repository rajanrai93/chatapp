const port = process.env.PORT || 10001;
const server = require("http").Server();

var io = require("socket.io")(server);

var allusers = {};
var allstickers = {};
var usernames = [];
var msgs = [];


io.on("connection", function(socket){
    console.log("user is connected");
    
    
    socket.on("username", function(data){
        
        console.log("User is giving username: "+data);
        usernames.push(data);
        
        io.emit("usersjoined", usernames);
        
        
    })
    
    socket.on("sendChat", function(data){
        console.log("users sent a msg");
        msgs.push(data);
        
        io.emit("msgssent", msgs);
        
        
        
    });
    
      socket.on('change color', (color) => {
    // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
    // we make use of the socket.emit method again with the argument given to use from the callback function above
    console.log('Color Changed to: ', color)
    io.sockets.emit('change color', color)
  })
    
    socket.on("disconnect", function(){
        console.log("user has disconnected");
        
        
        
    })
    
});

io.on("connection", function(socket){
    console.log("user is connected");
	
    socket.on("stick", function(data){
        allstickers[this.myRoom].push(data);
        
        io.to(this.myRoom).emit("newsticker", allstickers[this.myRoom]);
    });
    
    
    
    
    
    socket.on("joinroom", function(data){
        console.log(data);
        socket.join(data);
        
        socket.myRoom = data;
        socket.emit("yourid", socket.id);
        
        if(!allusers[data]){
            allusers[data] = [];
        }
        
        if(!allstickers[data]){
            allstickers[data] = [];
        }
        
        allusers[data].push(socket.id);
        io.to(data).emit("userjoined", allusers[data]);
        io.to(data).emit("newsticker", allstickers[data]);
        
    });
    
    socket.on("mymove", function(data){
        console.log(data);
        socket.to(this.myRoom).emit("newmove", data); 
    });
    
    socket.on("disconnect", function(){
        if(this.myRoom){
            var index = allusers[this.myRoom].indexOf(socket.id);
            allusers[this.myRoom].splice(index,1);
            io.to(this.myRoom).emit("userjoined", allusers[this.myRoom]);
        }
    })
});

server.listen(port, (err)=>{
    if(err){
        console.log(err);
        return false;
    }
    
    console.log("Port is running");
})