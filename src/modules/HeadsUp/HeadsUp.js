export default class HeadsUp
{

    set type(type)
    {
        this._type = type
    }

    get type()
    {
        return this._type
    }

    set message(msg)
    {
        this._message = msg
    }

    get message()
    {
        return this._message
    }

    set canSendNotifications(enabled) {
        this._notificationsEnabled = enabled
    }

    get canSendNotifications() {
        return this._notificationsEnabled
    }

    constructor(type, msg) {
        this.type = type
        this.message = msg
        this.requestNotificationPermission()
            .then(result => {
                if (result == 'granted') result = true
                else result = false
                this.canSendNotifications = result
                if (this.canSendNotifications) {
                    this.sendNotification()
                } else {
                    this.createPopUp()
                }
            })
    }

    /**
     * 
     * @returns boolean
     */
    async requestNotificationPermission()
    {
        return Notification.requestPermission()
    }

    sendNotification()
    {
        switch (this.type) {
            case 'serverMessage': {
                new Notification('Bericht van server', { body: this.message, icon: 'https://via.placeholder.com/800x800' })
                break
            }
            case 'chatMessage': {
                new Notification(this.message.sender, { body: this.message.content })
            }
        }
    }

    createPopUp()
    {
        const notification = document.createElement('div')
        const notificationTextContainer = document.createElement('div')
        const notificationTitle = document.createElement('h1')
        const notificationContent = document.createElement('p')
        const notificationImage = document.createElement('img')

        switch (this.type) {
            case 'serverMessage': {
                notificationTitle.innerHTML = 'Message from server'
                notificationContent.innerHTML = this.message
                notificationImage.src = 'https://via.placeholder.com/800x800'
                break
            }
        }
        
        notification.classList.add('pop-up')
        notification.appendChild(notificationImage)
        notification.appendChild(notificationTextContainer)
        notificationTextContainer.appendChild(notificationTitle)
        notificationTextContainer.appendChild(notificationContent)
        document.body.appendChild(notification)
        notification.addEventListener('animationend', () => notification.remove(), false)
    }
}