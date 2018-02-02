const views = {
    list: list => `
        <ul>
            ${list.listItems.map(item => `
                <li>
                    <input type="radio" name="item" value="${item.title}" id="${item.title}">
                    <label for="${item.title}">${item.title}</label>
                </li>
            `).join('')}
        </ul>
    `,

    store: () => `
    
    `,

    profile: () => {

    }
}

export default class SteamView {
    constructor(list) {
        this._list = list
        // switch(list.type) {
        //     case 'list': {
        this._listHTML = views.list(this._list)
        this.addListListeners()
        //         break
        //     }
        // }
    }

    addListListeners() {
        const items = document.querySelectorAll('[name="item"]')
        for (let item of items) {
            item.addEventListener('change', e => {
                const selectedItem = e.currentTarget.value
                this.getItemContent(selectedItem)
            })
        }
    }

    addStoreListeners() {

    }

    addProfileListeners() {

    }
}