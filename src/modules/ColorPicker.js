import Modal from './Modal/Modal'

export default class ColorPicker
{

    set colorHue(hue)
    {
        this._colorHue = hue
        this.updateStyleEL()
    }
        
    constructor()
    {
        this.styleEL = document.createElement('style')
        this.createRandomiseButton()
        this.createChangeButton()
        this.randomiseHue()
        document.head.appendChild(this.styleEL)
    }

    createRandomiseButton()
    {
        this._randomiseButton = document.createElement('button')
        this._randomiseButton.innerHTML = 'Willekeurige kleur'
        this.insertRandomiseButton()
    }

    insertRandomiseButton()
    {
        const resetButton = document.querySelector('header button:last-child')
        
        resetButton.insertAdjacentElement('beforebegin', this._randomiseButton)
        this._randomiseButton.addEventListener('click', () => this.randomiseHue())
    }

    randomiseHue()
    {
        this.colorHue = Math.floor(Math.random() * 360)
    }

    createChangeButton()
    {
        this._changeButton = document.createElement('button')
        this._changeButton.innerHTML = 'Kies kleur'
        this.insertChangeButton()
    }

    insertChangeButton()
    {
        this._randomiseButton.insertAdjacentElement('beforebegin', this._changeButton)
        this._changeButton.addEventListener('click', () => this.chooseHue())
    }

    chooseHue()
    {
        this._chooseModal = new Modal(`
            <form>
                <label>
                    Kleurgetal
                    <input type="number" min="0" max="360" pl value=${this._colorHue}> 
                    <small>Kies een getal tussen de 0 en 360</small>
                </label>
                <footer>
                    <input type="submit" value="Instellen">
                </footer>
            </form>
        `, 'Kleurenkiezer')

        const form = this._chooseModal._modal.querySelector('form')
        const colorInput = this._chooseModal._modal.querySelector('input[type="number"]')

        colorInput.addEventListener('input', () => {
            this._temporaryHue = colorInput.value
            this.updateStyleEL()
        })

        form.addEventListener('submit', e => {
            e.preventDefault()
            this._temporaryHue = form.querySelector('input[type="number"]').value
            this.colorHue = form.querySelector('input[type="number"]').value
            this._chooseModal.destroyModal()
        })
    }

    updateStyleEL()
    {
        this.styleEL.innerHTML = `
            :root {
                --temporary-hue: ${this._temporaryHue || this._colorHue};
                --colour-hue: ${this._colorHue};
            }
        `
    }
}