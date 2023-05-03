window.onload = function() {
  const form = document.querySelector('form');
  const output = document.querySelector('#output');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input1 = form.input1.value;
    const input2 = form.input2.value;
    
    const response = await fetch('/run-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input1, input2 })
    });
    
    if (response.ok) {
      const data = await response.text();
      output.textContent = data;
    } else {
      output.textContent = 'Error executing script.';
    }
  });
};
