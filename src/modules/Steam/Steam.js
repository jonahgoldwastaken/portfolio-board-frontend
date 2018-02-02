import Socket from '../Socket'
import SteamView from './SteamView'

export default class Steam extends Socket {
    /**
     * 
     * @param {HTMLElement} appContainer 
     */
    constructor(appContainer) {
        super()

        this.socket.on('initApp', content => {
            content.forEach(list => this.organiseListItems(list))
            this._lists = content
            this._appContainer = appContainer
            this._selectedList = this._lists[0]
            this.constructNavigation()
            this.addNavigationListener()
            this.constructView()
        })
    }

    constructNavigation() {
        const newNav = document.createElement('nav')
        this._navList = document.createElement('ul')
        this._lists.forEach(list => {
            this._navList.innerHTML += `
                <li>
                    <button ${list.heading === this._selectedList.heading ? 'class="active"' : ''} data-target="${list.heading}">${list.heading}</button>
                </li>
            `
        })

        newNav.appendChild(this._navList)
        this._appContainer.appendChild(newNav)
    }

    addNavigationListener() {
        for (let item of this._navList.children) {
            item.children[0].addEventListener('click', e => this.switchView(e))
        }
    }

    constructView() {
        const listSection = document.createElement('section')
        listSection.innerHTML = new SteamView(this._selectedList)._listHTML
        this._appContainer.appendChild(listSection)
    }

    switchView(e) {
        const clickedButton = e.currentTarget
        for (let item of this._navList.children)
            item.children[0].classList.remove('active')
        clickedButton.classList.add('active')
        this._selectedList = this.getList(clickedButton.dataset.target)
    }

    getList(heading) {
        return this._lists.find(list =>
            list.heading === heading)
    }

    getItemContent(uuid) {
        return this._lists[0].listItems.find(item =>
            item.title === uuid)
    }
}