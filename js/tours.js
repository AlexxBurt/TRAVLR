(() => {
'use strict'


// Carga los tours del país seleccionado y monta la vista de detalle + galería.
window.addEventListener(`DOMContentLoaded`, async () => {
  const app = window.AppData
  const slug = app.getCountrySlugFromUrl()
  const entry = await app.getCountryEntryBySlug(slug)
  const tours = await app.getToursByCountry(slug)
  if (!entry || !tours.length) return

  const [countryName, countryInfo] = entry
  const $ = s => document.querySelector(s)
  const images = [...document.querySelectorAll(`.Gallery-img`)]
  const title = $(`.Information-h2`)
  const subtitle = $(`.Information-h3`)
  const text1 = $(`.Information-p`)
  const text2 = $(`.Information-p--2`)
  const text3 = $(`.Information-p--3`)
  const infoContent = $(`.Information-content`)
  const infoButtons = $(`.Information-buttons`)
  const gallery = $(`.Gallery`)
  const wrapper = $(`.Wrapper`)
  const next = $(`.Information-next`)
  const button = $(`.Information-button`)
  const src = app.toAssetPath
  if (!title || !subtitle || !text1 || !text2 || !text3 || !wrapper || !next || !button || !infoContent || !infoButtons || !gallery) return


// Abre el primer tour y muestra su información del JSON
  let active = 0
  let isTransitioning = false

  const restartTourAnimations = () => {
    const nodes = [
      subtitle,
      title,
      text1,
      text2,
      text3,
      button,
      next,
      ...gallery.querySelectorAll(`picture`)
    ].filter(Boolean)

    const speeds = [0.85, 0.95, 1.05]
    nodes.forEach(node => node.classList.remove(`u-fade-in-up`))
    void wrapper.offsetHeight

    nodes.forEach((node, index) => {
      const delay = 0.45 + (index * 0.08)
      node.style.setProperty(`--fade-up-duration`, `${speeds[index % speeds.length]}s`)
      node.style.setProperty(`--fade-up-delay`, `${delay.toFixed(2)}s`)
      node.classList.add(`u-fade-in-up`)
    })
  }

  const animateChange = (onUpdate, duration = 280) => {
    if (isTransitioning) return
    isTransitioning = true
    const targets = [infoContent, infoButtons, gallery]
    targets.forEach(node => node.classList.add(`isFading`))

    setTimeout(() => {
      onUpdate()
      targets.forEach(node => node.classList.remove(`isFading`))
      restartTourAnimations()
      isTransitioning = false
    }, duration)
  }

  const paint = () => {
    const t = tours[active]
    title.textContent = t.name || `Tour destacado`
    text1.textContent = t.description1 || t.description || countryInfo.titular || ``
    text2.textContent = t.description2 || ``
    text3.textContent = t.description3 || ``
    wrapper.style.background = `linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.5)), url('${src(t.backgroundImage)}') center / cover no-repeat`
    button.textContent = app.isTourSelected(t) ? `Eliminar actividad` : `Añadir actividad`

    images.forEach((img, idx) => {
      const item = tours[idx]
      if (!item) return ((img.src = ``), (img.onclick = null), img.classList.remove(`isActive`))
      img.src = src(item.backgroundImage)
      img.alt = `${countryName} - ${item.name}`
      img.classList.toggle(`isActive`, idx === active)
      img.onclick = () => {
        if (idx === active) return
        animateChange(() => {
          active = idx
          paint()
        })
      }
    })
  }

  
// Configura navegación al paso siguiente y selección de actividad.
  subtitle.textContent = `Tours ${countryName}`
  next.href = `hoteles.html?pais=${encodeURIComponent(slug)}`
  app.setCountry(slug)
  button.addEventListener(`click`, () => (app.toggleTour(tours[active]), paint()))
  paint()
  restartTourAnimations()
})
})()