import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.witchTableSelected = 0;
    thisBooking.render(thisBooking.element);
    thisBooking.initWidgets();
    thisBooking.getData();




  }

  getData(){
    const thisBooking = this;

    const  startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate),
      endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('params Booking', params);


    const urls = {
      bookings:        settings.db.url + '/' + settings.db.booking
                                      + '?' + params.bookings.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls: ', urls);


    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);

      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    // obiekt pomocniczy do przechowywania inf o godzinie i zarezerwownym stoliku
    thisBooking.booked = {};

    for(let item of eventsCurrent){
      // funkcja skladajaca obiekt
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of bookings){
      // funkcja skladajaca obiekt
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate,
      maxDate = thisBooking.datePickerWidget.maxDate;

    for(let item of eventsRepeat){
      // funkcja skladajaca obiekt
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked: ', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);

    }

  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }


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
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.tablesContainer = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);

    thisBooking.dom.bookingForm = thisBooking.dom.wrapper.querySelector(select.booking.bookingForm);

    thisBooking.dom.address = thisBooking.dom.bookingForm.querySelector(select.booking.address);

    thisBooking.dom.phone = thisBooking.dom.bookingForm.querySelector(select.booking.phone);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      thisBooking.clearTable();
    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      thisBooking.clearTable();
    });

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('click', function(){
      thisBooking.clearTable();
    });
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('click', function(){
      thisBooking.clearTable();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    const tablesContainer = thisBooking.dom.tablesContainer;

    tablesContainer.addEventListener('click', function(e){
      thisBooking.initTables(e);
    });

    thisBooking.dom.bookingForm.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });


  }
  clearTable(){
    //czyszczenie zaznaczenia podczas zmiany godziny, daty, liczby osob, czasu zamowienia
    const thisBooking = this;
    for(let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableChosen);
      thisBooking.witchTableSelected = 0;
    }
  }

  initTables(e){
    const thisBooking = this;

    // thisBooking.sendBooking();
    // console.log(thisBooking.sendBooking());

    e.preventDefault();
    const item = e.target;
    const tableId = parseInt(item.getAttribute(settings.booking.tableIdAttribute));
    //console.log('XXX',item);

    //sprawdzenie klikniecia na stolik

    if(
      item.classList.contains(classNames.booking.chosenTable)
      &&
      item.classList.contains(classNames.booking.tableBooked)
    ){
      //jezeli stolik jest zarezerwowany
      alert('Stolik jest zajety!!!');

      //jezeli stolik jest wolny
    }else if(tableId == thisBooking.witchTableSelected){
      item.classList.remove(classNames.booking.tableChosen);
      thisBooking.witchTableSelected = 0;
    }else {
      for(let table of thisBooking.dom.tables){
        const atrybutId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

        if(
          table.classList.contains(classNames.booking.tableChosen)
          &&
          atrybutId != tableId
        ){
          table.classList.remove(classNames.booking.tableChosen);
        }else{
          thisBooking.witchTableSelected = tableId;
          item.classList.add(classNames.booking.tableChosen);
        }
      }
    }

  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const tableLoad = {};

    tableLoad.date = thisBooking.datePickerWidget.value;
    tableLoad.hour = thisBooking.hourPickerWidget.value;
    tableLoad.table = thisBooking.witchTableSelected;
    tableLoad.duration = parseInt(thisBooking.hoursAmountWidget.value);
    tableLoad.ppl = parseInt(thisBooking.peopleAmountWidget.value);
    tableLoad.phone = thisBooking.dom.phone.value;
    tableLoad.address = thisBooking.dom.address.value;
    tableLoad.starters = [];


    for(let starters of thisBooking.dom.starters){
      if(starters.checked){
        tableLoad.starters.push(starters.getAttribute('value'));
      }
    }
    //console.log('XXX: ', tableLoad, url);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tableLoad),
    };


    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });


    thisBooking.makeBooked(tableLoad.date, tableLoad.hour, tableLoad.duration, tableLoad.table);
    console.log('CCC: ', thisBooking);

  }

}

export default Booking;