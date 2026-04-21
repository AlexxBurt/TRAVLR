(() => {
    'use strict'


// Tabs del popup legal del footer
const initFooterPopupTabs = footer => {
    if (!footer) return

    const tabs = footer.querySelectorAll(`.Popup-tab`)
    const textNodes = footer.querySelectorAll(`.Popup-info, .Popup-text`)
    const texts = [...new Set([...textNodes])]
    if (!tabs.length || !texts.length) return

    const setActiveTab = index => {
        tabs.forEach((tab, i) => tab.classList.toggle(`isActive`, i === index))
        texts.forEach((text, i) => text.classList.toggle(`isVisible`, i === index))
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener(`click`, () => setActiveTab(index))
    })

    const defaultIndex = [...tabs].findIndex(tab => tab.classList.contains(`isActive`))
    setActiveTab(defaultIndex >= 0 ? defaultIndex : 0)
}


// Abre y cierra el footer al pulsar en el svg
const loadFooter = () => {
    const footer = document.querySelector(`.Footer`)
    const svg = document.querySelector(`.Footer-svg`)
    const footerButton = document.querySelector(`.Footer-a--secondary`)
    const popup = footer ? footer.querySelector(`.Footer-background`) : null
    const svgClose = footer ? footer.querySelector(`.Popup-svg`) : null

    if (!footer || !svg) return

    const animateFooterReveal = () => {
        const items = [
            svg,
            ...footer.querySelectorAll(`.Footer-li`)
        ]

        items.forEach(item => {
            item.classList.remove(`u-fade-in-up`)
            item.style.removeProperty(`--fade-up-duration`)
            item.style.removeProperty(`--fade-up-delay`)
        })

        void footer.offsetHeight

        const speeds = [0.85, 0.95, 1.05]
        items.forEach((item, index) => {
            const delay = 0.18 + (index * 0.1)
            item.style.setProperty(`--fade-up-duration`, `${speeds[index % speeds.length]}s`)
            item.style.setProperty(`--fade-up-delay`, `${delay.toFixed(2)}s`)
            item.classList.add(`u-fade-in-up`)
        })
    }


    svg.addEventListener(`click`, () => {
        const willOpen = !footer.classList.contains(`isVisible`)
        footer.classList.toggle(`isVisible`)
        if (willOpen) animateFooterReveal()
    })

    if (footerButton && popup) {
        footerButton.addEventListener(`click`, () => {
            popup.classList.toggle(`isVisible`)
        })
    }

    if (svgClose && popup) {
        svgClose.addEventListener(`click`, () => {
            popup.classList.remove(`isVisible`)
        })
    }

    initFooterPopupTabs(footer)
}
window.loadFooter = loadFooter


// Núcleo de datos compartidos: carga JSON, carrito, utilidades y navegación
const AppData = (() => {
    const CART_KEY = `travlr-cart`
    const VISITED_KEY = `travlr-visited-pages`
    const aliases = { zimbabue: `zimbabwe`, seychelles: `islasseychelles` }
    let cache


    // Normaliza nombres de país (sin acentos/espacios)
    const normalizeCountry = value => (value || ``)
        .toLowerCase()
        .normalize(`NFD`)
        .replace(/[\u0300-\u036f]/g, ``)
        .replace(/[^a-z0-9]+/g, ``)

    const canonicalCountry = slug => aliases[slug] || slug
    const toAssetPath = path => {
        const file = String(path || ``).replace(/\\/g, `/`).split(/[?#]/)[0].split(`/`).pop()
        return file ? `assets/images/${file}` : ``
    }
    const currencyToNumber = value => Number(String(value || 0).replace(/[^\d,.-]/g, ``).replace(/\./g, ``).replace(`,`, `.`)) || 0
    const formatCurrency = value => `${String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, `.`)}€`
    const getCountrySlugFromUrl = () => canonicalCountry(normalizeCountry(new URLSearchParams(window.location.search).get(`pais`)))


    // Carga y cachea countries/tours/hotels del JSON
    const loadData = () => cache ||= Promise.all([
        fetch(`./data/countries.json`).then(r => r.json()),
        fetch(`./data/tours.json`).then(r => r.json()),
        fetch(`./data/hotels.json`).then(r => r.json())
    ]).then(([countriesData, toursData, hotelsData]) => {
        const cleanPrice = value => formatCurrency(currencyToNumber(value))
        const countries = Object.fromEntries(Object.entries(countriesData.countries || {}).map(([name, info]) => [name, { ...info, tripPrice: cleanPrice(info.tripPrice) }]))
        const tours = (toursData.tours || []).map(t => ({ ...t, tourPrice: cleanPrice(t.tourPrice) }))
        const hotels = (hotelsData.hotels || []).map(h => ({ ...h, roomRate: cleanPrice(h.roomRate) }))
        return { countries, tours, hotels }
    })

    const getEmptyCart = () => ({ countrySlug: null, tours: [], hotel: null })
    const fromJson = (text, fallback) => {
        try { return JSON.parse(text) } catch { return fallback }
    }


    // Guarda el carrito en sessionStorage
    const getCart = () => ({ ...getEmptyCart(), ...(fromJson(sessionStorage.getItem(CART_KEY), getEmptyCart()) || {}) })
    const saveCart = cart => {
        sessionStorage.setItem(CART_KEY, JSON.stringify(cart))
        window.dispatchEvent(new Event(`cart:changed`))
    }

    const getVisitedPages = () => {
        const pages = fromJson(sessionStorage.getItem(VISITED_KEY), [])
        return Array.isArray(pages) ? pages : []
    }


    // Guarda la información de navegación para el header
    const saveVisitedPages = pages => sessionStorage.setItem(VISITED_KEY, JSON.stringify(pages))
    const markVisitedPage = page => saveVisitedPages([...new Set([...getVisitedPages(), page].filter(Boolean))])
    const resetNavegation = () => saveVisitedPages([])
    const resetCart = () => (saveCart(getEmptyCart()), getEmptyCart())
    const sameCountry = (a, b) => canonicalCountry(normalizeCountry(a)) === canonicalCountry(normalizeCountry(b))


    // Establece país seleccionado y omite mostrar información de otros países
    const setCountry = slug => {
        const cart = getCart()
        const next = canonicalCountry(normalizeCountry(slug))
        if (cart.countrySlug !== next) Object.assign(cart, { countrySlug: next, tours: [], hotel: null })
        saveCart(cart)
        return cart
    }


// Permite añadir o eliminar tours (en el carrito)
    const isTourSelected = tour => getCart().tours.some(item => item.name === tour.name && sameCountry(item.country, tour.country))
    const toggleTour = tour => {
        const cart = getCart()
        const slug = canonicalCountry(normalizeCountry(tour.country))
        if (cart.countrySlug !== slug) Object.assign(cart, { countrySlug: slug, tours: [], hotel: null })
        const exists = cart.tours.some(item => item.name === tour.name && sameCountry(item.country, tour.country))
        cart.tours = exists
            ? cart.tours.filter(item => !(item.name === tour.name && sameCountry(item.country, tour.country)))
            : [...cart.tours, tour]
        saveCart(cart)
        return cart
    }

    const isHotelSelected = hotel => {
        const selected = getCart().hotel
        return !!selected && selected.name === hotel.name && sameCountry(selected.country, hotel.country)
    }


    // Trae la info de los hoteles y los añade al carrito al seleccionarlo
    const setHotel = hotel => {
        const cart = getCart()
        const slug = canonicalCountry(normalizeCountry(hotel.country))
        if (cart.countrySlug !== slug) Object.assign(cart, { countrySlug: slug, tours: [] })
        const same = cart.hotel && cart.hotel.name === hotel.name && sameCountry(cart.hotel.country, hotel.country)
        cart.hotel = same ? null : hotel
        saveCart(cart)
        return cart
    }

    const getCountryEntryBySlug = async slug => Object.entries((await loadData()).countries).find(([name]) => sameCountry(name, slug))
    const getToursByCountry = async slug => (await loadData()).tours.filter(tour => sameCountry(tour.country, slug))
    const getHotelsByCountry = async slug => (await loadData()).hotels.filter(hotel => sameCountry(hotel.country, slug))

    return {
        normalizeCountry,
        canonicalCountry,
        toAssetPath,
        currencyToNumber,
        formatCurrency,
        getCountrySlugFromUrl,
        loadData,
        getCountryEntryBySlug,
        getToursByCountry,
        getHotelsByCountry,
        getCart,
        resetCart,
        setCountry,
        isTourSelected,
        toggleTour,
        setHotel,
        isHotelSelected,
        getVisitedPages,
        markVisitedPage,
        resetNavegation
    }
})()
window.AppData = AppData


// Hace visibles los links del header y establece adónde dirigen
const currentPage = () => window.location.pathname.split(`/`).pop() || `index.html`
const updateHeader = () => {
    const app = window.AppData
    const header = document.querySelector(`.Header`)
    if (!header) return

    const cart = app.getCart()
    const visited = new Set(app.getVisitedPages())
    const page = currentPage()

    app.markVisitedPage(page)

    const links = [
        { id: `destinos`, file: `index.html`, unlocked: true },
        { id: `tours`, file: `tours.html`, unlocked: Boolean(cart.countrySlug) },
        { id: `hoteles`, file: `hoteles.html`, unlocked: false },
        { id: `reserva`, file: `reserva.html`, unlocked: false }
    ]

    links.forEach(({ id, file, unlocked }) => {
        const link = document.getElementById(id)
        const item = link?.closest(`.Header-li`)
        if (!link || !item) return
        const visible = unlocked || visited.has(file) || page === file
        const isCurrent = page === file
        const badge = item.querySelector(`.u-primary, .u-terciary, span:not(.Header-logo)`)

        item.style.visibility = visible ? `visible` : `hidden`
        item.style.pointerEvents = visible ? `auto` : `none`
        link.classList.toggle(`isActive`, isCurrent)
        if (badge) badge.style.display = isCurrent ? `` : `none`
        link.href = file === `index.html` || !cart.countrySlug ? file : `${file}?pais=${encodeURIComponent(cart.countrySlug)}`
    })
}


// Carga el header y footer
const loadPartial = async (selector, file, hookName) => {
    const element = document.querySelector(selector)
    if (!element) return

    const response = await fetch(file, { cache: `no-store` })
    element.innerHTML = await response.text()
    window[hookName]?.()
}

const loadLayout = async () => {
    await Promise.all([
        loadPartial(`.Header`, `header.html`, `loadHeader`),
        loadPartial(`.Footer`, `footer.html`, `loadFooter`)
    ])
    updateHeader()
}

const initFadeInUp = () => {
    const page = currentPage()
    const targets = [...document.querySelectorAll(`h2, h3, p, .u-primary, .u-secondary, .u-terciary`)]
        .filter(element => !element.closest(`.Header`) && !element.closest(`.Footer`))
        .filter(element => !(page === `index.html` && element.closest(`.Slider-frame`)))
    const times = [0.85, 0.95, 1.05]
    const toArray = list => [...list].filter(Boolean)
    const sortTopDown = elements => [...elements].sort((a, b) => {
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        if (Math.abs(ra.top - rb.top) > 4) return ra.top - rb.top
        return ra.left - rb.left
    })
    const sortLeftRight = elements => [...elements].sort((a, b) => {
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        if (Math.abs(ra.left - rb.left) > 4) return ra.left - rb.left
        return ra.top - rb.top
    })

    let sequence = 0

    const applyStagger = (elements, sorter, extraDelay = 0) => {
        const ordered = sorter(toArray(elements))

        ordered.forEach((element, index) => {
            const delay = 0.45 + (sequence * 0.08) + extraDelay
            element.classList.add(`u-fade-in-up`)
            element.style.setProperty(`--fade-up-duration`, `${times[index % times.length]}s`)
            element.style.setProperty(`--fade-up-delay`, `${delay.toFixed(2)}s`)
            sequence += 1
        })
    }

    applyStagger(targets, sortTopDown)

    // En tours: las imágenes deben entrar al final
    if (page === `tours.html`) {
        const pictures = document.querySelectorAll(`.Gallery picture`)
        applyStagger(pictures, sortLeftRight, 0.25)
    }
}

window.loadLayout = loadLayout
window.addEventListener(`DOMContentLoaded`, () => {
    const page = currentPage()


    // Actualiza el carrito con el hotel seleccionado (o ninguno)
    const cart = AppData.getCart()
    if (page === `hoteles.html` && !cart.countrySlug) return location.replace(`index.html`)
    if (page === `reserva.html` && !cart.hotel) return location.replace(cart.countrySlug ? `hoteles.html?pais=${encodeURIComponent(cart.countrySlug)}` : `index.html`)

    initFadeInUp()
    loadLayout().then(() => initFadeInUp())


    // Volver a la página principal (index.html) reseta el carrito y borra la navegación (no se puede volver atrás)
    if (page === `index.html`) {
        AppData.resetCart()
        AppData.resetNavegation()
        const lockBack = () => history.pushState(0, ``, `index.html`)
        lockBack()
        addEventListener(`popstate`, lockBack)
    }
})
window.addEventListener(`cart:changed`, updateHeader)
})()