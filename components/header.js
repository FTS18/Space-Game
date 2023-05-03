const headerTemplate = document.createElement('template');

headerTemplate.innerHTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  font-family: 'Chivo Mono', monospace;
}
body::-webkit-scrollbar {
    width: 14px;
    background: #111111;
}

body::-webkit-scrollbar-track {
    box-shadow: inset 0 0 0px rgba(0, 0, 0, 0.7);
}

body::-webkit-scrollbar-thumb {
    background-color: #383838;
    border: 3.8px solid #111111;
    border-radius: 6px;
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    -ms-border-radius: 6px;
    -o-border-radius: 6px;
}
.wrapper{
  background: #000;
  position: fixed;
  width: 100%;
}
.wrapper nav{
  position: relative;
  display: flex;
  max-width: calc(100% - 200px);
  margin: 0 auto;
  height: 75px;
  align-items: center;
  justify-content: space-between;
}
nav .content{
  display: flex;
  align-items: center;
}
nav .content .links{
  margin-left: 380px;
  display: flex;
}
.content .logo a{
  color: #ccc;
  font-size: 30px;
  font-weight: 600;
}
.content .links li{
  list-style: none;
  line-height: 70px;
}
.content .links li a,
.content .links li label{
  color: #ccc;
  font-size: 18px;
  font-weight: 500;
  padding: 9px 17px;
  border-radius: 5px;
  transition: all 0.3s ease;
}
.content .links li label{
  display: none;
}
.content .links li a:hover,
.content .links li label:hover{
  background: #111;
}
.content .links li .active{
  color: #ff0040;
}
.wrapper .search-icon,
.wrapper .menu-icon{
  color: #ff0040;
  font-size: 18px;
  cursor: pointer;
  line-height: 70px;
  width: 70px;
  text-align: center;
}
.wrapper .menu-icon{
  display: none;
}
.wrapper #show-search:checked ~ .search-icon i::before{
  content: "\f00d";
}

.wrapper .search-box{
  position: absolute;
  height: 100%;
  max-width: calc(100% - 50px);
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}
.wrapper #show-search:checked ~ .search-box{
  opacity: 1;
  pointer-events: auto;
}
.search-box input{
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 17px;
  color: #ccc;
  position: relative;
  z-index: 10000;
  background: #222;
  padding: 0 100px 0 15px;
}
.search-box input::placeholder{
  color: #f2f2f2;
}
.search-box .go-icon{
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  line-height: 60px;
  width: 70px;
  height: 100%;
  background: #121212;
  border: none;
  outline: none;
  z-index: 10001;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
}
.wrapper input[type="checkbox"]{
  display: none;
}
.logo {
    top: 3px;
    left: 0px;
    position: relative;
    width: 120px;
    height: auto;
    -webkit-tap-highlight-color: transparent;
    z-index: 10;
    float: left;
    transition: .5s ease-in-out;
}

#svg {
  position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
}

/* Dropdown Menu code start */
.content .links ul{
  position: absolute;
  background: #000;
  top: 80px;
  z-index: -1;
  opacity: 0;
  visibility: hidden;
}
.content .links li:hover > ul{
  top: 70px;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
}
.content .links ul li a{
  display: block;
  width: 100%;
  line-height: 30px;
  border-radius: 0px!important;
}
.content .links .active{
  color: #ff0040;
  background: #222;
  margin-left: 15px;
  margin-right: 20px;
}
.content .links ul ul{
  position: absolute;
  top: 0;
  right: calc(-100% + 8px);
}
.content .links ul li{
  position: relative;
}
.content .links ul li:hover ul{
  top: 0;
}

/* Responsive code start */
@media screen and (max-width: 1250px){
  .wrapper nav{
    max-width: 100%;
    padding: 0 20px;
  }
  nav .content .links{
    margin-left: 270px;
  }
  .content .links li a{
    padding: 8px 13px;
  }
  .wrapper .search-box{
    max-width: calc(100% - 100px);
  }
  .wrapper .search-box input{
    padding: 0 100px 0 15px;
  }
}

