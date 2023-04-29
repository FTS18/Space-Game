const { spawn } = require('child_process');

const pyProg = spawn('python', ['finaldummy.py']);

pyProg.stdout.on('data', function(data) {
	console.log(data.toString());
});

pyProg.stderr.on('data', (data) => {
	console.error(data.toString());
});
