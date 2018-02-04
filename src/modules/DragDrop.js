import Socket from './Socket'

export default class DragDrop extends Socket {
    set currentStartPos(item) {
        const listChildren = Array.from(item.parentNode.children),
            listList = Array.from(item.parentNode.parentNode.parentNode.children),
            itemIndex = listChildren.indexOf(item),
            listIndex = listList.indexOf(item.parentNode.parentNode)
        this._currentStartPos = { listIndex: listIndex, itemIndex: itemIndex }
    }

    get currentStartPos() {
        return this._currentStartPos
    }

    set currentEndPos(item) {
        const listChildren = Array.from(item.parentNode.children),
            listList = Array.from(item.parentNode.parentNode.parentNode.children),
            itemIndex = listChildren.indexOf(item),
            listIndex = listList.indexOf(item.parentNode.parentNode)
        this._currentEndPos = { listIndex: listIndex, itemIndex: itemIndex }
    }

    get currentEndPos() {
        return this._currentEndPos
    }

    set mousePos(e) {
        this._mousePos = [
            e.pageX,
            e.pageY
        ]
    }

    get mousePos() {
        return this._mousePos
    }

    set lists(list) {
        if (!this._lists) this._lists = []
        this._lists.push(list)
    }

    get lists() {
        return this._lists
    }

    set placeholder(el) {
        el.classList.add('empty')
        this._placeholderDimensions = [
            this.currentDragDimensions.width + 'px',
            this.currentDragDimensions.height + 'px'
        ]
        this._placeholder = el
        this.lists[this.currentStartPos.listIndex].children[this.currentStartPos.itemIndex].insertAdjacentElement('beforebegin', this._placeholder)
    }

    get placeholder() {
        return this._placeholder
    }

    /**
    * @param {HTMLElement} container
    */
    constructor(container) {
        super()
        this._socket.on('connect', () => {
            this._socket.on('initApp', () => {
                this.constructLists()
                this.addMousePosListeners()
                this.createResetButton()
                this.addResetButtonListener()
            })
            this._socket.on('resetApp', () => {
                this.constructLists()
                this.addMousePosListeners()
            })
            this._socket.on('updateApp', () => {
                this.constructLists()
                this.addMousePosListeners()
            })
            this._socket.on('moveItem', positions => this.onMoveItem(positions))
        })
        this.dragStop = this.dragStop.bind(this)
        this._listContainer = container
        this.createStyleEl()

        requestAnimationFrame(function() {
            this.updateCurrentDragPosition()
            this.checkCurrentDragCollision()
            this.updateStyleEl()
        }.bind(this))
    }

    /**
    * Create sections, headings and lists and inject into DOM
    */
    constructLists() {
        if (this._listContainer.children.length) {
            this.lists.forEach(list => list.remove())
            this._lists = []
            this._listContainer.innerHTML = ''
        }

        this._appContent.forEach(list => {
            const newSection = document.createElement('section'),
                newList = document.createElement('ul'),
                newHeading = document.createElement('h2')
            newHeading.innerHTML = list.heading
            newSection.appendChild(newHeading)
            this.lists = newList
            list.listItems.forEach(itemContent => {
                const newItem = document.createElement('li')
                newItem.innerHTML = `
                        ${itemContent.title ? `<h3>${itemContent.title}</h3>` : '' }
                        ${itemContent.subtitle ? `<h4>${itemContent.subtitle}</h4>` : '' }
                        ${itemContent.image ? `<img src="${itemContent.image}" alt="${itemContent.alt}">` : '' }
                        ${itemContent.text ? `<p>${itemContent.text}</p>` : '' }
                        ${itemContent.links ? `
                            <ul>
                                ${itemContent.links.map((link, index) => `
                                    <li>
                                        <a target=_blank href="${link}">${itemContent.linkTexts[index]}</a>
                                    </li>
                                `).join('') }
                            </ul>
                        ` : '' }
                    `
                newList.appendChild(newItem)
            })

            newSection.appendChild(newList)
            this._listContainer.appendChild(newSection)
            this.addItemListeners(newList.children)
        })
    }

    createResetButton() {
        this._resetButton = document.createElement('button')
        this._resetButton.innerHTML = 'Reset lijsten'
        document.querySelector('header div').appendChild(this._resetButton)
    }

    /**
    * Add event listeners to list items for dragStart method
    * @param {HTMLElement[]} items All HTML list item elements in the _listContainer
    */
    addItemListeners(items) {
        Array.prototype.forEach.call(items, item => {
            item.addEventListener('mousedown', e => this.dragStart(e), { bubbles: false })
        })
    }

    addMousePosListeners() {
        document.addEventListener('mousemove', e => this.mousePos = e)
    }

    addResetButtonListener() {
        this._resetButton.addEventListener('click', () => {
            this._socket.emit('reset')
        })
    }

    /**
    * @param {number[]} positions
    */
    onMoveItem(positions) {
        const startPos = positions[0],
            endPos = positions[1],
            elementToMove = this._listContainer.children[startPos.listIndex].children[1].children[startPos.itemIndex],
            putList = this._listContainer.children[endPos.listIndex].children[1]
        if (endPos.itemIndex >= putList.children.length)
            putList.children[endPos.itemIndex - 1].insertAdjacentElement('afterend', elementToMove)
        else
            putList.children[endPos.itemIndex].insertAdjacentElement('beforebegin', elementToMove)
    }

    /**
    * Emit list item move
    */
    sendMoveItem() {
        if (this.currentStartPos !== this.currentEndPos) {
            this._socket.emit('moveItem', [
                this.currentStartPos,
                this.currentEndPos
            ])
        }
    }

