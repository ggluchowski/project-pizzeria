/* global Flickity*/
class Carousel{
  constructor(element){
    const thisCarousel = this;
    thisCarousel.element = element;
    thisCarousel.initCarusel();

  }

  initCarusel(){
    const thisCarousel = this;

    const flkty = new Flickity(thisCarousel.element, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      // eslint-disable-next-line no-dupe-keys
      autoPlay: 5000,
      wrapAround: true,
    });
    console.log('Karuzela: ', flkty);
  }
}

export default Carousel;