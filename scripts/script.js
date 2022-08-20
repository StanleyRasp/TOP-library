// Query selector bindings
let qs = document.querySelector.bind(document);
let qsa = document.querySelectorAll.bind(document);

// Popups
let popupDimmer = qs(".popup-dimmer");
let addPopup = qs(".add-popup");
let detailsPopup = qs(".details-popup");

// Templates
let notReadCardTemp = qs(".not-read.book-card");
let readCardTemp = qs(".read.book-card");

// Global arrays
let unreadBookList = [];
let readBookList = [];

// Global variables
let popupIsOpen = false;
let nextID = 1;

// Support functions
let padNumber = (width, number, padding) =>{
    let paddedNumber = String(number);
    while (paddedNumber.length < width) paddedNumber = padding + paddedNumber;
    return paddedNumber;
}

let bookComperator = (a, b) => {
    if (a.timestamp < b.timestamp){
        return 1;
    } else if (a.timestamp > b.timestamp){
        return -1;
    }
    return 0;
}

let findBook = (event) => {
    let selectedBook;
    if (event.path.indexOf(qs(".unread .cards")) > -1){
        let cardsIndex = event.path.indexOf(qs(".unread .cards"));
        selectedBook = unreadBookList[event.path[cardsIndex-1].dataset.index]
    } else {
        let cardsIndex = event.path.indexOf(qs(".read .cards"));
        selectedBook = readBookList[event.path[cardsIndex-1].dataset.index]
    }
    return selectedBook;
}

let switchBook = (event, unreadBookList, readBookList) => {
    if (event.path.indexOf(qs(".unread .cards")) > -1){
        let cardsIndex = event.path.indexOf(qs(".unread .cards"));
        let bookIndex = event.path[cardsIndex-1].dataset.index;
        unreadBookList[bookIndex].read = true;
        readBookList.push(unreadBookList.splice(bookIndex, 1)[0])
    } else {
        let cardsIndex = event.path.indexOf(qs(".read .cards"));
        let bookIndex = event.path[cardsIndex-1].dataset.index;
        readBookList[bookIndex].read = false;
        unreadBookList.push(readBookList.splice(bookIndex, 1)[0])
    }

    readBookList.sort(bookComperator);
    unreadBookList.sort(bookComperator);

    return [unreadBookList, readBookList];
}

// Book object
function Book(){
    this.id = -1;
    this.title = "Book Title";
    this.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque cursus neque risus, a sollicitudin diam ornare sit amet. Quisque vehicula dui sed sem hendrerit interdum. Aenean id ante ut nunc pharetra rhoncus a feugiat mi. Quisque nulla dolor, condimentum vitae finibus nec, porta at nisi. Fusce posuere ac ligula a ultricies. Curabitur quis condimentum magna. Aenean at leo lectus. Cras velit tellus, maximus at sapien eu, laoreet lacinia ipsum. Pellentesque vitae ante enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    this.link = "https://amazon.com";
        
    let today = new Date();
    this.date = `${padNumber(2, today.getDate(), "0")}.${padNumber(2, today.getMonth(), 0)}.${today.getFullYear()}`
    this.timestamp = Date.now();
    this.read = false;
}

// Closes all popups
let closePopups = () => {
    addPopup.style.transform = "scale(0)";
    detailsPopup.style.transform = "scale(0)";

    setTimeout(() => {
        popupDimmer.style.height = "0vh";
        addPopup.style.display = "none";
        detailsPopup.style.display = "none";
        popupIsOpen = false;
    }, 300)

    setTimeout(() => {
        for (let formInput of qsa(".add-book-form input, .add-book-form textarea")){
            formInput.value = "";
        }
    }, 500)
}

// Opens the book-adding popup
let openAddPopup = () => {
    popupDimmer.style.height = "100vh";
    addPopup.style.display = "block";

    setTimeout(() => {
        addPopup.style.transform = "scale(1)"
        popupIsOpen = true;
    }, 200)
}

// Opens the popup containing details about a book
let openDetailsPopup = (book) => {
    detailsPopup.querySelector(".title").innerText = book.title;
    detailsPopup.querySelector(".description").innerText = book.description;
    detailsPopup.querySelector("a").innerText = book.link;
    detailsPopup.querySelector("a").href = book.link;
    detailsPopup.querySelector(".buy").addEventListener("click",() => {window.open(book.link)});

    popupDimmer.style.height = "100vh";
    detailsPopup.style.display = "flex";

    setTimeout(() => {
        detailsPopup.style.transform = "scale(1)"
        popupIsOpen = true;
    }, 200)
}

// Creates a new Book object instance based on a form input
let createBook = () => {
    let book = new Book();
    for (let formInput of qsa(".add-book-form input, .add-book-form textarea")){
        book[formInput.name] = formInput.value;
    }
    book.id = nextID++;
    unreadBookList.unshift(book);
}

// Create a new book card associated with a passed Book object
let createNewCard = (book) => {
    let bookCard = book.read ? readCardTemp.cloneNode(true) : notReadCardTemp.cloneNode(true);
    bookCard.querySelector("h3").innerText = book.title;
    bookCard.querySelector(".description").innerText = book.description;
    bookCard.querySelector(".date").innerText = `Added on: ${book.date}`;
    return bookCard;
}

let updateBookList = () => {
    let unreadCards = qs(".unread.column .cards");
    let readCards = qs(".read.column .cards");
    
    for(let card of qsa(".book-card")) card.remove();
    qs(".unread.column .cards .add-new-book").remove();

    for (let book of unreadBookList){
        let bookCard = createNewCard(book);
        bookCard.dataset.index = unreadBookList.indexOf(book);
        unreadCards.appendChild(bookCard);
    }

    for (let book of readBookList){
        let bookCard = createNewCard(book);
        bookCard.dataset.index = readBookList.indexOf(book);
        readCards.appendChild(bookCard);
    }

    unreadCards.appendChild(qs(".templates .add-new-book").cloneNode(true));

    for (let button of qsa(".add-popup-opener")){
        button.addEventListener("click", (event) => {
            openAddPopup();
        })
    }

    for (let card of qsa(".book-card")){
        let tickClick = false;
        card.querySelector(".tick").addEventListener("click", (event) => {
            tickClick = true;
            [unreadBookList, readBookList] = switchBook(event, unreadBookList, readBookList);
            updateBookList();
        })
        
        card.addEventListener("click", (event) => {
            if (!tickClick) openDetailsPopup(findBook(event));
            tickClick = false;
        })
    }
}

// Set up function runs at the beginning to set up things such as eventListeners
let setup = () => {
    addPopup.style.display = "none";
    detailsPopup.style.display = "none";

    document.addEventListener("mousedown", (event) => {
        if (popupIsOpen && !(event.path.includes(addPopup) || event.path.includes(detailsPopup))) {
            closePopups();
        }
    })

    qs(".add-book-form button").addEventListener("click", (event) => {
        createBook();
        updateBookList();
        closePopups();
    })

    updateBookList();
}

setup();