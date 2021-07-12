class Carousel{
  constructor(element){
    const thisCarousel = this;
    thisCarousel.element = element;
    thisCarousel.render(element);
    thisCarousel.initCarusel();

  }

  render(element){
    const thisCarousel = this;

    thisCarousel.carousel = element;
  }

  initCarusel(){
    const thisCarousel = this;

    // eslint-disable-next-line no-undef
    const flkty = new Flickity(thisCarousel.carousel, {
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