@media screen and (max-width: 900px){
  .wrapper .menu-icon{
    display: block;
  }
  .wrapper #show-menu:checked ~ .menu-icon i::before{
    content: "\f00d";
  }
  nav .content .links{
    display: block;
    position: fixed;
    background: #000;
    height: 100%;
    width: 100%;
    top: 70px;
    left: -100%;
    margin-left: 0;
    max-width: 300px;
    overflow-y: auto;
    padding-bottom: 100px;
    transition: all 0.3s ease;
  }
  nav #show-menu:checked ~ .content .links{
    left: 0%;
  }
  .content .links li{
    margin: 15px 20px;
  }
  .content .links li a,
  .content .links li label{
    line-height: 40px;
    font-size: 16px;
    display: block;
    padding: 8px 18px;
    cursor: pointer;
  }
  .content .links .active{
    color: #ff0040;
    background: #111;
    margin:0;
  }
  .content .links li a.desktop-link{
    display: none;
  }

  /* dropdown responsive code start */
  .content .links ul,
  .content .links ul ul{
    position: static;
    opacity: 1;
    visibility: visible;
    background: none;
    max-height: 0px;
    overflow: hidden;
  }
  .content .links #show-features:checked ~ ul,
  .content .links #show-services:checked ~ ul,
  .content .links #show-items:checked ~ ul{
    max-height: 100vh;
  }
  .content .links ul li{
    margin: 7px 20px;
  }
  .content .links ul li a{
    font-size: 18px;
    line-height: 30px;
    border-radius: 5px!important;
  }
}

@media screen and (max-width: 400px){
  .wrapper nav{
    padding: 0 10px;
  }
  .content .logo a{
    font-size: 27px;
  }
  .wrapper .search-box{
    max-width: calc(100% - 70px);
  }
  .wrapper .search-box .go-icon{
    width: 30px;
    right: 0;
  }
  .wrapper .search-box input{
    padding-right: 30px;
  }
}

.dummy-text{
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  z-index: -1;
  padding: 0 20px;
  text-align: center;
  transform: translate(-50%, -50%);
}
.dummy-text h2{
  font-size: 45px;
  margin: 5px 0;
}
</style>
<div class="wrapper">
<nav>
  <input type="checkbox" id="show-search">
  <input type="checkbox" id="show-menu">
  <label for="show-menu" class="menu-icon"><i class="fas fa-bars"></i></label>
  <div class="content">
  <div class="logo">
  <a class="logo " href="index_real.html">
    <img id="svg" alt="" src="assets/images/logo.png" />
  </a>
  </div>
    <ul class="links">
      <li><a class="active" href="index.html">Home</a></li>
      <li>
        <a href="#" class="desktop-link">Connect</a>
        <input type="checkbox" id="show-services">
        <label for="show-services">Connect</label>
        <ul>
          <li><a href="mailto:teamfinixx@gmail.com">Mail Us</a></li>
          <li><a href="https://chat.whatsapp.com/ECHJEEU1w901D89UMd0c3m">Discuss</a></li>
          <!---->
        </ul>
      </li>
      <!-- class desktop-link to show only in desktop-->
      <li><a href="coming-soon.html">Explore</a></li>
      <li><a href="#" class="desktop-link">Developers</a>
      <input type="checkbox" id="show-items">
      <label for="show-items">Developers</label>
      <ul>
      <li><a href="https://github.com/fts18">Ananay</a></li>
      <li><a href="https://github.com/Arunjay126">Arunjay</a></li>
      </ul>
    </li>
      <li><a href="#feedback">Feedback</a></li>
    </ul>
  </div>
  <label for="show-search" class="search-icon"><i class="fas fa-search"></i></label>
  <form action="#" class="search-box">
    <input type="text" placeholder="Type Something to Search..." required>
    <button type="submit" class="go-icon"><i class="fas fa-long-arrow-alt-right"></i></button>
  </form>
