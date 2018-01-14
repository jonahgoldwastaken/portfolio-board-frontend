import io from 'socket.io-client'
import HeadsUp from './HeadsUp/HeadsUp'

export default class Socket
{
    get socket()
    {
        return this._socket
    }

    set socket(socket)
    {
        this._socket = socket
    }

    /**
     * 
     * @param {string} nsp 
     */
    constructor(nsp)
    {
        this.socket = io(`https://localhost:3000${nsp ? nsp : ''}`)
        this.socket.on('connect', () => {
            this.socket.on('serverMessage', msg => {
                new HeadsUp('serverMessage', msg)
            })
        })
        this.socket.on('error', () => {
            new HeadsUp('serverMessage', 'There is something wrong with your connection, please try reloading the page')
        })
    }

    listener()
    {

    }

    /**
     * Parse URL parameters
     */
    params()
    {
        if (window.location.search) {
            let params = window.location.search,
                paramsObject = {}
            
            params = params.slice(1)

            // const commaTest = new RegExp(/(,{1})/)
            const equalsTest = new RegExp(/(={1})/)
            const amperSandTest = new RegExp(/(&{1})/)

            params = amperSandTest[Symbol.split](params)

            for (let param of params) {
                if (amperSandTest.test(param)) {
                    params.splice(params.indexOf(param), 1)
                }
            }

            for (let param of params) {
                param = equalsTest[Symbol.split](param)
                let paramName = param[0]
                let paramValue = param[2]
                paramsObject[paramName] = paramValue
            }

            params = paramsObject
            return params
        } else {
            return null
        }
    }

}