import './sass/main.scss'
import Notiflix from 'notiflix'
import SimpleLightbox from 'simplelightbox'
import 'simplelightbox/dist/simple-lightbox.min.css'
import axios from 'axios'

//references
const refs = {
  searchingBox: document.querySelector('.searching-box'),
  searchQuery: document.querySelector('input[name="searchQuery"]'),
  upBtn: document.querySelector('.up-btn'),
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.load-more'),
}

//clear search results
const clear = (elems) => [...elems.children].forEach((div) => div.remove())

//slider
const lightbox = () => new SimpleLightbox('.gallery a', {})
let perPage = 40
let page = 0
let name = refs.searchQuery.value

//styles, hide load btn and text
refs.loadBtn.style.display = 'none'
refs.upBtn.style.display = 'none'

//http request to API
async function fetchImages(name, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=27160087-b033f18e68b0b54e8a3a55bfe&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    )
    console.log(response)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

// even submitting form to API
refs.searchForm.addEventListener('submit', eventHandler)

// on submit of form getting gallery images
async function eventHandler(ev) {
  ev.preventDefault()
  clear(refs.gallery)
  refs.loadBtn.style.display = 'none'
  page = 1
  name = refs.searchQuery.value
  console.log(name)
  //building cards into request
  fetchImages(name, page)
    .then((name) => {
      console.log(`Number of arrays: ${name.hits.length}`)
      console.log(`Total hits: ${name.totalHits}`)
      let totalPages = Math.ceil(name.totalHits / perPage)
      console.log(`Total pages: ${totalPages}`)

      if (name.hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`)
        renderGallery(name)
        console.log(`Current page: ${page}`)
        lightbox()

        //smooth scrool to up
        refs.upBtn.style.display = 'block'
        refs.upBtn.addEventListener('click', () => {
          refs.searchingBox.scrollIntoView({
            behavior: 'smooth',
          })
        })
        //load btn at the end of gallery
        if (page < totalPages) {
          refs.loadBtn.style.display = 'block'
        } else {
          refs.loadBtn.style.display = 'none'
          console.log('There are no more images')
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results.",
          )
        }
      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        )
        clear(refs.gallery) //reset view in case of failure
      }
    })
    .catch((error) => console.log(error))
}

//building cards response
function renderGallery(name) {
  const markup = name.hits
    .map((hit) => {
      return `<div class="photo-card">
      <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <p><b>Likes</b> <br>${hit.likes}</br></p>
        </p>
        <p class="info-item">
          <p><b>Views</b> <br>${hit.views}</br></p>
        </p>
        <p class="info-item">
          <p><b>Comments</b> <br>${hit.comments}</br></p>
        </p>
        <p class="info-item">
          <p><b>Downloads</b> <br>${hit.downloads}</br></p>
        </p>
      </div>
    </div>`
    })
    .join('')
  refs.gallery.insertAdjacentHTML('beforeend', markup)
}

refs.loadBtn.addEventListener(
  'click',
  () => {
    name = refs.searchQuery.value
    console.log('load more images')
    page += 1
    fetchImages(name, page).then((name) => {
      let totalPages = Math.ceil(name.totalHits / perPage)
      renderGallery(name)

      //smooth scroll
      const {
        height: cardHeight,
      } = refs.gallery.firstElementChild.getBoundingClientRect()

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      })

      lightbox().refresh()
      console.log(`Current page: ${page}`)

      if (page >= totalPages) {
        refs.loadBtn.style.display = 'none'
        console.log('There are no more images')
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results.",
        )
      }
    })
  },
  true,
)
