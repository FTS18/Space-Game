declare module '*.css';
declare module 'swiper';
declare module 'swiper/css/bundle';
declare module 'jquery';

interface Window {
  jQuery: any;
  $: any;
  Swiper: any;
  emailjs: any;
}
