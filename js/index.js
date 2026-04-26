(() => {
  'use strict'

  document.addEventListener(`DOMContentLoaded`, async () => {
    const app = window.AppData
    const wrapper = document.querySelector(`.Wrapper`)
    if (!wrapper || !app) return

    const slides = [...wrapper.querySelectorAll(`.Slider-frame`)]
    const dots = [...wrapper.querySelectorAll(`.Selector-dot`)]
    const slider = wrapper.querySelector(`.Slider`)
    if (!slides.length || !dots.length || !slider) return

    let curSlide = 0
    const maxSlide = slides.length - 1
    let isAnimating = false
    let unlockTimer = null
    let wheelGestureLocked = false
    let wheelReleaseTimer = null
    let touchStartY = 0

    const animateActiveSlide = () => {
      slides.forEach(frame => {
        frame.querySelectorAll(`.Slider-text, .Slider-button`).forEach(node => {
          node.classList.remove(`u-fade-in-up`)
          node.style.removeProperty(`--a-fadeup-duration`)
          node.style.removeProperty(`--a-fadeup-delay`)
        })
      })

      const frame = slides[curSlide]
      if (!frame) return
      const items = [
        frame.querySelector(`.Slider-text`),
        frame.querySelector(`.Slider-button`)
      ].filter(Boolean)

      void slider.offsetHeight

      const speeds = [0.85, 0.95]
      items.forEach((item, index) => {
        const delay = 0.5 + (index * 0.22)
        item.style.setProperty(`--a-fadeup-duration`, `${speeds[index % speeds.length]}s`)
        item.style.setProperty(`--a-fadeup-delay`, `${delay.toFixed(2)}s`)
        item.classList.add(`u-fade-in-up`)
      })
    }

    const lock = (duration = 700) => {
      isAnimating = true
      clearTimeout(unlockTimer)
      unlockTimer = setTimeout(() => {
        isAnimating = false
      }, duration)
    }

    const paint = () => {
      slides.forEach((slide, index) => {
        slide.style.transform = `translateY(${(-100 * curSlide)}%)`
        dots[index]?.classList.toggle(`isActive`, index === curSlide)
      })
    }

    const goToSlide = index => {
      curSlide = index
      paint()
      animateActiveSlide()
      lock()
    }

    const nextSlide = () => {
      if (isAnimating) return
      if (curSlide === maxSlide) {
        goToSlide(0)
      } else {
        goToSlide(curSlide + 1)
      }
    }

    const prevSlide = () => {
      if (isAnimating) return
      if (curSlide === 0) {
        goToSlide(maxSlide)
      } else {
        goToSlide(curSlide - 1)
      }
    }

    const handleDotClick = index => () => {
      if (index === curSlide || isAnimating) return
      goToSlide(index)
    }

    const handleKeydown = event => {
      if (event.key === `ArrowDown`) return nextSlide()
      if (event.key === `ArrowUp`) return prevSlide()
    }

    const handleWheel = event => {
      if (!event.cancelable) return
      event.preventDefault()

      clearTimeout(wheelReleaseTimer)
      wheelReleaseTimer = setTimeout(() => {
        wheelGestureLocked = false
      }, 220)

      if (wheelGestureLocked || isAnimating) return
      if (Math.abs(event.deltaY) < 10) return

      wheelGestureLocked = true
      if (event.deltaY > 0) return nextSlide()
      prevSlide()
    }

    const handleFocusIn = event => {
      const frame = event.target.closest(`.Slider-frame`)
      const nextIndex = slides.indexOf(frame)
      if (nextIndex < 0 || nextIndex === curSlide || isAnimating) return
      goToSlide(nextIndex)
    }

    const handleTouchStart = event => {
      touchStartY = event.changedTouches?.[0]?.clientY || 0
    }

    const handleTouchEnd = event => {
      if (isAnimating) return
      const endY = event.changedTouches?.[0]?.clientY || 0
      const delta = touchStartY - endY
      if (Math.abs(delta) < 40) return
      if (delta > 0) return nextSlide()
      prevSlide()
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

    // Trae los subtítulos de los países del campo `titular` de "countries.json"
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
    slider?.addEventListener(`touchstart`, handleTouchStart, { passive: true })
    slider?.addEventListener(`touchend`, handleTouchEnd, { passive: true })
    document.addEventListener(`click`, handleCountrySelection)

    paint()
    animateActiveSlide()
  })
})();