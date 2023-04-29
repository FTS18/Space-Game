function runPythonScript() {
  const { spawn } = require('child_process');

  // Run a Python script called script.py with arguments
  const pythonProcess = spawn('python', ['script.py', 'arg1', 'arg2']);

  // Log the output of the Python script to the console
  pythonProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  // Log any errors from the Python script to the console
  pythonProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
}
