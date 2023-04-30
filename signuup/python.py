from flask import Flask, request
import js2py

app = Flask(__name__)

def execute_script(input1, input2):
    # Your Python script here
   a = input1
   b = input2
   # Load the JavaScript code from a file
   with open('data.js', 'r') as f:
        js_code = f.read()

   # Create a JavaScript context using js2py
   context = js2py.EvalJs()

   # Execute the JavaScript code in the context
   context.execute(js_code)

   # Get the global object from the context
   global_object = context.this

   # Get the values of the variables
   foo_value = global_object.names
   bar_value = global_object.passwords

   # Print the values of the variables
   newna = list(foo_value) + [a]
   newpa= list(bar_value) + [b]
   new_js_code = f"""
       const names = {newna}
       const passwords = {newpa}
   """

   with open('data.js', 'w') as f:
       f.write(new_js_code)
   return 'hello i am arunjay'
@app.route('/')
def index():
    with open('helllo.html', 'r') as file:
        return file.read()

@app.route('/script.js')
def script():
    with open('script.js', 'r') as file:
        return file.read()

@app.route('/run-script', methods=['POST'])
def run_script():
    input1 = request.json['input1']
    input2 = request.json['input2']
    output = execute_script(input1, input2)
    return output

if __name__ == '__main__':
    app.run(debug=True)