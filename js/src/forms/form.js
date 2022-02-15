/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.3.0): util/form-validation.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */
import BaseComponent from '../base-component'
import EventHandler from '../dom/event-handler'
import Field from './field'
import SelectorEngine from '../dom/selector-engine'

const NAME = 'formValidation'
const DATA_KEY = 'bs.formValidation'
const EVENT_KEY = `.${DATA_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}`
const EVENT_SUBMIT = `submit${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`

const CLASS_VALIDATED = 'was-validated'
const SELECTOR_DATA_TOGGLE = 'form[data-bs-toggle="form-validation"]'

const Default = {
  type: 'feedback' // or 'tooltip'
}

const DefaultType = {
  type: 'string'
}

class Form extends BaseComponent {
  constructor(element, config) {
    super(element, config)
    if (this._element.tagName !== 'FORM') {
      throw new TypeError(`Need to be initialized in form elements. "${this._element.tagName}" given`)
    }

    this._formFields = null // Our fields
  }

  static get NAME() {
    return NAME
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  getFields() {
    if (!this._formFields) {
      this._formFields = this._initializeFields()
    }

    return this._formFields
  }

  getField(name) {
    return this.getFields().get(name)
  }

  clear() {
    this._element.classList.remove(CLASS_VALIDATED)
    // eslint-disable-next-line no-unused-vars
    for (const [name, field] of this.getFields()) {
      field.clearAppended()
    }
  }

  validate() {
    this.clear()
    if (this._element.checkValidity()) {
      return
    }

    // eslint-disable-next-line no-unused-vars
    for (const [name, field] of this.getFields()) {
      const message = this._getFieldMessage(field)
      field.appendFeedback(message)
    }

    this._element.classList.add(CLASS_VALIDATED)
  }

  _getFieldMessage(field) {
    const element = field.getElement()

    if (element.checkValidity()) { // if field is valid, return first success message
      return field.successMessages().getFirst()
    }

    if (field.errorMessages().has('default')) { // if field is invalid check and return for default message
      return field.errorMessages().get('default')
    }

    for (const property in element.validity) { // else return the default browser validation message
      if (element.validity[property]) {
        field.errorMessages().set(property, element.validationMessage)
        return field.errorMessages().get(property)
      }
    }

    return ''
  }

  _initializeFields() {
    const fields = new Map()
    const formElements = Array.from(this._element.elements) // the DOM elements
    for (const element of formElements) {
      const name = element.name || element.id

      const field = Field.getOrCreateInstance(element, {
        name,
        type: this._config.type
      })
      fields.set(name, field)
    }

    return fields
  }
}

// On submit we want to auto-validate form
EventHandler.on(document, EVENT_SUBMIT, SELECTOR_DATA_TOGGLE, event => {
  const { target } = event
  const instance = Form.getOrCreateInstance(target)
  if (!target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
  }

  instance.validate()
})

EventHandler.on(document, EVENT_RESET, SELECTOR_DATA_TOGGLE, event => {
  const { target } = event
  const instance = Form.getOrCreateInstance(target)

  instance.clear()
})

// On load, add `novalidate` attribute to avoid browser validation
EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const el of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    el.setAttribute('novalidate', true)
  }
})
export default Form

