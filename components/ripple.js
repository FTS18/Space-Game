const rippleTemplate = document.createElement('template');

swiperTemplate.innerHTML = `
    <style>
    .ripple {
        width: 8px;
        height: 8px;
        opacity: 0;
        transform: scale(0);
        border-radius: 50%;
        position: fixed;
        z-index: 500000;
        background: rgba(255, 255, 255, 0.3);
    }
    /*Animate Function*/
    
    .animate {
        animation: ripple-mo .5s cubic-bezier(0, 0, 0.2, 1);
    }
    
    @keyframes ripple-mo {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(9.5);
            opacity: 0;
        }
    }
    </style>
    <div class="ripple"></div>
    <script>
    
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
    </script>
    `;

class Ripple extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(rippleTemplate.content);
    }
}

customElements.define('c-swiper', Ripple);