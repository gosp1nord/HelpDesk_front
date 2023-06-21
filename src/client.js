document.addEventListener('DOMContentLoaded', () => {
  getRequests('http://localhost:7070/?method=allTickets', 'GET', '', renderTickets);
  const btnAddTicket = document.querySelector('.btn-add-ticket');
  btnAddTicket.addEventListener('click', openBlockAdd);
  const btnCloseTicket = document.querySelector('.cancel');
  btnCloseTicket.addEventListener('click', closeBlockAdd);
  const btnConfirm = document.querySelector('.ok');
  btnConfirm.addEventListener('click', confirmTicket);
});

function closeBlockAdd() {
  document.querySelector('.block-add').classList.add('hidden');
}

function openBlockAdd() {
  const blockMain = document.querySelector('.block-main');
  blockMain.innerHTML = '';
  blockMain.insertAdjacentHTML('afterbegin', `
    <div class="title-short">Краткое описание</div>
    <input class="input-short" name="inputShort">
    <div class="title-full">Подробное описание</div>
    <textarea class="text-field area-full" name="inputFull"></textarea>
  `);
  if (this.classList.contains('icon-edit')) {
    document.querySelector('.add-title').innerText = 'Изменить тикет';
    const result = clickedTicket(this);
    document.querySelector('.add-id').innerText = result.id;
    blockMain.querySelector('.input-short').value = result.name;
    blockMain.querySelector('.area-full').value = result.description;
  } else {
    document.querySelector('.add-title').innerText = 'Добавить тикет';
    document.querySelector('.add-id').innerText = '';
  }
  document.querySelector('.block-add').classList.remove('hidden');
}

function clickedTicket(targetContext) {
  const parent = targetContext.closest('.full-ticket');
  const id = parent.querySelector('.id').innerText;
  const name = parent.querySelector('.short').innerText;
  const description = parent.querySelector('.line-description').innerText;
  return { id, name, description };
}

function toggleFullArea() {
  const parent = this.closest('.full-ticket');
  if (parent.querySelector('.line-description').innerText) {
    parent.querySelector('.line-description').classList.toggle('hidden');
  }
}

function dellTicket() {
  const result = clickedTicket(this);
  getRequests(`http://localhost:7070/?method=dellTicket&id=${result.id}`, 'GET', '', renderTickets);
}

function ticketCompleted() {
  const formData = new FormData();
  if (this.classList.contains('completed')) {
    this.classList.remove('completed');
    formData.append('status', '0');
  } else {
    this.classList.add('completed');
    formData.append('status', '1');
  }
  const result = clickedTicket(this);
  formData.append('id', result.id);
  const completedCallback = setCompletedCallback.bind(this);
  getRequests('http://localhost:7070/?method=completeTicket', 'POST', formData, completedCallback);
}

function setCompletedCallback(result) {
  if (result.status) {
    this.classList.add('completed');
    this.innerHTML = '&#10004;';
  } else {
    this.classList.remove('completed');
    this.innerHTML = '';
  }
}

function renderTickets(arrElements) {
  closeBlockAdd();
  const container = document.querySelector('.block-tickets');
  container.innerHTML = '';
  let iconStatus = '';
  let classStatus = '';
  let elementDate = '';
  let dateString = '';
  arrElements.forEach((element) => {
    iconStatus = '';
    classStatus = '';
    if (element.status) {
      iconStatus = '&#10004;';
      classStatus = 'completed';
    }
    elementDate = new Date(element.created);
    const numDate = `0${elementDate.getDate()}`.slice(-2);
    const numMonth = `0${elementDate.getMonth() + 1}`.slice(-2);
    const numYear = `0${elementDate.getFullYear()}`;
    const numHour = `0${elementDate.getHours()}`.slice(-2);
    const numMinutes = `0${elementDate.getMinutes()}`.slice(-2);
    dateString = `${numDate}.${numMonth}.${numYear} ${numHour}:${numMinutes}`;
    container.insertAdjacentHTML('beforeend', `
      <div class="full-ticket">
        <div class="line-ticket">
          <div class="id hidden">${element.id}</div>
          <div class="block-status">
            <div class="img-icon icon-status ${classStatus}">${iconStatus}</div>
            <div class="short">${element.name}</div>
          </div>
          
          <div class="block-tech">
            <div class="text-time">${dateString}</div>
            <div class="img-icon img-margin icon-edit">&#9998;</div>
            <div class="img-icon img-margin icon-del">&#10060;</div>
          </div>
        </div>
        <div class="line-description hidden">${element.description}</div>
      </div>
    `);
  });
  const btnsEdit = container.querySelectorAll('.icon-edit');
  btnsEdit.forEach((item) => {
    item.addEventListener('click', openBlockAdd);
  });
  const btnsDell = container.querySelectorAll('.icon-del');
  btnsDell.forEach((item) => {
    item.addEventListener('click', dellTicket);
  });
  const btnsCompleted = container.querySelectorAll('.icon-status');
  btnsCompleted.forEach((item) => {
    item.addEventListener('click', ticketCompleted);
  });
  const blocksFull = container.querySelectorAll('.short');
  blocksFull.forEach((item) => {
    item.addEventListener('click', toggleFullArea);
  });
}

function confirmTicket() {
  const formBlock = document.querySelector('.block-add');
  const formData = new FormData();
  formData.append('name', formBlock.querySelector('input').value);
  formData.append('description', formBlock.querySelector('textarea').value);
  const addID = formBlock.querySelector('.add-id').innerText;
  if (addID) {
    formData.append('id', addID);
    getRequests('http://localhost:7070/?method=editTicket', 'POST', formData, renderTickets);
  } else {
    getRequests('http://localhost:7070/?method=createTicket', 'POST', formData, renderTickets);
  }
}

function getRequests(url, method, body, callback) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open(method, url);
  xhr.send(body);
  xhr.onload = () => {
    if (xhr.status !== 200) {
      document.querySelector('.err').innerText = 'нет связи с сервером!';
    } else {
      document.querySelector('.err').innerText = '';
      callback(xhr.response);
    }
  };
}
