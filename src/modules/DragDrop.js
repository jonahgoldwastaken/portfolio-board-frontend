import Socket from './Socket'

export default class DragDrop extends Socket {

    set currentStartPos(item)
    {
        const listChildren = Array.from(item.parentNode.children)
        const listList = Array.from(item.parentNode.parentNode.parentNode.children)
        const itemIndex = listChildren.indexOf(item)
        const listIndex = listList.indexOf(item.parentNode.parentNode)
        this._currentStartPos = { listIndex: listIndex, itemIndex: itemIndex }
    }

    get currentStartPos()
    {
        return this._currentStartPos
    }

    set currentEndPos(item)
    {
        const listChildren = Array.from(item.parentNode.children)
        const listList = Array.from(item.parentNode.parentNode.parentNode.children)
        const itemIndex = listChildren.indexOf(item)
        const listIndex = listList.indexOf(item.parentNode.parentNode)
        this._currentEndPos = { listIndex: listIndex, itemIndex: itemIndex }
    }

    get currentEndPos()
    {
        return this._currentEndPos
    }

    set mousePos(e)
    {
        this._mousePos = [
            e.pageX,
            e.pageY
        ]
    }

    get mousePos()
    {
        return this._mousePos
    }

    set listItems(item)
    {
        if (!this._listItems) this._listItems = []
        this._listItems.push(item)
    }
    
    get listItems()
    {
        return this._listItems
    }
    
    set lists(list)
    {
        if (!this._lists) this._lists = []
        this._lists.push(list)
    }

    get lists()
    {
        return this._lists
    }

    set placeholder(el)
    {
        el.classList.add('empty')
        el.style.setProperty('--placeholder-width', this.currentDragDimensions.width + 'px')
        el.style.setProperty('--placeholder-height', this.currentDragDimensions.height + 'px')
        this._placeholder = el
    }

    get placeholder()
    {
        return this._placeholder
    }
    
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor(container)
    {
        super('/drag-drop')

        this.socket.on('initLists', itemContent => {
            this.itemContent = itemContent
            this.listContainer = container
            this.constructLists()
        })
        this.socket.on('moveItem', positions => this.onMoveItem(positions))
                
        this.updateCurrentDragPosition = this.updateCurrentDragPosition.bind(this)
        this.dragStop = this.dragStop.bind(this)

        document.addEventListener('mousemove', (e) => {
            this.mousePos = e
        })

        requestAnimationFrame(function () {
            this.updateCurrentDragPosition()
            this.scrollHoverList()
            this.checkPlacholderPosition()
        }.bind(this))
    }

    /**
     * Create UL Element and inject into DOM
     */
    constructLists()
    {
        if (this.listContainer.children.length)
            this.listContainer.innerHTML = ''
            
        this.itemContent.forEach((list, i) => {
            const newSection = document.createElement('section')
            this.listContainer.appendChild(newSection)

            const newHeading = document.createElement('h2')
            newHeading.innerHTML = list.heading
            newSection.appendChild(newHeading)
            
            const newList = document.createElement('ul')
            this.lists = newList

            list['listItems'].forEach((itemContent, j) => {
                const newItem = document.createElement('li')
        
                newItem.innerHTML = `
                    <h3>${itemContent.title}</h3>
                    ${itemContent.subtitle ? `
                        <h4>${itemContent.subtitle}</h4>
                    ` : ''}
        
                    ${itemContent.text ? `
                        <p>${itemContent.text}</p>
                    ` : ''}
        
                    ${itemContent.links ? `
                        <ul>
                            ${itemContent.links.map((link, index) => `
                                <li>
                                    <a target=_blank href="${link}">${itemContent.linkTexts[index]}</a>
                                </li>
                            `).join('')}
                        </ul>
                    ` : ''}
                `

                newList.appendChild(newItem)
                this.listItems = newItem
            })

            newSection.appendChild(newList)
        })

        for (let item of this.listItems)
            item.addEventListener('mousedown', (e) => this.dragStart(e), { bubbles: false })
    }

