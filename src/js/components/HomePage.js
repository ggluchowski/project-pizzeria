import { select, templates } from '../settings.js';
import Carousel from './Carousel.js';

class HomePage {
  constructor(element){
    const thisHomePage = this;
    thisHomePage.element = element;
    thisHomePage.render(thisHomePage.element);
    thisHomePage.carousel = new Carousel(thisHomePage.dom.carousel);
  }

  render(element){
    const thisHomePage = this;

    const generateHTML = templates.homePage();

    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generateHTML;
    thisHomePage.dom.carousel = document.querySelector(select.homePage.carousel);
  }

}

export default HomePage;