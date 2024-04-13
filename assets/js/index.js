document.addEventListener('DOMContentLoaded', function() {
  let noteForm = document.querySelector('.note-form');
  let noteTitle = document.querySelector('.note-title');
  let noteText = document.querySelector('.note-textarea');
  let saveNoteBtn = document.querySelector('.save-note');
  let newNoteBtn = document.querySelector('.new-note');
  let clearBtn = document.querySelector('.clear-btn');
  let noteList = document.querySelector('.list-group'); // Ensure this selector matches your HTML

  const show = (elem) => {
      elem.style.display = 'inline';
  };

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
          noteTitle.setAttribute('readonly', true);
          noteText.setAttribute('readonly', true);
          noteTitle.value = activeNote.title;
          noteText.value = activeNote.text;
          show(newNoteBtn);
      } else {
          noteTitle.removeAttribute('readonly');
          noteText.removeAttribute('readonly');
          noteTitle.value = '';
          noteText.value = '';
          hide(newNoteBtn);
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
      const noteId = JSON.parse(e.target.parentElement.getAttribute('data-note')).id;
      if (activeNote.id === noteId) {
          activeNote = {};
      }
      deleteNote(noteId).then(() => {
          getAndRenderNotes();
          renderActiveNote();
      }).catch(error => alert("Failed to delete note: " + error));
  };

  const handleNoteView = (e) => {
      const noteId = JSON.parse(e.target.closest('li').getAttribute('data-note')).id;
      const note = noteListItems.find(n => n.id === noteId);
      if (note) {
          activeNote = note;
          renderActiveNote();
      }
  };

  const handleNewNoteView = () => {
      activeNote = {};
      renderActiveNote();
  };

  const renderNoteList = (notes) => {
      noteList.innerHTML = '';
      notes.forEach((note) => {
          const li = document.createElement('li');
          li.classList.add('list-group-item');
          li.setAttribute('data-note', JSON.stringify(note));
          li.innerHTML = `<span class="list-item-title">${note.title}</span>`;
          const deleteBtn = document.createElement('i');
          deleteBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
          deleteBtn.onclick = handleNoteDelete;
          li.appendChild(deleteBtn);
          li.onclick = handleNoteView;
          noteList.appendChild(li);
      });
  };

  const getAndRenderNotes = () => {
      getNotes().then(notes => {
          renderNoteList(notes);
          if (!activeNote.id) {
              renderActiveNote();
          }
      });
  };

  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', () => {
      activeNote = {};
      renderActiveNote();
  });
  noteForm.addEventListener('input', () => {
      if (noteTitle.value.trim() && noteText.value.trim()) {
          show(saveNoteBtn);
          show(clearBtn);
      } else {
          hide(saveNoteBtn);
          hide(clearBtn);
      }
  });

  getAndRenderNotes();
});
