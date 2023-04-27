console.log('Hello World!');

//Ripple Event Handler
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

//Ripple Triggers
window.addEventListener("click", drawRipple);

function rate() {
    var promptx = document.querySelector(".rating");
    promptx.style.display = "flex";
    promptx.style.opacity = "1";
    promptx.style.transition = "1s ease-in-out"
}

function closeModal() {
    var promptx = document.querySelector(".rating");
    promptx.style.display = "none";
    promptx.style.opacity = "0";
}

//Slide Up on Page Load
slideTimer = setInterval(function() {
    $('.loading-screen').slideUp();
    $('body').removeClass('disabledScroll');
}, 1550); //3500

function sendMail() {
    var params = {
        name: ('Client').value,
        email: ("teamfinixx@gmail.com").value,
        message: document.getElementById("message").value,
    };
    const serviceID = "service_a9sz0qu";
    const templateID = "template_9q6eoie";
    emailjs.send(serviceID, templateID, params)
        .then(res => {
            document.getElementById("name").value = "";
            ("teamfinixx@gmail.com").value = "";
            document.getElementById("message").value = "";
            console.log(res);
            alert("Your message sent successfully!!")
        })
        .catch(err => console.log(err));
}
/*
function loadStyle() {
  var styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.type = 'text/css';
  styles.media = 'all';
  styles.href = 'assets/css/theme.css';
  document.getElementsByTagName('head')[0].appendChild(styles);
};
window.onload = loadStyle();
*/