'use strict'


// El botón del formulario hace aparecer los datos de reserva
const formButton = document.querySelector(`.Form-button`)
const presection = document.querySelector(`.Form-presection`)
const checkout = document.querySelector(`.Checkout`)
const inputs = [...document.querySelectorAll(`.Form input`)]

const showButton = () => {  
  const isComplete = inputs
    .filter(i => !i.classList.contains(`Form-input`) || i.classList.contains(`isVisible`))
    .every(i => i.value.trim())

  formButton.classList.toggle(`isVisible`, isComplete)
}

formButton.addEventListener(`click`, () => {
  formButton.classList.remove(`isVisible`)
  presection.classList.remove(`isActive`)
  checkout.classList.add(`isVisible`)
})


// Deshabilitamos poder seleccionar fechas pasadas
const input = document.querySelector("#date").min = new Date(Date.now() + 86400000).toISOString().slice(0, 10)


// El selector de pasajeros hace visibles más inputs de nombres
const passengersNumber = document.querySelector(`#number-passengers`)
const passengers = document.querySelectorAll(`.Form-input`)

const addPassengers = value => {
  const totalPassengers = Math.min(passengers.length, Math.max(1, Number(value) || 1))
    passengers.forEach(( passenger , i ) => passenger.classList.toggle(`isVisible`, i < totalPassengers))

    showButton()
  }

if (passengersNumber && passengers.length) {
  passengersNumber.addEventListener(`input`, e => addPassengers(e.target.value))
  addPassengers(passengersNumber.value)
}
inputs.forEach(input => input.addEventListener(`input`, showButton))

showButton()

// Click en el botón de "Finalizar Compra" abre el popup
const checkoutButton = document.querySelector(`.Checkout-button`)
const paymentContainer = document.querySelector(`.Payment`)
const paymentPopup = paymentContainer ? paymentContainer.closest(`.u-Background`) : null

if (checkoutButton && paymentPopup) {
  checkoutButton.addEventListener(`click`, () => {
    paymentPopup.classList.add(`isVisible`)
  })
}


// El botón de "Cancelar" y el svg "X" cierran el popup
const buttonCancel = document.querySelector(`.Payment-cancel`)
const svgClose = document.querySelector(`.Payment-svg`)

const closePopup = () => {
  paymentPopup.classList.remove(`isVisible`)
}

if (buttonCancel) buttonCancel.addEventListener(`click`, closePopup)
if (svgClose) svgClose.addEventListener(`click`, closePopup)



// Carrito dinámico con las selecciones de los pasos previos
const renderCheckoutByCountry = async () => {
  const app = window.AppData
  const cart = app.getCart()
  const slug = cart.countrySlug || app.getCountrySlugFromUrl()
  const entry = await app.getCountryEntryBySlug(slug)
  if (!entry) return

  const [countryName, countryInfo] = entry
  const tours = (cart.tours || []).slice(0, 3)
  const hotel = cart.hotel

  const q = s => document.querySelector(s)
  const qa = s => [...document.querySelectorAll(s)]
  const flightName = q(`.Checkout-field:nth-child(1) .Checkout-span`)
  const flightPrice = q(`.Checkout-field:nth-child(1) .Checkout-span--price`)
  const toursField = q(`.Checkout-field:nth-child(2)`)
  const tourRows = qa(`.Checkout-field:nth-child(2) .Checkout-data`)
  const tourNames = qa(`.Checkout-field:nth-child(2) .Checkout-span`)
  const tourPrices = qa(`.Checkout-field:nth-child(2) .Checkout-span--price`)
  const hotelField = q(`.Checkout-field:nth-child(3)`)
  const hotelRow = q(`.Checkout-field:nth-child(3) .Checkout-data`)
  const hotelName = q(`.Checkout-field:nth-child(3) .Checkout-span`)
  const hotelPrice = q(`.Checkout-field:nth-child(3) .Checkout-span--price`)
  const totalPrice = q(`.Checkout-total span:last-child`)

  flightName.textContent = countryName
  const trip = app.currencyToNumber(countryInfo.tripPrice)
  const toursBase = tours.reduce((sum, t) => sum + app.currencyToNumber(t.tourPrice), 0)
  const hotelBase = app.currencyToNumber(hotel?.roomRate)

  // El número de pasajeros multiplica el precio total del Checkout
  const paint = () => {
    const p = Math.max(1, Number(passengersNumber.value) || 1)
    flightPrice.textContent = app.formatCurrency(trip * p)

    toursField.style.display = tours.length ? `` : `none`
    tourRows.forEach((row, i) => {
      const t = tours[i]
      row.style.display = t ? `` : `none`

      if (!t) {
        if (tourNames[i]) tourNames[i].textContent = ``
        if (tourPrices[i]) tourPrices[i].textContent = ``
        return
      }

      if (tourNames[i]) tourNames[i].textContent = t.name
      if (tourPrices[i]) {
        tourPrices[i].textContent = app.formatCurrency(app.currencyToNumber(t.tourPrice) * p)
      }
    })

    hotelField.style.display = hotel ? `` : `none`
    hotelRow.style.display = hotel ? `` : `none`
    if (hotel) {
      hotelName.textContent = hotel.name
      hotelPrice.textContent = app.formatCurrency(hotelBase * p)
    } else {
      hotelName.textContent = ``
      hotelPrice.textContent = ``
    }

    totalPrice.textContent = app.formatCurrency((trip + toursBase + hotelBase) * p)
  }

  passengersNumber.addEventListener(`input`, paint)
  paint()
}

window.addEventListener(`DOMContentLoaded`, () => {
  renderCheckoutByCountry().catch(() => {})
})