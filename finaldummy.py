import js2py
a = 'arunjay'
b = 1234
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
