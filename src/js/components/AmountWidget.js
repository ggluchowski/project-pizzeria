import {select, settings} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.dom = {};

    thisWidget.dom.element = element;
    thisWidget.dom.input = thisWidget.dom.element.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const valueMin = settings.amountWidget.defaultMin;
    const valueMax = settings.amountWidget.defaultMax;
    const newValue = parseInt(value);
    // Add validation
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= valueMin && newValue <= valueMax){
      thisWidget.value = newValue;
    }
    thisWidget.dom.input.value = thisWidget.value;
    // after proper value run announce method
    thisWidget.announce();
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {bubbles: true});
    thisWidget.dom.element.dispatchEvent(event);
  }
}

export default AmountWidget;