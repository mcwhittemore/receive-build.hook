var colors = require("colors");
var spawn = require("child_process").spawn;
var fs = require("fs");


var hook = process.argv[2];

var validHooks = ["post-update"];

var regEx = /^refs\/tags\/v[0-9]*.[0-9]*.[0-9]*$/g;


var run = function(command, args, callback){
	var action = spawn(command, args);

	action.stderr.on("data", function(data){
		process.stderr.write(data);
	});

	action.stdout.on("data", function(data){
		process.stdout.write(data);
	});

	action.on("error", function(){
		console.error("error", arguments);
	})

	action.on("close", function(code){
		callback(code);
	});
}

var buildFolder = process.cwd()+"/../builds/";


var isBuild = function(refName){
	return refName.search(regEx) != -1;
}

var getBuildId = function(refName){
	return refName.replace("refs/tags/v", "");
}

if(validHooks.indexOf(hook)==-1){
	console.log("pull-checkout-merge-command.hook".blue+" is not valid for "+hook.red+".");
	console.log("No commands will be run!".red);
	process.exit(1);
}
else{
	var args = process.argv.splice(3);
	if(isBuild(args[0])){
		var buildId = getBuildId(args[0]);

		var buildPath = buildFolder+buildId;

		if(fs.existsSync(buildPath)){
			console.log("Build already exists".red);
			process.exit(1);
		}
		else{
			try{
				fs.mkdirSync(buildPath);
			}
			catch(err){
				console.log("Failed to create build path", buildPath);
				console.log(err);
				process.exit(1);
			}


			run("git", ["--work-tree="+buildFolder+buildId+"/", "checkout", "v"+buildId], function(code){
				if(code && code!=0){
					console.log("Checkout failed".red);
					process.exit(code);
				}
				else{
					console.log("Success".blue);
				}
			});

		}
		
	}
}
