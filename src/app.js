require('./app.css')

import 'babel-polyfill'
import { dragDropInit } from './components/drag-drop/drag-drop'
import { loginInit } from './components/login/login'
import { steamInit } from './components/steam/steam'
import ColorPicker from './modules/ColorPicker'

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.id !== 'login') {
        switch (Math.floor(Math.random() * 5)) {
            default: {
                document.body.id = 'steam'
                steamInit()
                break
            }
            case 6: {
                document.body.id = 'drag-drop'
                dragDropInit()
                break
            }
        }
        new ColorPicker()
    } else {
        loginInit()
    }
})