// Require the functionality we need to use:
var http = require('http'),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	path = require('path'),
        fs = require('fs'),
        io = require("socket.io");
 
// Make a simple fileserver for all of our static content.
// Everything underneath <STATIC DIRECTORY NAME> will be served.
var app = http.createServer(function(req, resp){
	var filename = path.join(__dirname, "static", url.parse(req.url).pathname);
	(fs.exists || path.exists)(filename, function(exists){
		if (exists) {
			fs.readFile(filename, function(err, data){
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}
 
				// File exists and is readable
				var mimetype = mime.lookup(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
				return;
			});
		}else{
			// File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("Requested file not found: "+filename);
			resp.end();
			return;
		}
	});
});

app.listen(3456);

var users = new Array();

io.listen(app).sockets.on("connection", function(socket) {
    users[users.length] = socket;
    socket.on("username", function(content) {
	for (var i = 0; i < users.length; i++) {
	    if (users[i].id === socket.id){
		users[i]['username'] = content.username;
	    }
	}
	for (var i = 0; i < users.length; i++) {
            if (users[i]['username'] != null && users[i]['username'] !== content.username) {
		socket.emit("userEditer",{username:users[i]['username']});
            }
	}
	socket.broadcast.emit("userEditer",{username:content.username});
    });
    
    socket.on("invite", function(content) {
	for (var j = 0; j < users.length; j++) {
	    if (!users[j]['ingame'] && users[j]['username'] === content.opponent) {
		users[j].emit("invite", {opponent:socket['username']});
	    }
	}	
    });
    socket.on("start",function(content) {
	for (var i = 0; i < users.length; i++) {
	    if (users[i]['username'] === content.opponent) {
		if (!users[i]['ingame'] || users[i]['ingame'] == false) {
		    socket.emit("initialize",{opponent:content.opponent});
		    users[i].emit("initialize",{opponent:socket['username']});
		    socket['ingame'] = true;
		    users[i]['ingame'] = true;
		    socket.broadcast.emit("dropUser",{username:socket['username']});
		    users[i].broadcast.emit("dropUser",{username:users[i]['username']});
		    return;
		}
	    }
	}
    });
    socket.on("disconnect", function(content) {
	socket.broadcast.emit("dropUser",{username:socket['username']});
    });
});