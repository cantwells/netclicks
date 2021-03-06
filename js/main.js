const IMG_PATH = "https://image.tmdb.org/t/p/w185_and_h278_bestv2/";
//Получение элементов
const leftMenu = document.querySelector('.left-menu'),
    logo = document.querySelector('.logo'),
    hamburger = document.querySelector('.hamburger'),
    dropdowns = document.querySelectorAll('.dropdown'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvCardVote = document.querySelector('.tv-card__vote'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    preloader = document.querySelector('.preloader'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    pagination = document.querySelector('.pagination');

//класс подключение к БД
class DBConnect {
    constructor() {
            this.API_KEY = "fa9de1bb626c74440bbf2532a0d596a0";
            this.SERVER = "https://api.themoviedb.org/3";
        }
        //Получение данных
    getData = async(url) => {
        const res = await fetch(url);

        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные с ${url}`);
        }
    }

    //тестовое получение данных для карточек
    getTestData = () => {
        return this.getData('./test.json');
    }

    //тестовое получение данных для модального окна
    getTestCard = () => {
        return this.getData('./card.json');
    }

    //Получение результата из поисковой формы
    getSearchResult = (query, page = 1) => {
        return this.getData(`${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU&page=${page}`);
    }

    //Вывод модального окна
    getModalShow = id => {
        return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
    }

    //Вывод топовых постов сериалов
    getTopShow = (type, page = 1) => {
        return this.getData(`${this.SERVER}/tv/${type}?api_key=${this.API_KEY}&language=ru-RU&page=${page}`);
    }

    getRecommendShow = (id, page = 1) => {
        return this.getData(`${this.SERVER}/tv/${id}/similar?api_key=${this.API_KEY}&language=ru-RU&page=${page}`);
    }

    //Получение трейлеров
    getVideo = id => {
        return this.getData(`${this.SERVER}/tv/${id}/videos?api_key=${this.API_KEY}&language=ru-RU`)
    }
}

const DBConnector = new DBConnect();

//Создаем прелоудер при обновлении страницы с фильмами
const loading = document.createElement('div');
loading.className = 'loading';

//===================================Функции=============================================================

//Отрисовка карточек
const renderCard = (response, target) => {
    tvShowsList.textContent = '';
    console.log(response);

    if (response.results.length) {
        tvShowsHead.classList.remove('error');
        const text = target ? target.textContent : "Результат поиска";
        tvShowsHead.textContent = text;
        response.results.forEach((movie) => {
            const {
                id,
                name: title,
                poster_path: poster,
                backdrop_path: backdrop,
                vote_average: vote,
            } = movie;

            const posterImg = poster ? IMG_PATH + poster : '../img/no-poster.jpg';
            const backdropImg = backdrop ? IMG_PATH + backdrop : '';
            const voteImg = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

            const card = document.createElement('li');
            card.classList.add('tv-shows__item');
            card.innerHTML = `
            <a href="#" id=${id} class="tv-card"> 
                ${voteImg}
                <img class="tv-card__img" src="${posterImg}" 
                data-backdrop="${backdropImg}" 
                alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>`;
            loading.remove();
            tvShowsList.append(card);
        });
        return response;
    } else {
        loading.remove();
        tvShowsHead.classList.add('error');
        tvShowsHead.textContent = "По данному запросу данные отсутсвуют :(";
    }
}

//Отрисовка модального окна
const renderModal = response => {
    preloader.classList.remove('show');
    const {
        poster_path: poster,
        name: title,
        overview,
        genres,
        vote_average: vote,
        homepage,
    } = response;
    tvCardImg.src = poster ? IMG_PATH + poster : '../img/no-poster.jpg';
    tvCardImg.alt = title;
    modalTitle.textContent = title;
    rating.textContent = vote;
    description.textContent = overview;
    modalLink.href = homepage;
    genresList.innerHTML = genres.reduce((acc, item) => {
        const genre = item.name;
        return `${acc}<li>${genre[0].toUpperCase()}${genre.substring(1)}</li>`;
    }, "");
}

//Вывод пагинации
const renderPagination = (pages, current) => {
    pagination.innerHTML = '';
    let links = '';
    for (let i = 1; i < pages; i++) {
        if (i === current) {
            links += `<li><a class="current" href="#">${i}</li>`;
        } else {
            links += `<li><a href='#'>${i}</li>`;
        }
    }
    // console.log(links);
    pagination.innerHTML = links;
}

//Сворачивать подпунткы меню
const dropdownSlideUp = () => {
    const arr = [...dropdowns];
    arr.forEach(item => item.classList.remove('active'));
}

//Функция смены картинки
const changeImg = event => {
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card) {
        const img = card.querySelector('img');
        //Деструктуризация
        if (img.dataset.backdrop)[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        //Альтернптива
        // const data = img.getAttribute('src');
        // img.setAttribute('src', img.dataset.backdrop);
        // img.dataset.backdrop = data;
    }
}

//=================================События==========================================================

//При клике на лого возвращаемся на стартовую страницу
logo.addEventListener('click', event => {
    DBConnector.getTopShow('popular').then(renderCard);
})

//Вывод меню
hamburger.addEventListener('click', event => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    dropdownSlideUp();
})

//Сворачивание меню при нажатии по документу
document.addEventListener('click', event => {
    const target = event.target;

    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        dropdownSlideUp();
    }
})

//Показывать подпункты меню
leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

    if (target.closest('.top-rated')) {
        DBConnector.getTopShow('top_rated').then(res => renderCard(res, target));
    }
    if (target.closest('.popular')) {
        DBConnector.getTopShow('popular').then(res => renderCard(res, target));
    }
    if (target.closest('.today')) {
        DBConnector.getTopShow('airing_today').then(res => renderCard(res, target));
    }
    if (target.closest('.week')) {
        DBConnector.getTopShow('on_the_air').then(res => renderCard(res, target));
    }
})


//При наведение мыши на карточку
tvShowsList.addEventListener('mouseover', changeImg);
//После выходе мышки за пределы карточки
tvShowsList.addEventListener('mouseout', changeImg);

//Вывод модального окна
tvShowsList.addEventListener('click', event => {
    event.preventDefault();
    preloader.classList.add('show');
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card) {
        DBConnector.getModalShow(card.id)
            .then(renderModal)
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .catch(e => console.log(e.message))

        DBConnector.getVideo(card.id).then(res => console.log(res));
        DBConnector.getRecommendShow(card.id).then(res => console.log(res));

    }
});

//Закрытие модального окна
modal.addEventListener('click', event => {
    const target = event.target;
    const cross = target.closest('.cross');
    const overlay = target.matches('.modal');
    if (cross || overlay) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
})

//Обработка поисковой строки
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (query) {
        tvShows.prepend(loading);
        DBConnector.getSearchResult(query)
            .then(renderCard)
            .then(response => renderPagination(response.total_pages, response.page));
    }
})


//Вывод на главной странице
DBConnector.getTopShow('airing_today')
    .then(renderCard)
    .then(response => renderPagination(response.total_pages, response.page));