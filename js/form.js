import { sendData } from './api.js';
import {START_COORDINATE} from './util.js';
import { showMessage } from './messages.js';

const RoomsToGuests = {
  1: ['1'],
  2: ['1', '2'],
  3: ['1','2','3'],
  100: ['0'],
};

const GuestsToRooms = {
  0: ['100'],
  1: ['1','2','3'],
  2: ['2','3'],
  3: ['3'],
};

const TypesToPrice = {
  bungalow: 0,
  flat: 1000,
  hotel: 3000,
  house: 5000,
  palace: 10000,
  max: 100000,
};


const adformEl = document.querySelector('.ad-form');
const mapFiltersEl = document.querySelector('.map__filters');

const adformFieldsets = adformEl.querySelectorAll('fieldset');
const mapFiltersSelects = mapFiltersEl.querySelectorAll('select');
const typeEl = adformEl.querySelector('#type');
const priceEl = adformEl.querySelector('#price');
const timeInEl = adformEl.querySelector('#timein');
const timeOutEl = adformEl.querySelector('#timeout');
const roomNumberEl = adformEl.querySelector('#room_number');
const capacityEl = adformEl.querySelector('#capacity');
const addressEl = adformEl.querySelector('#address');
const sliderEl = adformEl.querySelector('.ad-form__slider');
const submitButton = adformEl.querySelector('.ad-form__submit');


const SliderConfig = {
  MIN: 0,
  MAX: 100000,
  START: priceEl.placeholder,
  STEP:1,
};

const disableForm = () => {
  adformEl.classList.add('ad-form--disabled');
  adformFieldsets.forEach((fieldset) => {
    fieldset.setAttribute('disabled', true);
  });
  mapFiltersSelects.forEach((select) => {
    select.setAttribute('disabled', true);
  });
  mapFiltersEl.querySelector('fieldset').setAttribute('disabled', true);
};

const enableForm = () => {
  adformEl.classList.remove('ad-form--disabled');
  adformFieldsets.forEach((fieldset) => {
    fieldset.removeAttribute('disabled');
  });
  mapFiltersSelects.forEach((select) => {
    select.removeAttribute('disabled');
  });
  mapFiltersEl.querySelector('fieldset').removeAttribute('disabled');
};

const setAddress = ({lat, lng}) => {
  addressEl.value = `${lat.toFixed(5)}, ${lng.toFixed(5)} `;
};

const resetForm = () => {
  adformEl.reset();
  sliderEl.noUiSlider.set(priceEl.value);
};

const pristine = new Pristine(
  adformEl,
  {
    classTo: 'ad-form__element',
    errorClass: 'ad-form__element--invalid',
    errorTextParent:'ad-form__element',
  },
  true
);

noUiSlider.create(sliderEl, {
  range: {
    min: SliderConfig.MIN,
    max: SliderConfig.MAX,
  },
  start: SliderConfig.START,
  step: SliderConfig.STEP,
  format: {
    to: function (value) {
      return value.toFixed(0);
    },
    from: function (value) {
      return value;
    },
  },
});

sliderEl.noUiSlider.on('update', () => {
  priceEl.value = sliderEl.noUiSlider.get();
});

priceEl.addEventListener('change', (evt) => {
  if (evt.target.value) {
    sliderEl.noUiSlider.set(evt.target.value);
  }
});

const validateCapacity = () =>
  RoomsToGuests[roomNumberEl.value].includes(capacityEl.value);
const validatePrice = (value) =>
  value >= TypesToPrice[typeEl.value] && value <= TypesToPrice.max;

const getCapacityErrorMessage = () =>
  `Указанное количество комнат вмещает ${RoomsToGuests[roomNumberEl.value].join('или')}гостей.`;

const getRoomNumberErrorMessage = () =>
  `Для указанного количества гостей требуется ${GuestsToRooms[capacityEl.value].join('или')}комнаты.`;

const getPriceErrorMessage = () =>
  `Минимальная цена для этого типа жилья ${TypesToPrice[typeEl.value]} руб.`;

const onCapacityChange = () => {
  pristine.validate(capacityEl);
  pristine.validate(roomNumberEl);
};

const onRoomNumberChange = () => {
  pristine.validate(capacityEl);
  pristine.validate(roomNumberEl);
};

const onTimeInChange = () => {
  timeOutEl.value = timeInEl.value;
};

const onTimeOutChange = () => {
  timeInEl.value = timeOutEl.value;
};

capacityEl.addEventListener('change', onCapacityChange);
roomNumberEl.addEventListener('change', onRoomNumberChange);
timeInEl.addEventListener('change', onTimeInChange);
timeOutEl.addEventListener('change', onTimeOutChange);

pristine.addValidator(
  capacityEl,
  validateCapacity,
  getCapacityErrorMessage,
);
pristine.addValidator(
  roomNumberEl,
  validateCapacity,
  getRoomNumberErrorMessage,
);
pristine.addValidator(
  priceEl,
  validatePrice,
  getPriceErrorMessage,
);

const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = 'Публикую...';
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = 'Опубликовать';
};

const setFormSubmit = () => {
  adformEl.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const isValid = pristine.validate();
    if (isValid) {
      blockSubmitButton();
      sendData(
        () => {
          showMessage('success');
          unblockSubmitButton();
          resetForm();
        },
        () => {
          showMessage('error', true);
          unblockSubmitButton();
        },
        new FormData(evt.target),
      );
    }
  });
};

const initializeForm = () => {
  setAddress(START_COORDINATE);
  setFormSubmit();
};

export {disableForm, enableForm, setAddress, initializeForm};
