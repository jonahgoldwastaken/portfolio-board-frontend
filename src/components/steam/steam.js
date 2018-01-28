import Steam from '../../modules/Steam/Steam'

export const steamInit = () => {
    new Steam(document.body.children[1])
}
