(() => {
  'use strict'

  const handleDomContentLoaded = async () => {
    const app = window.AppData
    const slider = document.querySelector(`.Slider`)
    if (!slider) return

    const sliderRoot = slider.closest(`.Wrapper`) || document
    const slides = [...sliderRoot.querySelectorAll(`.Slider-frame`)]
    const dots = [...sliderRoot.querySelectorAll(`.Selector-dot`)]
    if (!slides.length) return

    let activeIndex = 0
    let isLocked = false
    let isSliderInViewport = true
    let hasPaintScheduled = false
    let hasSlidesPaintScheduled = false
    let touchStartIndex = 0

    const paint = () => {
      if (hasPaintScheduled) return
      hasPaintScheduled = true

      requestAnimationFrame(() => {
        for (let index = 0; index < dots.length; index++) {
          dots[index]?.classList.toggle(`isActive`, index === activeIndex)
        }

        hasPaintScheduled = false
      })
    }

    const getIndexFromScroll = () => {
      const viewportCenter = slider.scrollTop + (slider.clientHeight / 2)
      let nearestIndex = 0
      let minDistance = Number.POSITIVE_INFINITY

      slides.forEach((slide, index) => {
        const center = slide.offsetTop + (slide.offsetHeight / 2)
        const distance = Math.abs(center - viewportCenter)
        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = index
        }
      })

      return nearestIndex
    }

    const goToIndex = (nextIndex, isSmooth = true) => {
      const boundedIndex = Math.max(0, Math.min(nextIndex, slides.length - 1))
      activeIndex = boundedIndex
      slider.scrollTo({
        top: slides[boundedIndex].offsetTop,
        behavior: isSmooth ? `smooth` : `auto`
      })
      paint()
    }

    const move = direction => {
      if (isLocked) return
      isLocked = true
      goToIndex(activeIndex + direction)
      setTimeout(() => {
        isLocked = false
      }, 850)
    }

    const handleResize = () => paintSlides()
    const handleDotClick = index => {
      goToIndex(index)
    }
    const handleKeydown = event => {
      if (event.key === `ArrowDown`) return move(1)
      if (event.key === `ArrowUp`) return move(-1)
      return null
    }
    const handleWheel = event => {
      if (!isSliderInViewport) return
      event.preventDefault()
      const isOutOfBounds = (activeIndex === 0 && event.deltaY < 0)
        || (activeIndex === slides.length - 1 && event.deltaY > 0)
      if (isLocked || isOutOfBounds) return
      move(event.deltaY > 0 ? 1 : -1)
    }
    const handleFocusIn = event => {
      const frame = event.target.closest(`.Slider-frame`)
      const nextIndex = slides.indexOf(frame)
      if (nextIndex < 0 || nextIndex === activeIndex) return
      goToIndex(nextIndex)
    }
    const handleSliderScroll = () => {
      const nextIndex = getIndexFromScroll()
      const isInvalidIndex = nextIndex < 0 || nextIndex >= slides.length || nextIndex === activeIndex
      if (isInvalidIndex) return
      activeIndex = nextIndex
      paint()
    }
    const handleTouchStart = () => {
      touchStartIndex = getIndexFromScroll()
    }
    const handleTouchEnd = () => {
      const rawIndex = getIndexFromScroll()
      const minIndex = Math.max(0, touchStartIndex - 1)
      const maxIndex = Math.min(slides.length - 1, touchStartIndex + 1)
      const boundedIndex = Math.max(minIndex, Math.min(rawIndex, maxIndex))
      goToIndex(boundedIndex)
    }
    const handleCountrySelection = event => {
      const button = event.target.closest(`.Slider-button`)
      if (!button) return
      const slug = app.canonicalCountry(app.normalizeCountry(new URL(button.href, location.href).searchParams.get(`pais`)))
      slug && app.setCountry(slug)
    }
    const handleSliderIntersection = entries => {
      isSliderInViewport = entries.some(entry => entry.isIntersecting)
    }

    // Trae los subtítulos de los paises del campo `titular` de "countries.json"
    const paintSlides = () => {
      if (hasSlidesPaintScheduled) return
      hasSlidesPaintScheduled = true

      requestAnimationFrame(() => {
        slides.forEach(slide => {
          const button = slide.querySelector(`.Slider-button`)
          const text = slide.querySelector(`.Slider-text`)
          if (!button) return

          const slug = app.canonicalCountry(app.normalizeCountry(new URL(button.href, location.href).searchParams.get(`pais`)))
          const entry = countries.find(([name]) => app.canonicalCountry(app.normalizeCountry(name)) === slug)
          const [, info] = entry || []

          if (info?.titular && text) {
            text.textContent = info.titular
          }

          const isMobile = window.matchMedia(`(max-width: 480px)`).matches
          const image = isMobile
            ? (info?.backgroundImageMobile || info?.backgroundImage)
            : info?.backgroundImage
          const backgroundImage = app.toAssetPath(image)
          backgroundImage && (slide.style.backgroundImage = `url('${backgroundImage}')`)
        })

        hasSlidesPaintScheduled = false
      })
    }

    let countries = []
    try {
      const data = await app.loadData()
      countries = Object.entries(data.countries || {})
      paintSlides()
      window.addEventListener(`resize`, handleResize)
    } catch {}

    if (`IntersectionObserver` in window) {
      const sliderObserver = new IntersectionObserver(handleSliderIntersection, {
        threshold: 0.2
      })
      sliderObserver.observe(slider)
    }

    dots.forEach((dot, index) => {
      dot.addEventListener(`click`, () => handleDotClick(index))
    })

    window.addEventListener(`keydown`, handleKeydown)
    window.addEventListener(`wheel`, handleWheel, { passive: false })
    sliderRoot.addEventListener(`focusin`, handleFocusIn)
    slider.addEventListener(`scroll`, handleSliderScroll)
    slider.addEventListener(`touchstart`, handleTouchStart, { passive: true })
    slider.addEventListener(`touchend`, handleTouchEnd, { passive: true })
    sliderRoot.addEventListener(`click`, handleCountrySelection)

    goToIndex(activeIndex, false)
  }

  document.addEventListener(`DOMContentLoaded`, handleDomContentLoaded)
})()