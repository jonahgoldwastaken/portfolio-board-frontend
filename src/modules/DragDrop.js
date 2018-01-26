import Socket from './Socket'

export default class DragDrop extends Socket {
    set currentStartPos(item) {
        const listChildren = Array.from(item.parentNode.children)
        const listList = Array.from(item.parentNode.parentNode.parentNode.children)
        const itemIndex = listChildren.indexOf(item)
        const listIndex = listList.indexOf(item.parentNode.parentNode)
        this._currentStartPos = { listIndex: listIndex, itemIndex: itemIndex }
    }

    get currentStartPos() {
        return this._currentStartPos
    }

    set currentEndPos(item) {
        const listChildren = Array.from(item.parentNode.children)
        const listList = Array.from(item.parentNode.parentNode.parentNode.children)
        const itemIndex = listChildren.indexOf(item)
        const listIndex = listList.indexOf(item.parentNode.parentNode)
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

    set listItems(item) {
        if (!this._listItems) this._listItems = []
        this._listItems.push(item)
    }

    get listItems() {
        return this._listItems
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
    }

    get placeholder() {
        return this._placeholder
    }

    /**
    * @param {HTMLElement} container
    */
    constructor(container) {
        super('/drag-drop')

        this.styleEl = document.createElement('style')
        document.head.appendChild(this.styleEl)

        this.dragStop = this.dragStop.bind(this)

        this.socket.on('initLists', itemContent => {
            this.itemContent = itemContent
            this.listContainer = container
            this.constructLists()
            this.updateScrollBars()
            this.addScrollBarListeners()
            this.addMousePosListeners()
            this.addContainerScrollListener()
        })

        this.socket.on('moveItem', positions => this.onMoveItem(positions))

        requestAnimationFrame(function() {
            this.updateCurrentDragPosition()
            this.checkCurrentDragCollision()
        }.bind(this))
    }

    /**
    * Create sections, headings and lists and inject into DOM
    */
    constructLists() {
        if (this.listContainer.children.length) {
            this.listContainer.innerHTML = ''
            this._lists = null
            this._listItems = null
        }

        this.itemContent.forEach(list => {
            const newSection = document.createElement('section')
            const newList = document.createElement('ul')
            const newHeading = document.createElement('h2')

            newHeading.innerHTML = list.heading
            newSection.appendChild(newHeading)

            this.lists = newList
            list = this.organiseListItems(list)
            list.listItems.forEach(itemContent => {
                const newItem = document.createElement('li')
                this.listItems = newItem

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
            this.constructScrollBar(newList)

            this.listContainer.appendChild(newSection)
        })

        this.addListListeners(this.lists)
        this.addItemListeners(this.listItems)
    }

    organiseListItems(list) {
        switch (list.flow) {
            default: {
                return list
            }

            case 'reverse': {
                list.listItems.reverse()
                return list
            }

            case 'sort': {
                list.listItems.sort((a, b) => b.title.toUpperCase() < a.title.toUpperCase())
                return list
            }
        }
    }

    /**
    *
    * @param {HTMLElement[]} list All HTML list item elements in the listContainer
    */
    constructScrollBar(list) {
        const scrollBarContainer = document.createElement('div')
        const scrollbar = document.createElement('div')

        scrollBarContainer.appendChild(scrollbar)
        list.insertAdjacentElement('afterend', scrollBarContainer)
    }

    /**
    * Add event listeners to list items for dragStart method
    * @param {HTMLElement[]} items All HTML list item elements in the listContainer
    */
    addItemListeners(items) {
        items.forEach(item => {
            item.addEventListener('mousedown', e => this.dragStart(e), { bubbles: false })
        })
    }

    /**
    * Add event listeners to lists for scrollList method
    * @param {HTMLElement[]} lists All HTML lists in the listContainer
    */
    addListListeners(lists) {
        lists.forEach(list => {
            list.addEventListener('wheel', e => this.scrollList(e), { bubbles: false })
        })
    }

    addScrollBarListeners() {
        window.addEventListener('resize', () => this.updateScrollBars())
    }

    addContainerScrollListener() {
        this.listContainer.addEventListener('mousewheel', e => {
            if (e.target === this.listContainer) {
                this.listContainer.scrollLeft += e.deltaY
            }
        })
    }

    addMousePosListeners() {
        document.addEventListener('mousemove', e => this.mousePos = e)
    }

    /**
    *
    * @param {number[]} positions
    */
    onMoveItem(positions) {
        const startPos = positions[0]
        const endPos = positions[1]
        const elementToMove = this.listContainer.children[startPos.listIndex].children[1].children[startPos.itemIndex]
        const putList = this.listContainer.children[endPos.listIndex].children[1]

        if (endPos.itemIndex >= putList.children.length)
            putList.children[endPos.itemIndex - 1].insertAdjacentElement('afterend', elementToMove)
        else
            putList.children[endPos.itemIndex].insertAdjacentElement('beforebegin', elementToMove)

        this.updateScrollBars()
    }

    /**
    * Emit list item move
    */
    sendMoveItem() {
        if (this.currentStartPos !== this.currentEndPos) {
            this.socket.emit('moveItem', [
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

        const leftOffset = this.mousePos[0] - this.currentDrag.getBoundingClientRect().left
        const topOffset = this.mousePos[1] - this.currentDrag.getBoundingClientRect().top

        this.currentDragOffset = [
            leftOffset,
            topOffset
        ]

        this.updateCurrentDragPosition()

        this.placeholder = document.createElement('li')
        this.currentDrag.insertAdjacentElement('beforebegin', this.placeholder)

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
            this.currentDragPosition = [
                this.mousePos[1] - this.currentDragOffset[1] + 'px',
                this.mousePos[0] - this.currentDragOffset[0] + 'px'
            ]

            this.currentDragDimensions = this.currentDrag.getBoundingClientRect()
            this.currentDragDimensions.topCenter = this.currentDragDimensions.top + this.currentDragDimensions.height / 2
            this.currentDragDimensions.leftCenter = this.currentDragDimensions.left + this.currentDragDimensions.width / 2

            this.updateScrollBars()
        }
    }

    /**
    * Scroll list functionality (mitigates native scrollbars)
    * @param {WheelEvent} e The 'wheel' event, including the list as currentTarget
    */
    scrollList(e) {
        const list = e.currentTarget
        list.scrollTop += e.deltaY
        this.updateScrollBars()
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
    * Update scrollbar offset and height
    */
    updateScrollBars() {
        this.scrollbarDimensions = []
        this.lists.forEach((list, i) => {
            const sbTop = list.scrollTop / list.scrollHeight * 100
            const sbHeight = list.offsetHeight / list.scrollHeight * 100

            this.scrollbarDimensions[i] = [
                sbTop,
                sbHeight
            ]
        })
        this.updateStyleEl()
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

        const firstChild = list.children[0]
        const lastChild = list.children[list.children.length - 1]
        const firstChildOffset = firstChild.getBoundingClientRect().top + firstChild.getBoundingClientRect().height / 2
        const lastChildOffset = lastChild.getBoundingClientRect().top + lastChild.getBoundingClientRect().height / 2

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

    updateStyleEl() {
        this.styleEl.innerHTML = `
            ${this.currentDrag ? `
                .isDragging {
                    --drag-top: ${this.currentDragPosition[0]};
                    --drag-left: ${this.currentDragPosition[1]};
                }
            ` : '' }
            
            ${this.lists.map((_, i) => `
                #drag-drop main section:nth-child(${i + 1})>div>div {
                    --sb-top: ${this.scrollbarDimensions[i][0]}%;
                    --sb-height: ${this.scrollbarDimensions[i][1]}%;
                }
            `).join('')}
            
            ${this._placeholderDimensions ? `
                li.empty {
                    --placeholder-width: ${this._placeholderDimensions[0]};
                    --placeholder-height: ${this._placeholderDimensions[1]};
                }
            ` : '' }
        `
    }
}
