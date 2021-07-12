import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.homeNavLinks = document.querySelectorAll(select.nav.homeNavLinks);

    // zaladowanie ostatniej strony, ktora ma byc otwarta jako domyslna
    //const idFromHash = window.location.hash.replace('#/', '');
    // domyslne ladowanie 1 eleementu, gdy nic nie było klikniete
    let pageMatchingHash = thisApp.pages[0].id;

    // for(let page of thisApp.pages){
    //   if(page.id == idFromHash){
    //     pageMatchingHash = page.id;
    //     break;
    //   }
    // }
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(e){
        const clickedElement = this;
        e.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* run thisApp.activatePage wiith that id */
        thisApp.activatePage(id);
        /* change URL hash */
        window.location.hash = '#/' + id;

      });
    }

    for(let link of thisApp.homeNavLinks){
      link.addEventListener('click', function(e){
        const clickedElement = this;
        e.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* run thisApp.activatePage wiith that id */
        thisApp.activatePage(id);
        /* change URL hash */
        window.location.hash = '#/' + id;

      });
    }
  },


  activatePage: function (pageId) {
    const thisApp = this;
    /* add class 'active' to matching pages, remove from non-matching*/
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class 'active' to matching links, remove from non-matching*/
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId);
    }


  },
  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }

  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parseResponse) {
        /* save parseResponse as thisApp.data.products */
        thisApp.data.products = parseResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });

  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initHomePage();
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();


  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });

  },
  initBooking: function(){
    const thisApp = this;

    thisApp.booking = document.querySelector(select.containerOf.booking);
    const booking = new Booking(thisApp.booking);
    console.log('Booking: ', booking);
  },

  initHomePage: function(){
    const thisApp = this;
    thisApp.homePage = document.querySelector(select.containerOf.homePage);
    const homePage = new HomePage(thisApp.homePage);
    console.log('HomePage: ', homePage);
  }
};

app.init();
