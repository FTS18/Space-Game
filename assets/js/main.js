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


//Slide Up on Page Load
slideTimer = setInterval(function() {
    $('.loading-screen').slideUp();
    $('body').removeClass('disabledScroll');
}, 1775); //3500

//NavBar Menu Code
document.addEventListener("DOMContentLoaded", () => {
    $("html").on("click", function(e) {
        let $t = $(e.target),
            $myLinks = document.getElementById("menu"),
            $toggleMenu = document.getElementByClassName("toggle");
        if ($t.is($myLinks) || $myLinks.has($t).length) {

        } else if ($t.is($toggleMenu) || $toggleMenu.has($t).length) {
            document.getElementByClassName("menuBtn").classList.toggle("active")
            document.getElementByClassName("menu").classList.toggle("active")
            document.getElementByClassName("page").classList.toggle("disabledScroll")
            document.getElementByClassName("logo").classList.toggle("hide")
            $('body').classList.add("disabledScroll")
        } else {
            document.getElementByClassName("menuBtn").classList.remove("active")
            document.getElementByClassName("menu").classList.remove("active")
            document.getElementByClassName("page").classList.remove("disabledScroll")
            document.getElementByClassName("logo").classList.remove("hide")
            $('body').classList.remove("disabledScroll")
        }
    })
});
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