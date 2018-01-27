require('./app.css')

import 'babel-polyfill'
import { dragDropInit } from './components/drag-drop/drag-drop'
import { loginInit } from './components/login/login'

document.addEventListener('DOMContentLoaded', () => {
    dragDropInit()
    loginInit()
})