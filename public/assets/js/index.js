document.addEventListener('DOMContentLoaded', function() {
  let noteForm = document.querySelector('.note-form');
  let noteTitle = document.querySelector('.note-title');
  let noteText = document.querySelector('.note-textarea');
  let saveNoteBtn = document.querySelector('.save-note');
  let newNoteBtn = document.querySelector('.new-note');
  let clearBtn = document.querySelector('.clear-btn');
  let noteList = document.querySelectorAll('.list-container .list-group');

  // Show an element
  const show = (elem) => {
      elem.style.display = 'inline';
  };

  // Hide an element
  const hide = (elem) => {
      elem.style.display = 'none';
  };

  let activeNote = {};

  const handleFetchErrors = (response) => {
      if (!response.ok) {
          throw Error('The server returned an error: ' + response.statusText);
      }
      return response.json();
  };

  const getNotes = () =>
      fetch('/api/notes', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      }).then(handleFetchErrors);

  const saveNote = (note) =>
      fetch('/api/notes', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(note),
      }).then(handleFetchErrors);

  const deleteNote = (id) =>
      fetch(`/api/notes/${id}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
      }).then(handleFetchErrors);

  const renderActiveNote = () => {
      hide(saveNoteBtn);
      hide(clearBtn);

      if (activeNote.id) {
          show(newNoteBtn);
          noteTitle.setAttribute('readonly', true);
          noteText.setAttribute('readonly', true);
          noteTitle.value = activeNote.title;
          noteText.value = activeNote.text;
      } else {
          hide(newNoteBtn);
          noteTitle.removeAttribute('readonly');
          noteText.removeAttribute('readonly');
          noteTitle.value = '';
          noteText.value = '';
      }
  };

  const handleNoteSave = () => {
      const newNote = {
          title: noteTitle.value,
          text: noteText.value
      };
      saveNote(newNote).then(() => {
          getAndRenderNotes();
          renderActiveNote();
      }).catch(error => alert("Failed to save note: " + error));
  };

  const handleNoteDelete = (e) => {
      e.stopPropagation();

      const note = e.target;
      const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

      if (activeNote.id === noteId) {
          activeNote = {};
      }

      deleteNote(noteId).then(() => {
          getAndRenderNotes();
          renderActiveNote();
      }).catch(error => alert("Failed to delete note: " + error));
  };

  const handleNoteView = (e) => {
      e.preventDefault();
      activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
      renderActiveNote();
  };

  const handleNewNoteView = () => {
      activeNote = {};
      show(clearBtn);
      renderActiveNote();
  };

  const handleRenderBtns = () => {
      if (!noteTitle.value.trim() && !noteText.value.trim()) {
          hide(clearBtn);
      } else {
          show(clearBtn);
          if (!noteTitle.value.trim() || !noteText.value.trim()) {
              hide(saveNoteBtn);
          } else {
              show(saveNoteBtn);
          }
      }
  };

  const renderNoteList = async (notes) => {
      let jsonNotes = await notes;
      noteList.forEach((el) => (el.innerHTML = ''));

      let noteListItems = [];

      const createLi = (text, delBtn = true) => {
          const liEl = document.createElement('li');
          liEl.classList.add('list-group-item');

          const spanEl = document.createElement('span');
          spanEl.classList.add('list-item-title');
          spanEl.innerText = text;
          spanEl.addEventListener('click', handleNoteView);

          liEl.append(spanEl);

          if (delBtn) {
              const delBtnEl = document.createElement('i');
              delBtnEl.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
              delBtnEl.addEventListener('click', handleNoteDelete);

              liEl.append(delBtnEl);
          }

          return liEl;
      };

      if (jsonNotes.length === 0) {
          noteListItems.push(createLi('No saved Notes', false));
      }

      jsonNotes.forEach((note) => {
          const li = createLi(note.title);
          li.dataset.note = JSON.stringify(note);

          noteListItems.push(li);
      });

      noteListItems.forEach((note) => noteList[0].append(note));
  };

  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  noteForm.addEventListener('input', handleRenderBtns);
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);

  getAndRenderNotes();
});