</nav>
</div>
`;

class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(headerTemplate.content);
    }
}
customElements.define('c-nav', Header);

const headerTemplate1 = document.createElement('template')
headerTemplate1.innerHTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  font-family: 'Chivo Mono', monospace;
}
body::-webkit-scrollbar {
    width: 14px;
    background: #111111;
}

body::-webkit-scrollbar-track {
    box-shadow: inset 0 0 0px rgba(0, 0, 0, 0.7);
}

body::-webkit-scrollbar-thumb {
    background-color: #383838;
    border: 3.8px solid #111111;
    border-radius: 6px;
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    -ms-border-radius: 6px;
    -o-border-radius: 6px;
}
.wrapper{
  background: #000;
  position: fixed;
  width: 100%;
}
.wrapper nav{
  position: relative;
  display: flex;
  max-width: calc(100% - 200px);
  margin: 0 auto;
  height: 75px;
  align-items: center;
  justify-content: space-between;
}
nav .content{
  display: flex;
  align-items: center;
}
nav .content .links{
  margin-left: 380px;
  display: flex;
}
.content .logo a{
  color: #ccc;
  font-size: 30px;
  font-weight: 600;
}
.content .links li{
  list-style: none;
  line-height: 70px;
}
.content .links li a,
.content .links li label{
  color: #ccc;
  font-size: 18px;
  font-weight: 500;
  padding: 9px 17px;
  border-radius: 5px;
  transition: all 0.3s ease;
}
.content .links li label{
  display: none;
}
.content .links li a:hover,
.content .links li label:hover{
  background: #111;
}
.content .links li .active{
  color: #ff0040;
}
.wrapper .search-icon,
.wrapper .menu-icon{
  color: #ff0040;
  font-size: 18px;
  cursor: pointer;
  line-height: 70px;
  width: 70px;
  text-align: center;
}
.wrapper .menu-icon{
  display: none;
}
.wrapper #show-search:checked ~ .search-icon i::before{
  content: "\f00d";
}

.wrapper .search-box{
  position: absolute;
  height: 100%;
  max-width: calc(100% - 50px);
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}
.wrapper #show-search:checked ~ .search-box{
  opacity: 1;
  pointer-events: auto;
}
.search-box input{
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 17px;
  color: #ccc;
  position: relative;
  z-index: 10000;
  background: #222;
  padding: 0 100px 0 15px;
}
.search-box input::placeholder{
  color: #f2f2f2;
}
.search-box .go-icon{
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  line-height: 60px;
  width: 70px;
  height: 100%;
  background: #121212;
  border: none;
  outline: none;
  z-index: 10001;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
}
.wrapper input[type="checkbox"]{
  display: none;
}
.logo {
    top: 3px;
    left: 0px;
    position: relative;
    width: 120px;
    height: auto;
    -webkit-tap-highlight-color: transparent;
    z-index: 10;
    float: left;
    transition: .5s ease-in-out;
}

#svg {
  position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
}

/* Dropdown Menu code start */
.content .links ul{
  position: absolute;
  background: #000;
  top: 80px;
  z-index: -1;
  opacity: 0;
  visibility: hidden;
}
.content .links li:hover > ul{
  top: 70px;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
}
.content .links ul li a{
  display: block;
  width: 100%;
  line-height: 30px;
  border-radius: 0px!important;
}
.content .links .active{
  color: #ff0040;
  background: #222;
  margin-left: 15px;
  margin-right: 20px;
}
.content .links ul ul{
  position: absolute;
  top: 0;
  right: calc(-100% + 8px);
}
.content .links ul li{
  position: relative;
}
.content .links ul li:hover ul{
  top: 0;
}

/* Responsive code start */
@media screen and (max-width: 1250px){
  .wrapper nav{
    max-width: 100%;
    padding: 0 20px;
  }
  nav .content .links{
    margin-left: 270px;
  }
  .content .links li a{
    padding: 8px 13px;
  }
  .wrapper .search-box{
    max-width: calc(100% - 100px);
  }
  .wrapper .search-box input{
    padding: 0 100px 0 15px;
  }
}

@media screen and (max-width: 900px){
  .wrapper .menu-icon{
    display: block;
  }
  .wrapper #show-menu:checked ~ .menu-icon i::before{
    content: "\f00d";
  }
  nav .content .links{
    display: block;
    position: fixed;
    background: #000;
    height: 100%;
    width: 100%;
    top: 70px;
    left: -100%;
    margin-left: 0;
    max-width: 300px;
    overflow-y: auto;
    padding-bottom: 100px;
    transition: all 0.3s ease;
  }
  nav #show-menu:checked ~ .content .links{
    left: 0%;
  }
  .content .links li{
    margin: 15px 20px;
  }
  .content .links li a,
  .content .links li label{
    line-height: 40px;
    font-size: 16px;
    display: block;
    padding: 8px 18px;
    cursor: pointer;
  }
  .content .links .active{
    color: #ff0040;
    background: #111;
    margin:0;
  }
  .content .links li a.desktop-link{
    display: none;
  }

  /* dropdown responsive code start */
  .content .links ul,
  .content .links ul ul{
    position: static;
    opacity: 1;
    visibility: visible;
    background: none;
    max-height: 0px;
    overflow: hidden;
  }
  .content .links #show-features:checked ~ ul,
  .content .links #show-services:checked ~ ul,
  .content .links #show-items:checked ~ ul{
    max-height: 100vh;
  }
  .content .links ul li{
    margin: 7px 20px;
  }
  .content .links ul li a{
    font-size: 18px;
    line-height: 30px;
    border-radius: 5px!important;
  }
}

@media screen and (max-width: 400px){
  .wrapper nav{
    padding: 0 10px;
  }
  .content .logo a{
    font-size: 27px;
  }
  .wrapper .search-box{
    max-width: calc(100% - 70px);
  }
  .wrapper .search-box .go-icon{
    width: 30px;
    right: 0;
  }
  .wrapper .search-box input{
    padding-right: 30px;
  }
}

.dummy-text{
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  z-index: -1;
  padding: 0 20px;
  text-align: center;
  transform: translate(-50%, -50%);
}
.dummy-text h2{
  font-size: 45px;
  margin: 5px 0;
}
</style>
<div class="wrapper">
<nav>
  <input type="checkbox" id="show-search">
  <input type="checkbox" id="show-menu">
  <label for="show-menu" class="menu-icon"><i class="fas fa-bars"></i></label>
  <div class="content">
  <div class="logo">
  <a class="logo " href="index.html">
    <img id="svg" alt="" src="assets/images/logo.png" />
  </a>
  </div>
    <ul class="links">
      <li><a href="index.html">Home</a></li>
      <li>
        <a href="#" class="desktop-link">Connect</a>
        <input type="checkbox" id="show-services">
        <label for="show-services">Connect</label>
        <ul>
          <li><a href="login.html">Mail Us</a></li>
          <li><a href="login.html">Discuss</a></li>
          <!---->
        </ul>
      </li>
      <!-- class desktop-link to show only in desktop-->
      <li><a href="coming-soon.html">Explore</a></li>
      <li><a href="#" class="desktop-link">Developers</a>
      <input type="checkbox" id="show-items">
      <label for="show-items">Developers</label>
      <ul>
      <li><a href="login.html">Ananay</a></li>
      <li><a href="login.html">Arunjay</a></li>
      </ul>
    </li>
      <li><a href="coming-soon.html">Feedback</a></li>
      <li><a class="active" href="login.html">Login</a></li>
    </ul>
  </div>
  <label for="show-search" class="search-icon"><i class="fas fa-search"></i></label>
  <form action="#" class="search-box">
    <input type="text" placeholder="Type Something to Search..." required>
    <button type="submit" class="go-icon"><i class="fas fa-long-arrow-alt-right"></i></button>
  </form>
</nav>
</div>
`;

