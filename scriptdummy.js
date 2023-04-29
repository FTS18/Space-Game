const runBtn = document.getElementById('run-btn');
runBtn.addEventListener('click', function() {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', 'script.php', true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			console.log(xhr.responseText);
		}
	};
	xhr.send();
});