    /**
    * Initialize dragging functionality onto clicked listitem
    * @param {MouseEvent} e The mousedown event, including the list item as currentTarget
    */
    dragStart(e) {
        e.preventDefault()
        if (e.target.tagName === 'A') return
        this.currentDrag = e.currentTarget
        this.currentStartPos = this.currentDrag
        
        const leftOffset = this.mousePos[0] - this.currentDrag.getBoundingClientRect().left,
            topOffset = this.mousePos[1] - this.currentDrag.getBoundingClientRect().top
        this._currentDragOffset = [
            leftOffset,
            topOffset
        ]
        
        this.updateCurrentDragPosition()
        this.placeholder = document.createElement('li')
        this.currentDrag.classList.add('isDragging')
        document.body.appendChild(this.currentDrag)
        
        document.body.addEventListener('mouseup', this.dragStop, { bubbles: false })
    }

    /**
     * Updates the position of the current dragging item
     */
    updateCurrentDragPosition() {
        requestAnimationFrame(function() {
            this.updateCurrentDragPosition()
        }.bind(this))

        if (this.currentDrag) {
            this._currentDragPosition = [
                this.mousePos[1] - this._currentDragOffset[1] + 'px',
                this.mousePos[0] - this._currentDragOffset[0] + 'px'
            ]
            this.currentDragDimensions = this.currentDrag.getBoundingClientRect()
            this.currentDragDimensions.topCenter = this.currentDragDimensions.top + this.currentDragDimensions.height / 2
            this.currentDragDimensions.leftCenter = this.currentDragDimensions.left + this.currentDragDimensions.width / 2
            this.updateStyleEl()
        }
    }

    /**
    * Scroll the list if currentdrag hovers over it
    */
    scrollHoverList(list, listDimensions) {
        if (this.currentDragDimensions.topCenter <= listDimensions.top + 300)
            list.scrollTop -= (listDimensions.top + 300 - this.mousePos[1]) / 10
        else if (this.currentDragDimensions.topCenter >= listDimensions.bottom - 300)
            list.scrollTop += (this.mousePos[1] - (listDimensions.bottom - 300)) / 10
    }

    /**
    * Checks where to place the 'empty' list item and places it there
    */
    checkCurrentDragCollision() {
        requestAnimationFrame(function() {
            this.checkCurrentDragCollision()
        }.bind(this))

        if (this.currentDrag) {
            for (let list of this.lists) {
                const listDimensions = list.getBoundingClientRect()

                if (listDimensions.left < this.currentDragDimensions.leftCenter && listDimensions.right > this.currentDragDimensions.leftCenter) {
                    this.checkPlaceholderCollision(list)
                    this.scrollHoverList(list, listDimensions)
                }
            }
        }
    }

    checkPlaceholderCollision(list) {
        // If no children, just put placeholder inside the list
        if (!list.children.length) {
            list.appendChild(this.placeholder)
            return
        }

        const firstChild = list.children[0],
            lastChild = list.children[list.children.length - 1],
            firstChildOffset = firstChild.getBoundingClientRect().top + firstChild.getBoundingClientRect().height / 2,
            lastChildOffset = lastChild.getBoundingClientRect().top + lastChild.getBoundingClientRect().height / 2
        if (firstChildOffset > this.currentDragDimensions.topCenter) {
            firstChild.insertAdjacentElement('beforebegin', this.placeholder)
            return
        } else if (lastChildOffset < this.currentDragDimensions.topCenter) {
            lastChild.insertAdjacentElement('afterend', this.placeholder)
            return
        }

        // Make pairs of all elements, and check per pair if the mouse is inbetween the pair
        let pairs = this.createCollisionPairs(Array.from(list.children))
        this.checkCollisionPairs(pairs)
    }

    checkCollisionPairs(pairs) {
        pairs.forEach(pair => {
            if (pair[1]) {
                const pairDimensions = [
                    pair[0].getBoundingClientRect(),
                    pair[1].getBoundingClientRect()
                ]
                const offsets = [
                    pairDimensions[0].top + pairDimensions[0].height / 2,
                    pairDimensions[1].top + pairDimensions[1].height / 2
                ]
                if (offsets[0] < this.currentDragDimensions.topCenter && offsets[1] > this.currentDragDimensions.topCenter)
                    pair[0].insertAdjacentElement('afterend', this.placeholder)
            }
        })
    }

    createCollisionPairs(items) {
        const pairs = []
        items.forEach(item => item.nextElementSibling ? pairs.push([
            item,
            item.nextElementSibling
        ]) : pairs.push([item]))

        return pairs
    }

    dragStop() {
        document.body.removeEventListener('mouseup', this.dragStop, { bubbles: false })
        this.currentDrag.classList.remove('isDragging')
        this.placeholder.insertAdjacentElement('afterend', this.currentDrag)
        this.placeholder.parentNode.removeChild(this.placeholder)
        this.currentEndPos = this.currentDrag
        this.sendMoveItem()
        this.currentDrag = null
    }

    createStyleEl() {
        this.styleEl = document.createElement('style')
        document.head.appendChild(this.styleEl)
    }

    updateStyleEl() {
        this.styleEl.innerHTML = `
            ${this.currentDrag ? `
                .isDragging {
                    --drag-top: ${this._currentDragPosition[0]};
                    --drag-left: ${this._currentDragPosition[1]};
                }
            ` : ''}
            ${this._placeholderDimensions ? `
                li.empty {
                    --placeholder-width: ${this._placeholderDimensions[0]};
                    --placeholder-height: ${this._placeholderDimensions[1]};
                }
            ` : '' }
        `
    }
}
