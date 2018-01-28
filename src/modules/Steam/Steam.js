import Socket from '../Socket'
import { views } from './view'
// import { views } from './view'

export default class Steam extends Socket {
    /**
     * 
     * @param {HTMLElement} appContainer 
     */
    constructor(appContainer) {
        super()

        this.socket.on('initApp', content => {
            content.forEach(list => this.organiseListItems(list))
            this._itemContent = content
            this._appContainer = appContainer
            this.constructNavigation()
            this.constructView()
        })
    }

    constructNavigation() {
        const newNav = document.createElement('nav')
        this._navList = document.createElement('ul')

        this._itemContent.forEach(list => {
            this._navList.innerHTML += `
                <li>
                    <button data-target="${list.heading}">${list.heading}</button>
                </li>
            `
        })

        newNav.appendChild(this._navList)
        this._appContainer.appendChild(newNav)

        for (let item of this._navList.children) {
            item.children[0].addEventListener('click', e => this.switchView(e))
        }
    }

    constructView() {
        const listSection = document.createElement('section')

        listSection.innerHTML = views['list'](this._itemContent[0])
        this._appContainer.appendChild(listSection)
        const items = document.querySelectorAll('[name="item"]')

        for (let item of items) {
            item.addEventListener('change', e => {
                const selectedItem = e.currentTarget.value
                this.getItem(selectedItem)
            })
        }
    }

    switchView(e) {
        const clickedButton = e.currentTarget
        for (let item of this._navList.children) {
            item.children[0].classList.remove('active')
        }
        clickedButton.classList.add('active')
    }

    getItem() {

    }
}