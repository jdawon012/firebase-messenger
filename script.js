import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6e3RBx6m8TFU5h9MFugZAf2wAAeEWw6s",
  authDomain: 'fir-messenger-11acc.firebaseapp.com',
  projectId: 'fir-messenger-11acc',
  storageBucket: 'fir-messenger-11acc.firebasestorage.app',
  messagingSenderId: '751001424564',
  appId: '1:751001424564:web:f67643d1bff1fe44f37de1',
  measurementId: 'G-F4EDXG47S2',
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const messagesCollection = collection(firestore, 'messages');
const messages = [];

const form = document.querySelector('#message-form');
const input = document.querySelector('#message-input');
const chatArea = document.querySelector('#chat-area');
const characterCount = document.querySelector('#character-count');
const sendButton = document.querySelector('[data-testid="button-send"]');
const sendButtonLabel = sendButton.querySelector('span');
const dateLabel = document.querySelector('[data-testid="text-date"]');
let isSaving = false;

const formatTime = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

const formatDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);

dateLabel.textContent = formatDate(new Date());

function updateComposerState() {
  const length = input.value.length;
  characterCount.textContent = `${length} / 500`;
  sendButton.disabled = input.value.trim().length === 0 || isSaving;
}

function renderMessages() {
  if (messages.length === 0) {
    chatArea.innerHTML = `
      <div class="empty-state" data-testid="empty-state">
        <div class="empty-symbol" aria-hidden="true">+</div>
        <p class="empty-title">아직 메시지가 없어요</p>
        <p class="empty-description">오늘 마음에 남은 말을<br />첫 메시지로 시작해보세요.</p>
      </div>
    `;
    return;
  }

  const list = document.createElement('div');
  list.className = 'message-list';
  list.setAttribute('data-testid', 'message-list');

  messages.forEach((message) => {
    const row = document.createElement('article');
    row.className = 'message-row';
    row.dataset.testid = `message-row-${message.id}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = '나';

    const content = document.createElement('div');
    content.className = 'message-content';

    const bubble = document.createElement('p');
    bubble.className = 'message-bubble';
    bubble.dataset.testid = `message-text-${message.id}`;
    bubble.textContent = message.text;

    const time = document.createElement('time');
    time.className = 'message-time';
    time.dateTime = message.createdAt.toISOString();
    time.dataset.testid = `message-time-${message.id}`;
    time.textContent = formatTime(message.createdAt);

    content.append(bubble, time);
    row.append(avatar, content);
    list.append(row);
  });

  chatArea.replaceChildren(list);
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isSaving) {
    updateComposerState();
    input.focus();
    return;
  }

  isSaving = true;
  sendButtonLabel.textContent = '저장 중...';
  updateComposerState();

  try {
    const messageDocument = await addDoc(messagesCollection, {
      text,
      createdAt: serverTimestamp(),
    });

    messages.push({
      id: messageDocument.id,
      text,
      createdAt: new Date(),
    });

    input.value = '';
    input.style.height = 'auto';
    renderMessages();
  } catch (error) {
    console.error('Firestore 메시지 저장 실패:', error);
  } finally {
    isSaving = false;
    sendButtonLabel.textContent = '보내기';
    updateComposerState();
    input.focus();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 132)}px`;
  updateComposerState();
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

updateComposerState();