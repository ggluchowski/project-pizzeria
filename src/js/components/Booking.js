import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.render(thisBooking.element);
    thisBooking.initWidgets();

  }
  render(element){
    const thisBooking = this;
    // generowanie HTML na bazie szablonu
    const generateHTML = templates.bookingWidget();
    // utworzenie wrapera
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    // wstrzykniecie szablonu do wrapera
    thisBooking.dom.wrapper.innerHTML = generateHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){

    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){

    });
  }

}

export default Booking;