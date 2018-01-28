export const views = {
    list: list => `
        <ul>
            ${list.listItems.map(item => `
                <li>
                    <input type="radio" name="item" value="${item.title}" id="${item.title}">
                    <label for="${item.title}">${item.title}</label>
                </li>
            `).join('')}
        </ul>
    `,

    store: () => `
    
    `,

    profile: () => {

    }
}