class Header1 extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(headerTemplate1.content);
    }
}
customElements.define('c-nav1', Header1);

const headerTemplate2 = document.createElement('template');
headerTemplate2.innerHTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  font-family: 'Chivo Mono', monospace;
}
body::-webkit-scrollbar {
    width: 14px;
    background: #111111;
}

body::-webkit-scrollbar-track {
    box-shadow: inset 0 0 0px rgba(0, 0, 0, 0.7);
}

body::-webkit-scrollbar-thumb {
    background-color: #383838;
    border: 3.8px solid #111111;
    border-radius: 6px;
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    -ms-border-radius: 6px;
    -o-border-radius: 6px;
}
.wrapper{
  background: #000;
  position: fixed;
  width: 100%;
}
.wrapper nav{
  position: relative;
  display: flex;
  max-width: calc(100% - 200px);
  margin: 0 auto;
  height: 75px;
  align-items: center;
  justify-content: space-between;
  width:100%;
}
nav .content{
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1220px;
  margin:0px auto;
}
nav .content .links{
  margin-left: 530px;
  display: flex;
}
.content .logo a{
  color: #ccc;
  font-size: 30px;
  font-weight: 600;
}
.content .links li{
  list-style: none;
  line-height: 70px;
}
.content .links li a,
.content .links li label{
  color: #ccc;
  font-size: 18px;
  font-weight: 500;
  padding: 9px 17px;
  border-radius: 5px;
  transition: all 0.3s ease;
}
.content .links li label{
  display: none;
}
.content .links li a:hover,
.content .links li label:hover{
  background: #111;
}
.content .links li .active{
  color: #ff0040;
}
.wrapper .menu-icon{
  color: #ff0040;
  font-size: 18px;
  cursor: pointer;
  line-height: 70px;
  width: 70px;
  text-align: center;
}
.wrapper .menu-icon{
  display: none;
}
.wrapper input[type="checkbox"]{
  display: none;
}
.logo {
    top: 3px;
    left: 0px;
    position: relative;
    width: 120px;
    height: auto;
    -webkit-tap-highlight-color: transparent;
    z-index: 10;
    float: left;
    transition: .35s ease-in-out;
}

