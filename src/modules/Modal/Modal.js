export default class Modal
{
    /**
     * 
     * @param {string} html 
     * @param {string} title
     */
    constructor(html, title)
    {
        this._modalContainer = document.createElement('div')
        this._modalContainer.id = 'modal'
        
        document.body.insertAdjacentElement('beforeend', this._modalContainer)

        this.destroyModal = this.destroyModal.bind(this)

        this.insertModal(html)
        this.createModalHeader(title)
    }

    /**
     * 
     * @param {string} title 
     */
    createModalHeader(title) {
        this._modalHeader = document.createElement('header')

        this._modalHeader.innerHTML = `
            <h1>${title}</h1>
            <button>Annuleren</button>
        `
        this.insertModalHeader(this._modalHeader)
    }

    insertModalHeader()
    {
        this._modal.insertAdjacentElement('afterbegin', this._modalHeader)
        this.addCloseEventListener()
    }


    addCloseEventListener()
    {
        const closeButton = this._modalHeader.querySelector('button')
        closeButton.addEventListener('click', () => this.destroyModal())
        document.addEventListener('keyup', this.destroyModal)
    }

    /**
     * 
     * @param {string} html 
     */
    insertModal(html)
    {
        this._modal = document.createElement('section')        
        this._modal.insertAdjacentHTML('beforeend', html)
        this._modalContainer.insertAdjacentElement('afterbegin', this._modal)
    }

    destroyModal(e)
    {
        if (e && e.key === 'Escape') {
            document.removeEventListener('keyup', this.destroyModal)
            this._modalContainer.remove()
        } else if (!e)
            this._modalContainer.remove()
    }
}