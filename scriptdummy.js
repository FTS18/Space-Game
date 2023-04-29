const { spawn } = require('child_process');

// get the input data from the HTTP request
let inputData = '';
process.stdin.on('data', (data) => {
  inputData += data;
});

// run the Python script with the input data
const pythonProcess = spawn('python', ['finaldummy.py', inputData]);

// return the result to the HTTP response
pythonProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});
