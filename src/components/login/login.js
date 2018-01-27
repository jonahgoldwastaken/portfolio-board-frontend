const onSignIn = googleUser => {
    const id_token = googleUser.getAuthResponse().id_token
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://localhost:3000/signin')
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.onload = function () { }
    xhr.send('idtoken=' + id_token)
}

const signOut = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://localhost:3000/signout')
    xhr.onload = () => {
        const res = JSON.parse(xhr.response)
        if (res.success) {
            const auth2 = gapi.auth2.getAuthInstance()
            auth2.signOut().then(function () { })
        }
    }
    xhr.send()
}

export const loginInit = () => {
    if (document.body.id === 'login') {
        window.onSignIn = onSignIn
        window.signOut = signOut

        const signoutButton = document.querySelector('#signout')
        signoutButton.addEventListener('click', signOut)
    }
}