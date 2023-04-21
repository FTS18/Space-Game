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
        //Slide Up on Page Load
slideTimer = setInterval(function() {
  $('.loading-screen').slideUp();
  $('body').removeClass('disabledScroll');
}, 1775); //3500