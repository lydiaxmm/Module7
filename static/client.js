var socket = io.connect(window.location.origin);
var hasUsername = false;
var inGame = false;

var setUsernameEntry = function() {
    var entryDiv = document.getElementById("username_entry");
    if (hasUsername || inGame) {
	var numChildren = entryDiv.childNodes.length;
	for (var i = 0; i < numChildren; i++) { 
	    entryDiv.removeChild(entryDiv.firstChild);
	}
    } else {
	var labelForUsername = document.createElement("label");
	labelForUsername.innerHTML = "Enter a username: ";
	var textBox = document.createElement("input");
	textBox.setAttribute("id", "username");
	textBox.setAttribute("type", "text");
	var submitUsernameButton = document.createElement("input");
	submitUsernameButton.setAttribute("id", "submit_username");
	submitUsernameButton.setAttribute("type", "submit");
	submitUsernameButton.setAttribute("value", "Register Username");
	entryDiv.appendChild(labelForUsername);
	entryDiv.appendChild(textBox);
	entryDiv.appendChild(submitUsernameButton);
	document.getElementById("submit_username").addEventListener('click', function() {
            var username = document.getElementById("username").value;
            if (username && username !== "") {
		socket.emit("username", {
                    'username': username
		});
            }
	    hasUsername = true;
	    setUsernameEntry();
	    setInviteElements();
	}, false);
    }
};

var setInviteElements = function() {
    var listDiv = document.getElementById("listname");
    if (hasUsername && !inGame) {
	var labelForInvite = document.createElement("label");
	labelForInvite.innerHTML = "Select a user from the list below to invite them to a game";
	var submitInvite = document.createElement("input");
	submitInvite.setAttribute("id", "invite");
	submitInvite.setAttribute("type", "submit");
	submitInvite.setAttribute("value", "Invite User");
	listDiv.appendChild(labelForInvite);
	listDiv.appendChild(document.createElement("br"));
	listDiv.appendChild(submitInvite);
	document.getElementById("invite").addEventListener('click',function(){
            for(var i=0;i<document.getElementsByName("user").length;i++)
            {
		var button = document.getElementsByName("user")[i];
		if (button.checked) {
                    socket.emit("invite", {'opponent':button.id});
		}
            }
	},false);
    } else {
	var numChildren = listDiv.childNodes.length;
	for (var i = 0; i < numChildren; i++) {
	    listDiv.removeChild(listDiv.firstChild);
	}
    }
};

window.onload = function() {
    setUsernameEntry();
    setInviteElements();
}


socket.on("userEditer", function(content){
    if(hasUsername) {
	var listname=document.getElementById("listname");
        var newradio=document.createElement("input");
        newradio.setAttribute('id',content.username);
        newradio.setAttribute('type', "radio");
        newradio.setAttribute('name', "user");
        newradio.setAttribute('value', content.username);
        var newlabel = document.createElement("label");
        newlabel.setAttribute('id', content.username + "label");
        newlabel.innerHTML = content.username;
	listname.insertBefore(newradio, listname.lastChild);
	listname.insertBefore(newlabel, listname.lastChild);
	listname.insertBefore(document.createElement("br"), listname.lastChild);
    }
});

socket.on("dropUser", function(content) {
    if (hasUsername && !inGame) {
	var listname = document.getElementById("listname");
	var children = listname.childNodes;
	var numChildren = listname.childNodes.length;
	var radio, label, brTag;
	for (var i = 0; i < numChildren; i++) {
	    if (children[i].id === content.username) {
		radio = children[i];
		label = children[i+1];
		brTag = children[i+2];
		break;
	    }
	}
	listname.removeChild(radio);
	listname.removeChild(label);
	listname.removeChild(brTag);
    } else if (hasUsername && inGame) {
	//end the game gracefullly
	//also set inGame = false and call setInviteElements
    }
});

socket.on("invite", function(content) {
    var r=window.confirm("Do you want to start a game with "+content.opponent+"?");
    if (r==true) {
        socket.emit("start",{'opponent':content.opponent});
    }
});

socket.on("initialize", function(content) {
    inGame = true;
    setUsernameEntry();
    setInviteElements();
    alert("started game");
});