import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchPictures } from './fetchPictures';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  spinner: document.querySelector('.spinner'),
};

refs.form.addEventListener('submit', onClickButton);

let page = 1;
let inputValue = '';

function onClickButton(e) {
  e.preventDefault();
  inputValue = refs.form.elements.searchQuery.value;

  if (inputValue === '') return Notify.info('Please enter text');
  refs.gallery.innerHTML = '';

  fetchPic(inputValue);
}

async function fetchPic(inputValue) {
  page = 1;
  refs.form.reset();
  refs.spinner.classList.remove('is-hidden');
  const response = await fetchPictures(inputValue, page);

  try {
    if (response.data.totalHits < 1) {
      refs.spinner.classList.add('is-hidden');
      refs.gallery.innerHTML = `<div class="info-result">No results were found for '${inputValue}' ${'&#128557;'}</div>`;
      throw new Error(response.data.statusText);
    }
    marcupPictures(response.data.hits);
    Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    lightbox.refresh();
  } catch {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }
}

function marcupPictures(pictures) {
  const marcup = pictures
    .map(article => {
      return `<div class="photo-card">
    <a href="${article.largeImageURL}"><img src="${article.webformatURL}" alt="${article.tags}" loading="lazy" /></a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>${article.likes}
      </p>
      <p class="info-item">
        <b>Views</b>${article.views}
      </p>
      <p class="info-item">
        <b>Comments</b>${article.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>${article.downloads}
      </p>
    </div>
  </div>`;
    })
    .join('');

  return refs.gallery.insertAdjacentHTML('beforeend', marcup);
}

window.addEventListener('scroll', throttle(onLoadMore, 500));

async function onLoadMore() {
  const galleryRect = refs.gallery.getBoundingClientRect();

  if (galleryRect.bottom < document.documentElement.clientHeight + 130) {
    page++;
    const response = await fetchPictures(inputValue, page);
    try {
      if (Math.ceil(response.data.totalHits / 40) < page && response.data.totalHits > 0) {
        refs.spinner.classList.add('is-hidden');
        return Notify.info("We're sorry, but you've reached the end of search results.");
      } else if (response.data.totalHits > 0) {
        refs.spinner.classList.remove('is-hidden');
        marcupPictures(response.data.hits);
        lightbox.refresh();
      }
    } catch {
      notifyFailure();
    }
  }
}
