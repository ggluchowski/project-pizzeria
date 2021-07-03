import {select, classNames, templates, settings} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subTotalPrice);
    thisCart.dom.totalPriceMain = thisCart.dom.wrapper.querySelector(select.cart.totalPriceMain);
    thisCart.dom.totalPriceMinor = thisCart.dom.wrapper.querySelector(select.cart.totalPriceMinor);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  add(menuProduct){
    const thisCart = this;
    /* generate HTML based on template */
    const generateHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementHTML*/
    const generateDOM = utils.createDOMFromHTML(generateHTML);
    /* add element to menu*/
    thisCart.dom.productList.appendChild(generateDOM);

    thisCart.products.push(new CartProduct(menuProduct, generateDOM));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    let totalNumber = 0,
      subTotalPrice = 0,
      deliveryFee = settings.cart.defaultDeliveryFee;
    for(let product of thisCart.products){
      totalNumber += product.amount;
      subTotalPrice += product.price;
    }

    if(thisCart.products.length == 0){
      deliveryFee = 0;
      thisCart.totalPrice = subTotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalPriceMain.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalPriceMinor.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;
    }else {
      thisCart.totalPrice = subTotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalPriceMain.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalPriceMinor.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;
    }
  }

  remove(cartProduct){
    const thisCart = this;
    thisCart.cartProduct = cartProduct;
    // find wrapper
    const elementToRemove = document.querySelector(select.cart.elementToRemove);
    // remove found element
    elementToRemove.remove();
    // find index of product
    const indexOfProducts = thisCart.products.indexOf(thisCart.cartProduct);
    // remove found index
    thisCart.products.splice(indexOfProducts,1);
    // update price, number of products
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {};
    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.dom.totalPriceMain.innerHTML;
    payload.subTotalPrice = thisCart.dom.subTotalPrice.innerHTML;
    payload.totalNumber = thisCart.dom.totalNumber.innerHTML;
    payload.deliveryFee = thisCart.dom.deliveryFee.innerHTML;
    payload.products = [];

    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });


  }

}

export default Cart;