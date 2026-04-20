(() => {
  'use strict'

  document.addEventListener(`DOMContentLoaded`, async () => {
    const app = window.AppData
    const wrapper = document.querySelector(`.Wrapper`)
    if (!wrapper || !app) return

    const slides = [...wrapper.querySelectorAll(`.Slider-frame`)]
    const dots = [...wrapper.querySelectorAll(`.Selector-dot`)]
    const slider = wrapper.querySelector(`.Slider`)
    if (!slides.length || !dots.length) return

    let currentIndex = 0
    let isLocked = false

    const paint = () => {
      slides.forEach((slide, index) => {
        slide.style.transform = `translateY(-${currentIndex * window.innerHeight}px)`
        dots[index]?.classList.toggle(`isActive`, index === currentIndex)
      })
    }

    const move = direction => {
      if (isLocked) return
      isLocked = true
      currentIndex = (currentIndex + direction + slides.length) % slides.length
      paint()
      setTimeout(() => {
        isLocked = false
      }, 850)
    }

    const handleDotClick = index => () => {
      currentIndex = index
      paint()
    }

    const handleKeydown = event => {
      if (event.key === `ArrowDown`) return move(1)
      if (event.key === `ArrowUp`) return move(-1)
    }

    const handleWheel = event => {
      event.preventDefault()
      const isAtStart = currentIndex === 0 && event.deltaY < 0
      const isAtEnd = currentIndex === slides.length - 1 && event.deltaY > 0
      if (isLocked || isAtStart || isAtEnd) return
      move(event.deltaY > 0 ? 1 : -1)
    }

    const handleFocusIn = event => {
      const frame = event.target.closest(`.Slider-frame`)
      const nextIndex = slides.indexOf(frame)
      if (nextIndex < 0 || nextIndex === currentIndex) return
      currentIndex = nextIndex
      paint()
    }

    const handleSliderScroll = () => {
      if (!slider) return
      const nextIndex = Math.round(slider.scrollTop / window.innerHeight)
      const isOutOfRange = nextIndex < 0 || nextIndex >= slides.length
      if (isOutOfRange || nextIndex === currentIndex) return
      currentIndex = nextIndex
      paint()
    }

    const getCountrySlugByButton = button => {
      const rawSlug = new URL(button.href, location.href).searchParams.get(`pais`)
      return app.canonicalCountry(app.normalizeCountry(rawSlug))
    }

    const handleCountrySelection = event => {
      const button = event.target.closest(`.Slider-button`)
      if (!button) return
      const countrySlug = getCountrySlugByButton(button)
      if (countrySlug) app.setCountry(countrySlug)
    }

    // Trae los subtítulos de los paises del campo `titular` de "countries.json"
    try {
      const data = await app.loadData()
      const countries = Object.entries(data.countries || {})

      const paintSlides = () => {
        const isMobile = window.matchMedia(`(max-width: 480px)`).matches
        slides.forEach(slide => {
          const button = slide.querySelector(`.Slider-button`)
          const title = slide.querySelector(`.Slider-text`)
          if (!button) return

          const slug = getCountrySlugByButton(button)
          const entry = countries.find(([name]) => app.canonicalCountry(app.normalizeCountry(name)) === slug)
          const [, info] = entry || []
          if (info?.titular && title) title.textContent = info.titular

          const image = isMobile ? (info?.backgroundImageMobile || info?.backgroundImage) : info?.backgroundImage
          const backgroundImage = app.toAssetPath(image)
          if (backgroundImage) slide.style.backgroundImage = `url('${backgroundImage}')`
        })
      }

      paintSlides()
      window.addEventListener(`resize`, paintSlides)
    } catch {}

    dots.forEach((dot, index) => dot.addEventListener(`click`, handleDotClick(index)))
    window.addEventListener(`keydown`, handleKeydown)
    window.addEventListener(`wheel`, handleWheel, { passive: false })
    document.addEventListener(`focusin`, handleFocusIn)
    slider?.addEventListener(`scroll`, handleSliderScroll)
    document.addEventListener(`click`, handleCountrySelection)

    paint()
  })
})()