import DragDrop from '../../modules/DragDrop'
import ColorPicker from '../../modules/ColorPicker'

window.addEventListener('load', () => {
    if (document.body.id === 'drag-drop') {
        const session = new DragDrop(document.body.children[1])
        new ColorPicker()
        document.querySelector('button:last-child').addEventListener('click', () => {
            session.socket.emit('reset')
        })
    }
})