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
     */
    constructor()
    {
        this.socket = io('https://localhost:3000')
        this.socket.on('connect', () => {
            this.socket.on('serverMessage', msg => {
                new HeadsUp('serverMessage', msg)
            })
        })
        this.socket.on('error', () => {
            new HeadsUp('serverMessage', 'Er is iets fout gegaan in de verbinding met de server, probeer de pagina te herladen.')
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

            for (let param of params)
                if (amperSandTest.test(param))
                    params.splice(params.indexOf(param), 1)

            for (let param of params) {
                param = equalsTest[Symbol.split](param)
                let paramName = param[0]
                let paramValue = param[2]
                paramsObject[paramName] = paramValue
            }

            params = paramsObject
            return params
        } else
            return null
    }

}