    /**
     * 
     * @param {Object[]} positions 
     */
    onMoveItem(positions)
    {
        const startPos = positions[0]
        const endPos = positions[1]
        const elementToMove = this.listContainer.children[startPos.listIndex].children[1].children[startPos.itemIndex]
        const putList = this.listContainer.children[endPos.listIndex].children[1]

        if (endPos.itemIndex >= putList.children.length)
            putList.children[endPos.itemIndex - 1].insertAdjacentElement('afterend', elementToMove)
        else
            putList.children[endPos.itemIndex].insertAdjacentElement('beforebegin', elementToMove)
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    dragStart(e)
    {
        e.preventDefault()
        
        this.currentDrag = e.currentTarget
        
        const leftOffset = this.mousePos[0] - this.currentDrag.getBoundingClientRect().left
        const topOffset = this.mousePos[1] - this.currentDrag.getBoundingClientRect().top

        this.currentDragOffset = [
            leftOffset,
            topOffset
        ]

        this.currentStartPos = this.currentDrag

        this.currentDrag.classList.add('isDragging')

        this.updateCurrentDragPosition()
        
        this.placeholder = document.createElement('li')
        this.currentDrag.insertAdjacentElement('beforebegin', this.placeholder)

        document.body.appendChild(this.currentDrag)

        document.body.addEventListener('mouseup', this.dragStop, {bubbles: false})
    }

    updateCurrentDragPosition()
    {
        requestAnimationFrame(function () {
            this.updateCurrentDragPosition()
        }.bind(this))
        
        if (this.currentDrag) {
            this.currentDrag.style.setProperty('--drag-top', (this.mousePos[1] - (this.currentDragOffset[1]) + 'px'))
            this.currentDrag.style.setProperty('--drag-left', (this.mousePos[0] - (this.currentDragOffset[0]) + 'px'))
    
            this.currentDragDimensions = this.currentDrag.getBoundingClientRect()
            this.currentDragDimensions.topCenter = this.currentDragDimensions.top + (this.currentDragDimensions.height / 2)
            this.currentDragDimensions.leftCenter = this.currentDragDimensions.left + (this.currentDragDimensions.width / 2)
        }
    }

    scrollHoverList()
    {
        requestAnimationFrame(function () {
            this.scrollHoverList()
        }.bind(this))

        if (this.currentDrag) {
            for (let list of this.lists) {
                const listDimensions = list.getBoundingClientRect()
    
                if (listDimensions.left < this.currentDragDimensions.leftCenter && listDimensions.right > this.currentDragDimensions.leftCenter) {
                    if (this.currentDragDimensions.topCenter <= listDimensions.top + 300) {
                        list.scrollTop -= (((listDimensions.top + 300) - this.mousePos[1]) / 10)
                    }
                    else if (this.currentDragDimensions.topCenter >= listDimensions.bottom - 300) {
                        list.scrollTop += ((this.mousePos[1] - (listDimensions.bottom - 300)) / 10)
                    }
                }
            }
        }
    }

    checkPlacholderPosition()
    {
        requestAnimationFrame(function () {
            this.checkPlacholderPosition()
        }.bind(this))
        
        if (this.currentDrag) {            
            for (let list of this.lists) {
                const listDimensions = list.getBoundingClientRect()
            
                if (listDimensions.left < this.currentDragDimensions.leftCenter && listDimensions.right > this.currentDragDimensions.leftCenter) {

                // If no children, just put placeholder inside the list
                    if (!list.children.length) {
                        list.appendChild(this.placeholder)
                        break
                    }

                    // Make pairs of all elements, and check per pair if the mouse is inbetween the pair
                    let pairs = []
                    const listChildren = Array.from(list.children)
                    listChildren.forEach((item, i) => item.nextElementSibling !== undefined ? pairs.push([
                        item,
                        item.nextElementSibling
                    ]) : pairs.push([item]))

                    pairs.forEach(pair => {
                        if (pair[1]) {
                            const pairDimensions = [
                                pair[0].getBoundingClientRect(),
                                pair[1].getBoundingClientRect()
                            ]
                        
                            const offset = [
                                pairDimensions[0].top + (pairDimensions[0].height / 2),
                                pairDimensions[1].top + (pairDimensions[1].height / 2) 
                            ]

                            if (offset[0] < this.currentDragDimensions.topCenter && offset[1] > this.currentDragDimensions.topCenter) {
                                pair[0].insertAdjacentElement('afterend', this.placeholder)
                            }
                        }
                    })

                    // If mouse is not between one of pairs, check first or last child if mouse is above or below it
                    const firstChild = list.children[0]
                    const lastChild = list.children[list.children.length -1]
                    const firstChildOffset = firstChild.getBoundingClientRect().top + (firstChild.getBoundingClientRect().height / 2)
                    const lastChildOffset = lastChild.getBoundingClientRect().top + (lastChild.getBoundingClientRect().height / 2)

                    if (firstChildOffset > this.currentDragDimensions.topCenter) {
                        firstChild.insertAdjacentElement('beforebegin', this.placeholder)
                        break
                    } else if (lastChildOffset < this.currentDragDimensions.topCenter) {
                        lastChild.insertAdjacentElement('afterend', this.placeholder)
                        break
                    }
                }
            }
        }
    }

    dragStop()
    {
        document.body.removeEventListener('mouseup', this.dragStop, {bubbles: false})

        this.currentDrag.classList.remove('isDragging')
        
        this.placeholder.insertAdjacentElement('afterend', this.currentDrag)
        this.placeholder.parentNode.removeChild(this.placeholder)

        this.currentEndPos = this.currentDrag
        if (this.currentStartPos != this.currentEndPos) {
            this.socket.emit('moveItem', [
                this.currentStartPos,
                this.currentEndPos
            ])
        }

        this.currentDrag = null
    }
}