#svg {
  position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
}

/* Dropdown Menu code start */
.content .links ul{
  position: absolute;
  background: #000;
  top: 80px;
  z-index: -1;
  opacity: 0;
  visibility: hidden;
}
.content .links li:hover > ul{
  top: 70px;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
}
.content .links ul li a{
  display: block;
  width: 100%;
  line-height: 30px;
  border-radius: 0px!important;
}
.content .links .active{
  color: #ff0040;
  background: #222;
  margin-left: 15px;
  margin-right: 20px;
}
.content .links ul ul{
  position: absolute;
  top: 0;
  right: calc(-100% + 8px);
}
.content .links ul li{
  position: relative;
}
.content .links ul li:hover ul{
  top: 0;
}

.back img {
  position: relative;
  top: 0px;
  left: 100%;
  width: 25px;
  filter: invert(100%);
}
.back {
  color: #ff0040;
  font-size: 18px;
  cursor: pointer;
  line-height: 70px;
  width: 70px;
  text-align: center;
  position: relative;
  top: 8px;
  right: 50px;
  margin-bottom: 0;
  display: none;
}
/* Responsive code start */
@media screen and (max-width: 1250px){
  .wrapper nav{
    max-width: 100%;
    padding: 0 20px;
  }

  nav .content{
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 850px;
    margin:0px auto;
  }

  nav .content .links{
    margin-left: 250px;
  }
  .content .links li a{
    padding: 8px 13px;
  }
}

@media screen and (max-width: 900px){
  .wrapper .menu-icon{
    display: block;
  }
  .back{
    display: block
  }
  .wrapper #show-menu:checked ~ .menu-icon i::before{
    content: "\f00d";
  }
  nav .content .links{
    display: block;
    position: fixed;
    background: #000;
    height: 100%;
    width: 100%;
    top: 70px;
    left: -100%;
    margin-left: 0;
    max-width: 300px;
    overflow-y: auto;
    padding-bottom: 100px;
    transition: all 0.3s ease;
  }
  nav #show-menu:checked ~ .content .links{
    left: 0%;
  }
  .content .links li{
    margin: 15px 20px;
  }
  .content .links li a,
  .content .links li label{
    line-height: 40px;
    font-size: 16px;
    display: block;
    padding: 8px 18px;
    cursor: pointer;
  }
  .content .links .active{
    color: #ff0040;
    background: #111;
    margin:0;
  }
  .content .links li a.desktop-link{
    display: none;
  }

  /* dropdown responsive code start */
  .content .links ul,
  .content .links ul ul{
    position: static;
    opacity: 1;
    visibility: visible;
    background: none;
    max-height: 0px;
    overflow: hidden;
  }
  .content .links #show-features:checked ~ ul,
  .content .links #show-services:checked ~ ul,
  .content .links #show-items:checked ~ ul{
    max-height: 100vh;
  }
  .content .links ul li{
    margin: 7px 20px;
  }
  .content .links ul li a{
    font-size: 18px;
    line-height: 30px;
    border-radius: 5px!important;
  }
  .logo{
    top:2px;
    width: 110px;
    left: 50%;
    transform: translate(-50%);
  }
}

@media screen and (max-width: 400px){

  .content .logo a{
    font-size: 27px;
  }
  .wrapper .search-box{
    max-width: calc(100% - 70px);
  }
  .wrapper .search-box input{
    padding-right: 30px;
  }
}

