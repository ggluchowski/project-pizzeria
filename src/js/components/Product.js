import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.dom = {};

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAmountWidget(){
    const thisProduct = this;
    // new class AmountWidget
    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    // add listerena after 'update' amountWidgetElem and run processOrder method
    thisProduct.dom.amountWidgetElem.addEventListener('updated',function(){thisProduct.processOrder();
    });
  }

  initAccordion(){
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    // getElement() -> accordionTrigger;
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);
      const clikElement = thisProduct.element;
      if(activeProduct){
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != clikElement){
          activeProduct.classList.toggle('active');
        }
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();



      //thisProduct.prepareCartProduct();
    });

  }

  processOrder(){
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    // set price to default price
    let price = thisProduct.data.price;
    // for every category (param)...
    for(let paramId in thisProduct.data.params){
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // for every option in this category
      for(let optionId in param.options){
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // check if there is param with a name of paramId in formData and if it includes optionId

        // find image link
        const imageClass = '.' + paramId + '-' + optionId;
        const imageVisible = thisProduct.element.querySelector(imageClass);
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected){

          // when option is chcecked - check if link is not null and add 'active' class
          if(imageVisible){
            imageVisible.classList.add(classNames.menuProduct.imageVisible);
          }
          // check if the option is default
          if(option.default){
            // price doesn't change
            price;
            // check if the option is not default
          } else {
            // add option price to price variable
            price += option.price;
          }
          // check if param doesn't check
        } else  {
          // when option is unchcecked - check if link is not null and remove 'active' class
          if(imageVisible){
            imageVisible.classList.remove(classNames.menuProduct.imageVisible);
          }
          // check if the option is default
          if(option.default){
            // substract option price to price variable
            price -= option.price;
            // check if the option is not default
          } else {
            // price doesn't change
            price;
          }
        }
      }

    }
    // multiply price * quantity (from listener)
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.priceSingle = price / thisProduct.amountWidget.value;
    thisProduct.dom.priceElem.innerHTML = price;
  }

  addToCart(){
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);

  }

  prepareCartProduct(){

    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareProductParams();

    return productSummary;
  }

  prepareProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    // create new ogject productParams
    const productParams = {};

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      productParams[paramId] = {
        label: param.label,
        options: {}
      };

      for(let optionId in param.options){
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected){
          productParams[paramId].options[optionId] = option.label;
        }
      }
    }
    return productParams;
  }

}

export default Product;