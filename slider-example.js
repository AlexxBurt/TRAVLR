// Source - https://stackoverflow.com/q/74425798
// Posted by Marco Polo, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-21, License - CC BY-SA 4.0


     // Select all slides
        const slides = document.querySelectorAll(".slide");
        
        // loop through slides and set each slides translateX property to index * 100% 
        slides.forEach((slide, indx) => {
          
        });
        // current slide counter
        let curSlide = 0;
        // maximum number of slides
        let maxSlide = slides.length - 1;
        
        // select next slide button
        const nextSlide = document.querySelector(".btn-next");
        
        // add event listener and next slide functionality
        nextSlide.addEventListener("click", function () {
            
          // check if current slide is the last and reset current slide
          if (curSlide === maxSlide) {
            //alert ("next button clicked - Loading Slide "+slides.length);
            curSlide = 0;
          } else {
            curSlide++;
            //alert ("next button clicked - Loading Slide "+slides.length);
          }
        
        //   move slide by -100%
          slides.forEach((slide, indx) => {
            slide.style.transform = `translateX(${100 * (0 - curSlide)}%)`;
          });
        });
         setInterval(function () {
          // check if current slide is the last and reset current slide
          if (curSlide === maxSlide) {
          //    alert ("next button clicked - Loading Slide "+slides.length);
            curSlide = 0;
          } else {
            curSlide++;
            //alert ("auto change Loading Slide "+slides.length);
          }
        
        //   move slide by -100%
          slides.forEach((slide, indx) => {
            slide.style.transform = `translateX(${100 * (0 - curSlide)}%)`;
          });
            }, 6000);
         