.dummy-text{
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  z-index: -1;
  padding: 0 20px;
  text-align: center;
  transform: translate(-50%, -50%);
}
.dummy-text h2{
  font-size: 45px;
  margin: 5px 0;
}

</style>
<div class="wrapper">
<nav>
  <input type="checkbox" id="show-search">
  <input type="checkbox" id="show-menu">
  <label for="show-menu" class="menu-icon"><i class="fas fa-bars"></i></label>
  <div class="content">
  <div class="logo">
  <a class="logo " href="index_real.html">
    <img id="svg" alt="" src="assets/images/logo.png" />
  </a>
  </div>
  <ul class="links">
    <li><a class="active" href="index.html">Home</a></li>
    <li>
      <a href="#" class="desktop-link">Connect</a>
      <input type="checkbox" id="show-services">
      <label for="show-services">Connect</label>
      <ul>
        <li><a href="mailto:teamfinixx@gmail.com">Mail Us</a></li>
        <li><a href="https://chat.whatsapp.com/ECHJEEU1w901D89UMd0c3m">Discuss</a></li>
        <!---->
      </ul>
    </li>
    <!-- class desktop-link to show only in desktop-->
    <li><a href="coming-soon.html">Explore</a></li>
    <li><a href="#" class="desktop-link">Developers</a>
    <input type="checkbox" id="show-items">
    <label for="show-items">Developers</label>
    <ul>
    <li><a href="https://github.com/fts18">Ananay</a></li>
    <li><a href="https://github.com/Arunjay126">Arunjay</a></li>
    </ul>
  </li>
    <li><a href="#feedback">Feedback</a></li>
  </ul>
  </div>
  <div class="back">
      <a href="./index_real">
          <img alt="" class="go-icon" src="https://img.icons8.com/external-simple-solid-edt.graphics/100/000000/external-Back-arrows-simple-solid-edt.graphics.png" />
      </a>
  </div>
</nav>
</div>
`;
class Header2 extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(headerTemplate2.content);
    }
}
customElements.define('c-nav2', Header2);

const ratingTemplate = document.createElement('template');
ratingTemplate.innerHTML = `
<script src="https://kit.fontawesome.com/28917c5b69.js" crossorigin="anonymous"></script>
<script src="../assets/js/main.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

<style>
.radio-stars {
  display: inline-block;
  position: relative;
  unicode-bidi: bidi-override;
  direction: rtl;
  counter-reset: star-rating;
  font-size: 0;
}

.radio-stars:hover .radio-star::before {
  content: "☆";
}

.radio-stars:hover .radio-star:hover::before,
.radio-stars:hover .radio-star:hover~.radio-star::before {
  content: "★";
}

.radio-star {
  display: inline-block;
  overflow: hidden;
  cursor: pointer;
  padding: 0 2.1px;
  width: 0.82em;
  direction: ltr;
  font-size: 40px;
  white-space: nowrap;
  color: #ccc;
  left: 50%;
  transform: translate(-50%);
  -webkit-transform: translate(-50%);
  -moz-transform: translate(-50%);
  -ms-transform: translate(-50%);
  -o-transform: translate(-50%);
}

.radio-star::before {
  content: "☆";
}

.radio-star:hover~.radio-star,
input:checked~.radio-star {
  color: #ffae00;
}

.radio-star:hover {
  color: #ccc;
}

input:checked~.radio-star {
  counter-increment: star-rating;
}

input:checked~.radio-star::before {
  content: "★";
}

.radio-star-total {
  pointer-events: none;
  direction: ltr;
  unicode-bidi: bidi-override;
  position: absolute;
  right: -1.2em;
  bottom: 0.5em;
  color: gray;
  color: white;
  font-size: 20px;
}

.radio-star-total::before {
  content: counter(star-rating) "/5";
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  margin: -1px;
  padding: 0;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 40px;
  height: 40px;
  color: #ff0040;
  background: #080808;
  border-radius: 50px;
}

.close i {
  width: 100%;
  color: #777;
  font-size: 25px;
  cursor: pointer;
  text-align: center;
  transition: .2s all ease-in-out;
}
.close i:hover {
  color: #ff0040;
  right: 5px;
  font-size: 27px;
}
.rating {
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  width: 100%;
  height: 35px;
  margin: 40px 0px;
}
.feedback {
    position: fixed;
    top: 40%;
    left:50%;
    width: 100%;
    height: 390px;
    padding-top: 50px;
    display: grid;
    grid-gap: 0rem;
    max-width: 763px;
    margin: 50px auto;
    transform: translate(-50%, -50%);
    z-index: 100000;
    border-radius: 12px;
}

