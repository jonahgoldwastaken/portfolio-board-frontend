import DragDrop from '../../modules/DragDrop'

window.addEventListener('load', () => {
    if (document.body.id === 'drag-drop') {
        const session = new DragDrop(document.body.children[1])
        document.querySelector('button').addEventListener('click', () => {
            session.socket.emit('reset')
        })
    }
})