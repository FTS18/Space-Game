console.log('Hello World!');

var drawRipple = function(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var node = document.querySelector(".ripple");
    var newNode = node.cloneNode(true);
    newNode.classList.add("animate");
    newNode.style.left = ev.clientX - 5 + "px";
    newNode.style.top = ev.clientY - 5 + "px";
    node.parentNode.replaceChild(newNode, node);
};

window.addEventListener("click", drawRipple);
function rate() {
    var promptx = document.querySelector("c-rate");
    promptx.classList.toggle("activez");
}

slideTimer = setInterval(function() {
    $('.loading-screen').slideUp();
    $('body').removeClass('disabledScroll');
}, 1550); //3500

function sendMail() {
    var message = document.getElementById("message").value;
    if (message.trim() === "") {
        alert("Please enter a message before sending.");
        return;
    }

    var params = {
        name: 'Client',
        email: "teamfinixx@gmail.com",
        message: message,
    };
    const serviceID = "service_a9sz0qu";
    const templateID = "template_9q6eoie";
    emailjs.send(serviceID, templateID, params)
        .then(res => {
            console.log(res);
            alert("Your message sent successfully!!");
            rate(); // Call rate() after sending the email if that's your intended behavior
        })
        .catch(err => console.log(err));
}