.f-form {
    position: fixed;
    top: 5%;
    left: 50%;
    transform: translate(-50%, 0%);
    background: #121212;
    color: #ddd;
    width: 100%;
    height: 345px;
    padding: 10px;
    font-size: 30px;
    border-radius: 20px;
    -webkit-transform: translate(-50%, 0%);
    -moz-transform: translate(-50%, 0%);
    -ms-transform: translate(-50%, 0%);
    -o-transform: translate(-50%, 0%);
    border: 1px solid #333;
}

.f-contaniner {
    margin: 0px 20px;
}

.f-group {
    margin: 0px 0px;
    overflow: hidden;
}

.f-group h5 {
    font-size: 22px;
    color: #ccc;
}

.f-control {
    width: 100%;
    background: #222;
    outline: none;
    border: none;
    padding: 10px;
    font-size: 18px;
    border-radius: 4px;
    margin: 2px 0px;
    transition: 0.5s ease-in-out;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    -ms-border-radius: 4px;
    -o-border-radius: 4px;
    -webkit-transition: 0.5s ease-in-out;
    -moz-transition: 0.5s ease-in-out;
    -ms-transition: 0.5s ease-in-out;
    -o-transition: 0.5s ease-in-out;
}

.btn-primary {
    margin: 0px 0px;
    padding: 10px 20px;
    background: #ff0040;
    color: #ddd;
    width: 100%;
    height: 55px;
    transition: 0.3s ease-in-out;
    -webkit-transition: 0.3s ease-in-out;
    -moz-transition: 0.3s ease-in-out;
    -ms-transition: 0.3s ease-in-out;
    -o-transition: 0.3s ease-in-out;
    font-size: 25px;
    font-family: "Poppins", sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    border-radius: 8px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.btn-primary:hover {
    background: #ddd;
    color: #ff0040;
    letter-spacing: 1.25px;
    border-radius: 50px;
}
input,
textarea,
button,
select,
a,
img {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    text-decoration: none;
    border: none;
    outline: none;
    user-select: none;
    color: white;
}

</style>
<section class="feedback">
  <div class="f-form">
    <div class="f-contaniner">
      <div class="rating">
        <div class="radio-stars">
          <input class="sr-only" id="radio-5" name="radio-star" type="radio" value="5" />
          <label class="radio-star" for="radio-5">5</label>
          <input class="sr-only" id="radio-4" name="radio-star" type="radio" value="4" />
          <label class="radio-star" for="radio-4">4</label>
          <input class="sr-only" id="radio-3" name="radio-star" type="radio" value="3" />
          <label checked="" false class="radio-star" for="radio-3">3</label>
          <input class="sr-only" id="radio-2" name="radio-star" type="radio" value="2" />
          <label class="radio-star" for="radio-2">2</label>
          <input class="sr-only" id="radio-1" name="radio-star" type="radio" value="1" />
          <label class="radio-star" for="radio-1">1</label>
          <span class="radio-star-total"></span>
        </div>
      </div>
      <div class="f-group" id='f-hide'>
        <textarea class="f-control" id="message" rows="5" placeholder="Feedback"></textarea>
        <button class="btn-primary" onclick="rate();sendMail()" id='btn-hide'>Submit</button>
      </div>
    </div>
    <div class="close" onclick="rate()"><i class="fas fa-times"></i></div>
  </div>
</section>
`;

class Rate extends HTMLElement {
    constructor() {
        super();
        const feedback = this.querySelector('#message');

        function sendMail1() {
            var params = {
                name: ('Client'),
                email: ("teamfinixx@gmail.com"),
                message: feedback.value,
            };
            const serviceID = "service_a9sz0qu";
            const templateID = "template_9q6eoie";
            emailjs.send(serviceID, templateID, params)
                .then(res => {
                    ("teamfinixx@gmail.com").value = "";
                    feedback.value = "";
                    console.log(res);
                    alert("Your message sent successfully!!")
                })
                .catch(err => console.log(err));
        }
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(ratingTemplate.content);
    }
}
customElements.define('c-rate', Rate);