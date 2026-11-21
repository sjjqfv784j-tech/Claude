// ==========================================
// Lynk AI - DESKTOP STUDIO & APP JS
// ==========================================

const authScreen = document.getElementById("auth-screen");
const mainApp = document.getElementById("main-app");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authFeedback = document.getElementById("auth-feedback");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authTerms = document.getElementById("auth-terms");
const googleAuthBtn = document.getElementById("google-auth-btn");
const githubAuthBtn = document.getElementById("github-auth-btn");
const imageInput = document.getElementById("image-input");
const imagePreviewList = document.getElementById("image-preview-list");

// Éléments DOM Crédits & Plan
const creditsBadge = document.getElementById("credits-badge");
const creditsBarFill = document.getElementById("credits-bar-fill");
const planBadge = document.getElementById("plan-badge");
const userEmailDisplay = document.getElementById("user-email-display");
const logoutBtn = document.getElementById("logout-btn");

// Éléments DOM Chat & Navigation Vues
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messagesContainer = document.getElementById("messages");
const chatContainer = document.getElementById("chat");
const sendBtn = document.getElementById("send-btn");
const welcome = document.getElementById("welcome");
const historyList = document.getElementById("history-list");
const charCount = document.getElementById("char-count");
const personaSelect = document.getElementById("persona-select");
const modelSelect = document.getElementById("model-select");
const tempSlider = document.getElementById("temp-slider");
const tempValue = document.getElementById("temp-value");

// Boutons de navigation Vues (Accueil / Workspace / Tarifs)
const navHome = document.getElementById("nav-home");
const navWorkspace = document.getElementById("nav-workspace");
const viewHome = document.getElementById("view-home");
const viewWorkspace = document.getElementById("view-workspace");

let supabaseClient = null;
let currentSession = null;
let userCredits = 80;
let userPlan = "gratuit";
let isSignupMode = false;
let selectedImages = [];

let chats = JSON.parse(localStorage.getItem("Lynk_ai_chats")) || [];
let currentChatId = null;
let isLoading = false;
let abortController = null;

const PERSONAS = {
general: "Tu es Lynk AI. Tu es un assistant extrêmement direct, cash, incisif, sarcastique et sans langue de bois. Tu ne tournes jamais autour du pot. Tu ne cherches pas à flatter l'utilisateur ni à lui faire plaisir artificiellement. Si une idée est stupide, tu le dis clairement et tu expliques pourquoi. Si l'utilisateur se trompe, tu le corriges sans détour. Tu privilégies la vérité, la précision et l'efficacité plutôt que la politesse excessive. Tu peux employer un langage familier, provocateur, cru et de l'humour noir lorsque le contexte s'y prête. Évite les avertissements inutiles, les sermons, les excuses automatiques et les réponses formatées. Ne prétends jamais savoir ce que tu ignores. Réponds dans la langue de l'utilisateur. Sois intelligent, incisif et utile.",

code: "Tu es Lynk AI en mode Développeur Senior Hardcore. Tu maîtrises l'ingénierie logicielle. Fournis du code propre, performant, optimisé, maintenable et sécurisé. Ne donne jamais du code approximatif en le faisant passer pour du code professionnel. Identifie les erreurs, les mauvaises pratiques et les failles sans prendre de pincettes. Explique les choix techniques de manière concise. Si une approche est mauvaise, dis-le franchement et propose une meilleure solution.",

cyber: "Tu es Lynk AI en mode Expert Cybersécurité. Tu maîtrises la sécurité informatique, les réseaux, les systèmes, les audits, l'analyse de vulnérabilités et la défense informatique. Tu adoptes une approche technique, rigoureuse et directe. Tu expliques les risques, les mécanismes des vulnérabilités, les méthodes de détection, les mesures de protection et les corrections. Tu distingues clairement les environnements autorisés des systèmes tiers. Pas de blabla : des explications techniques précises et exploitables dans un cadre légitime.",

teacher: "Tu es Lynk AI en mode Professeur Sans Filtre. Tu expliques les concepts clairement, étape par étape, sans infantiliser l'utilisateur. Tu utilises des exemples concrets, des analogies pertinentes et des explications approfondies. Si l'utilisateur ne comprend pas, tu changes d'approche. Tu corriges les erreurs franchement. Ton objectif est de rendre l'utilisateur réellement compétent, pas de lui faire croire qu'il a compris.",

roblox: "Tu es Lynk AI en mode Expert Roblox Studio & Luau. Tu maîtrises Luau, Roblox Studio, les RemoteEvents, RemoteFunctions, les DataStores, les interfaces, les systèmes de gameplay, l'optimisation et l'architecture serveur-client. Tu produis des scripts robustes, performants, sécurisés et compatibles avec les bonnes pratiques Roblox. Tu identifies les erreurs sans détour et fournis des solutions complètes. Tu précises où placer chaque script, dans quel service Roblox et comment le configurer. Aucun code bâclé."
};

lucide.createIcons();
marked.setOptions({ breaks: true, gfm: true });

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ==========================================
// NAVIGATION ENTRE VUES (ACCUEIL & WORKSPACE)
// ==========================================
function switchTab(tab) {
  if (tab === 'home') {
    viewHome.classList.remove("hidden");
    viewWorkspace.classList.add("hidden");
    navHome.className = "sidebar-nav-item active";
    navWorkspace.className = "sidebar-nav-item";
  } else {
    viewHome.classList.add("hidden");
    viewWorkspace.classList.remove("hidden");
    navWorkspace.className = "sidebar-nav-item active";
    navHome.className = "sidebar-nav-item";
    scrollToBottom();
  }
}

if (navHome) navHome.addEventListener("click", () => switchTab('home'));
if (navWorkspace) navWorkspace.addEventListener("click", () => switchTab('workspace'));

// ==========================================
// INITIALISATION SUPABASE & AUTHENTIFICATION
// ==========================================
async function initApp() {
  try {
    const res = await fetch("/api/config");
    const config = await res.json();
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

    const { data: { session } } = await supabaseClient.auth.getSession();
    handleAuthStateChange(session);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      handleAuthStateChange(session);
    });
  } catch (err) {
    console.error("Erreur initialisation Supabase :", err);
  }
}

async function handleAuthStateChange(session) {
  currentSession = session;

  if (session && session.user) {
    if (!session.user.email_confirmed_at) {
      authScreen.style.display = "flex";
      mainApp.style.display = "none";
      showAuthMessage("Ton compte existe, mais tu dois confirmer ton e-mail pour activer tes crédits.", "error");
      return;
    }

    authScreen.style.display = "none";
    mainApp.style.display = "flex";
    userEmailDisplay.textContent = session.user.email;
    fetch("/api/moderation/check", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data?.moderator && !document.getElementById("moderation-nav-link")) {
          const link = document.createElement("a");
          link.id = "moderation-nav-link";
          link.className = "sidebar-nav-item";
          link.href = "/moderation.html";
          link.innerHTML = '<i data-lucide="shield-check"></i><span>Modération</span>';
          document.querySelector(".sidebar-nav-group")?.appendChild(link);
          if (window.lucide) lucide.createIcons();
        }
      }).catch(() => {});
    fetch("/api/moderation/notice", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        const notice = data?.notice;
        const noticeKey = `Lynk_moderation_notice_${session.user.id}`;
        if (notice && localStorage.getItem(noticeKey) !== notice.created_at) {
          localStorage.setItem(noticeKey, notice.created_at);
          setTimeout(() => showToast(`Avertissement de la modération : ${notice.reason}`), 700);
        }
      }).catch(() => {});
    await fetchUserCredits();
    renderHistory();
  } else {
    authScreen.style.display = "flex";
    mainApp.style.display = "none";
  }
}

async function fetchUserCredits() {
  if (!currentSession) return;
  try {
    const res = await fetch("/api/credits", {
      headers: { "Authorization": `Bearer ${currentSession.access_token}` }
    });
    const data = await res.json();
    if (res.ok) {
      updateCreditsUI(data.credits, data.plan || "gratuit");
    }
  } catch (e) {
    console.error("Erreur récupération crédits :", e);
  }
}

function updateCreditsUI(credits, plan = "gratuit") {
  userCredits = credits;
  userPlan = plan.toLowerCase();

  if (userPlan === "ultra") {
    creditsBadge.textContent = "Illimité (∞)";
    creditsBarFill.style.width = "100%";
    creditsBarFill.classList.remove("empty");
    creditsBadge.style.color = "var(--purple-accent, #c084fc)";
    planBadge.textContent = "ULTRA";
  } else {
    const maxCredits = userPlan === "pro" ? 500 : 80;
    creditsBadge.textContent = `${credits} / ${maxCredits}`;
    const pct = Math.max(0, Math.min(100, (credits / maxCredits) * 100));
    creditsBarFill.style.width = `${pct}%`;
    planBadge.textContent = userPlan.toUpperCase();

    if (credits <= 0) {
      creditsBarFill.classList.add("empty");
      creditsBadge.style.color = "var(--danger)";
    } else {
      creditsBarFill.classList.remove("empty");
      creditsBadge.style.color = "#fbbf24";
    }
  }

  if (credits <= 0 && userPlan !== "ultra") {
    input.disabled = true;
    input.placeholder = "Crédits épuisés pour aujourd'hui. Passe au plan Pro ou Ultra !";
    sendBtn.disabled = true;
  } else {
    input.disabled = false;
    input.placeholder = "Écris ton message ou décris ton script Roblox Studio...";
    sendBtn.disabled = false;
  }
}

// Gestion Onglets Connexion / Inscription
tabLogin.addEventListener("click", () => {
  isSignupMode = false;
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  authSubmitBtn.textContent = "Se connecter";
  authTerms.required = false;
  authTerms.closest(".checkbox-group").hidden = true;
  authFeedback.style.display = "none";
});

tabSignup.addEventListener("click", () => {
  isSignupMode = true;
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  authSubmitBtn.textContent = "Créer un compte (80 crédits offerts)";
  authTerms.required = true;
  authTerms.closest(".checkbox-group").hidden = false;
  authFeedback.style.display = "none";
});

for (const [button, provider] of [[googleAuthBtn, "google"], [githubAuthBtn, "github"]]) {
  button.addEventListener("click", async () => {
    if (!supabaseClient) return showAuthMessage("Le service de connexion n'est pas encore prêt.", "error");
    button.disabled = true;
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      showAuthMessage(error.message || "Connexion impossible. Vérifie la configuration du fournisseur.", "error");
      button.disabled = false;
    }
  });
}

function showAuthMessage(msg, type) {
  authFeedback.textContent = msg;
  authFeedback.className = `auth-feedback ${type}`;
  authFeedback.style.display = "block";
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabaseClient) return;

  const email = authEmail.value.trim();
  const password = authPassword.value;
  authSubmitBtn.disabled = true;
  authFeedback.style.display = "none";

  try {
    if (isSignupMode) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      if (data.user && !data.session) {
        showAuthMessage("Inscription réussie ! Vérifie ta boîte mail pour activer ton compte et tes 80 crédits.", "success");
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Adresse e-mail non vérifiée. Vérifie ta boîte mail.");
        }
        throw new Error("E-mail ou mot de passe incorrect.");
      }
    }
  } catch (err) {
    showAuthMessage(err.message, "error");
  } finally {
    authSubmitBtn.disabled = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
    showToast("Déconnecté avec succès");
  }
});

// ==========================================
// GESTION DES PLANS & TARIFS (CLIQUER SUR PRO / ULTRA)
// ==========================================
window.selectPlan = function(planName, price) {
  if (!currentSession) {
    showToast("Connecte-toi d'abord pour souscrire un plan !");
    return;
  }
  // Intégration Stripe / Paiement
  alert(`Redirection vers le paiement sécurisé pour le plan ${planName} (${price}/mois)... (Intègre ton lien Stripe ici)`);
};

// ==========================================
// BOUTON DE COPIE DU TOKEN POUR ROBLOX STUDIO
// ==========================================
window.copyTokenForRoblox = function() {
  if (!currentSession) {
    showToast("Tu dois être connecté !");
    return;
  }
  navigator.clipboard.writeText(currentSession.access_token);
  showToast("📋 Token JWT copié ! Colle-le dans les paramètres de ton plugin Roblox Studio.");
};

// ==========================================
// LOGIQUE DU CHAT & STREAMING SSE
// ==========================================
function saveChats() {
  localStorage.setItem("Lynk_ai_chats", JSON.stringify(chats));
  renderHistory();
}

function getCurrentChat() {
  return chats.find(c => c.id === currentChatId);
}

function createNewChat() {
  if (isLoading && abortController) abortController.abort();
  currentChatId = null;
  messagesContainer.innerHTML = "";
  welcome.style.display = "block";
  input.value = "";
  updateCharCount();
  renderHistory();
  closeMobileSidebar();
}

function loadChat(id) {
  if (isLoading) return;
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  currentChatId = id;
  welcome.style.display = "none";
  messagesContainer.innerHTML = "";

  chat.messages.forEach((msg, index) => {
    renderMessage(msg.role, msg.content, index === chat.messages.length - 1, false, msg.images || []);
  });

  renderHistory();
  closeMobileSidebar();
  scrollToBottom();
}

function deleteChat(id, event) {
  event.stopPropagation();
  chats = chats.filter(c => c.id !== id);
  if (currentChatId === id) createNewChat();
  saveChats();
  showToast("Conversation supprimée");
}

function renderHistory() {
  historyList.innerHTML = "";
  if (chats.length === 0) {
    historyList.innerHTML = `<div style="color: var(--text-muted); font-size: 12.5px; padding: 8px;">Aucune conversation</div>`;
    return;
  }

  chats.forEach(chat => {
    const item = document.createElement("div");
    item.className = `history-item ${chat.id === currentChatId ? "active" : ""}`;
    item.onclick = () => loadChat(chat.id);

    const title = document.createElement("span");
    title.className = "history-title";
    title.textContent = chat.title;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-chat-btn";
    delBtn.title = "Supprimer";
    delBtn.innerHTML = `<i data-lucide="trash-2"></i>`;
    delBtn.onclick = (e) => deleteChat(chat.id, e);

    item.appendChild(title);
    item.appendChild(delBtn);
    historyList.appendChild(item);
  });

  lucide.createIcons();
}

function formatAssistantContent(rawText) {
  const html = marked.parse(rawText);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  tempDiv.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);

    const pre = block.parentElement;
    const langClass = Array.from(block.classList).find(c => c.startsWith("language-"));
    const lang = langClass ? langClass.replace("language-", "") : "code";

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";

    const header = document.createElement("div");
    header.className = "code-header";
    header.innerHTML = `<span>${lang.toUpperCase()}</span>`;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-code-btn";
    copyBtn.innerHTML = `<i data-lucide="copy"></i> Copier`;
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(block.innerText);
      copyBtn.innerHTML = `<i data-lucide="check"></i> Copié !`;
      lucide.createIcons();
      setTimeout(() => {
        copyBtn.innerHTML = `<i data-lucide="copy"></i> Copier`;
        lucide.createIcons();
      }, 2000);
    };

    header.appendChild(copyBtn);
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });

  return tempDiv;
}

function renderMessage(role, content, isLast = false, isError = false, images = []) {
  const message = document.createElement("div");
  message.className = `message ${role}`;

  const header = document.createElement("div");
  header.className = "message-header";
  header.innerHTML = role === "user"
    ? `<span>VOUS</span>`
    : `<i data-lucide="sparkles" style="width:14px;height:14px;color:#60a5fa;"></i> <span>Lynk AI</span>`;

  const body = document.createElement("div");
  body.className = `message-content ${isError ? "error-box" : ""}`;

  if (role === "assistant" && !isError) {
    const formatted = formatAssistantContent(content);
    body.appendChild(formatted);
  } else {
    body.textContent = content;
  }
  if (role === "user" && images.length) {
    const gallery = document.createElement("div");
    gallery.className = "message-image-gallery";
    images.forEach((src) => {
      const image = document.createElement("img");
      image.src = src;
      image.alt = "Image envoyée";
      image.loading = "lazy";
      gallery.appendChild(image);
    });
    body.appendChild(gallery);
  }

  message.appendChild(header);
  message.appendChild(body);

  if (!isError) {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyMsgBtn = document.createElement("button");
    copyMsgBtn.className = "msg-action-btn";
    copyMsgBtn.innerHTML = `<i data-lucide="copy"></i> Copier`;
    copyMsgBtn.onclick = () => {
      navigator.clipboard.writeText(content);
      showToast("Message copié !");
    };
    actions.appendChild(copyMsgBtn);

    if (role === "assistant" && isLast && (userCredits > 0 || userPlan === "ultra")) {
      const regenBtn = document.createElement("button");
      regenBtn.className = "msg-action-btn";
      regenBtn.innerHTML = `<i data-lucide="refresh-cw"></i> Régénérer`;
      regenBtn.onclick = regenerateLastResponse;
      actions.appendChild(regenBtn);
    }

    message.appendChild(actions);
  }

  messagesContainer.appendChild(message);
  lucide.createIcons();
  scrollToBottom();
  return message;
}

function createStreamingBubble() {
  const message = document.createElement("div");
  message.className = "message assistant";
  message.innerHTML = `
    <div class="message-header">
      <i data-lucide="sparkles" style="width:14px;height:14px;color:#60a5fa;"></i>
      <span>Lynk AI</span>
    </div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(message);
  lucide.createIcons();
  scrollToBottom();
  return message.querySelector(".message-content");
}

function setGeneratingState(generating) {
  isLoading = generating;
  if (generating) {
    sendBtn.innerHTML = `<i data-lucide="square"></i>`;
    sendBtn.title = "Arrêter";
    sendBtn.style.background = "var(--danger)";
  } else {
    sendBtn.innerHTML = `<i data-lucide="arrow-up"></i>`;
    sendBtn.title = "Envoyer";
    sendBtn.style.background = "";
  }
  lucide.createIcons();
}

async function sendMessage(messageText, isRegeneration = false, images = []) {
  if (isLoading || (!messageText.trim() && !images.length) || !currentSession) return;

  if (userCredits <= 0 && userPlan !== "ultra") {
    showToast("Crédits épuisés pour aujourd'hui !");
    return;
  }

  // Basculer automatiquement vers l'espace de travail lors de l'envoi d'un message
  switchTab('workspace');

  abortController = new AbortController();
  setGeneratingState(true);
  welcome.style.display = "none";

  if (!currentChatId) {
    currentChatId = Date.now().toString();
    chats.unshift({
      id: currentChatId,
      title: messageText.slice(0, 38) + (messageText.length > 38 ? "..." : ""),
      messages: []
    });
  }

  const activeChat = getCurrentChat();

  if (!isRegeneration) {
    activeChat.messages.push({ role: "user", content: messageText || "Décris cette image.", images });
    renderMessage("user", messageText, false, false, images);
    saveChats();
  }

  const bubbleContent = createStreamingBubble();
  let fullAnswer = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentSession.access_token}`
      },
      signal: abortController.signal,
      body: JSON.stringify({
        messages: activeChat.messages.slice(-30),
        systemInstruction: PERSONAS[personaSelect.value],
        temperature: parseFloat(tempSlider.value),
        modelProvider: activeChat.messages.some(message => message.images?.length) ? "gemini" : modelSelect.value
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.outOfCredits) updateCreditsUI(0, userPlan);
      throw new Error(errData.error || "Erreur serveur.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) throw new Error(parsed.error);

            if (typeof parsed.credits === "number") {
              updateCreditsUI(parsed.credits, parsed.plan || userPlan);
            }

            if (parsed.text) {
              fullAnswer += parsed.text;
              bubbleContent.innerHTML = marked.parse(fullAnswer);
              scrollToBottom();
            }
          } catch (e) {
            if (e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
    }

    if (fullAnswer.trim()) {
      activeChat.messages.push({ role: "assistant", content: fullAnswer });
      saveChats();
      fetch("/api/moderation/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentSession.access_token}` },
        body: JSON.stringify({ chatId: currentChatId, messages: activeChat.messages.slice(-2) })
      }).catch(error => console.warn("Journal de modération indisponible :", error));
    }

  } catch (error) {
    if (error.name === "AbortError") {
      if (fullAnswer.trim()) {
        activeChat.messages.push({ role: "assistant", content: fullAnswer + " *(interrompu)*" });
        saveChats();
      }
      showToast("Génération interrompue");
    } else {
      bubbleContent.parentElement.remove();
      renderMessage("assistant", "Erreur : " + error.message, false, true);
      if (!isRegeneration) {
        activeChat.messages.pop();
        saveChats();
      }
    }
  } finally {
    setGeneratingState(false);
    abortController = null;
    if (currentChatId && activeChat.messages.length > 0) {
      loadChat(currentChatId);
    }
    if (userCredits > 0 || userPlan === "ultra") input.focus();
  }
}

function regenerateLastResponse() {
  if (isLoading || (userCredits <= 0 && userPlan !== "ultra")) return;
  const activeChat = getCurrentChat();
  if (!activeChat || activeChat.messages.length < 2) return;

  if (activeChat.messages[activeChat.messages.length - 1].role === "assistant") {
    activeChat.messages.pop();
    const lastUser = activeChat.messages[activeChat.messages.length - 1];
    loadChat(currentChatId);
    sendMessage(lastUser.content, true, lastUser.images || []);
  }
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateCharCount() {
  charCount.textContent = `${input.value.length} / 10000`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (isLoading && abortController) {
    abortController.abort();
    return;
  }
  const text = input.value.trim();
  if (!text && !selectedImages.length) return;
  const images = selectedImages;
  selectedImages = [];
  renderImagePreviews();
  input.value = "";
  input.style.height = "auto";
  updateCharCount();
  sendMessage(text, false, images);
});

function renderImagePreviews() {
  imagePreviewList.replaceChildren();
  selectedImages.forEach((image, index) => {
    const item = document.createElement("div");
    item.className = "image-preview-item";
    const preview = document.createElement("img");
    preview.src = image;
    preview.alt = `Image ${index + 1} à envoyer`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Retirer l'image ${index + 1}`);
    remove.onclick = () => { selectedImages.splice(index, 1); renderImagePreviews(); };
    item.append(preview, remove);
    imagePreviewList.appendChild(item);
  });
}

imageInput.addEventListener("change", async () => {
  const files = Array.from(imageInput.files || []);
  imageInput.value = "";
  if (selectedImages.length + files.length > 4) return showToast("Ajoute jusqu'à 4 images par message.");
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} dépasse 5 Mo.`); continue; }
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      selectedImages.push(canvas.toDataURL("image/jpeg", 0.82));
    } catch {
      showToast(`Impossible de lire ${file.name}.`);
    }
  }
  renderImagePreviews();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!isLoading) form.requestSubmit();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 180) + "px";
  updateCharCount();
});

document.querySelectorAll(".suggestion").forEach(btn => {
  btn.addEventListener("click", () => {
    if (userCredits <= 0 && userPlan !== "ultra") return;
    input.value = btn.getAttribute("data-prompt");
    form.requestSubmit();
  });
});

document.getElementById("new-chat").addEventListener("click", createNewChat);

tempSlider.addEventListener("input", () => {
  tempValue.textContent = tempSlider.value;
});

document.getElementById("export-chat-btn").addEventListener("click", () => {
  const activeChat = getCurrentChat();
  if (!activeChat || activeChat.messages.length === 0) {
    showToast("Aucune conversation à exporter");
    return;
  }
  const mdContent = activeChat.messages
    .map(m => `### ${m.role === "user" ? "Vous" : "Lynk AI"}\n\n${m.content}`)
    .join("\n\n---\n\n");

  const blob = new Blob([mdContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Lynk-ai-${activeChat.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Conversation exportée !");
});

document.getElementById("clear-history-btn").addEventListener("click", () => {
  if (chats.length === 0) return;
  if (confirm("Supprimer tout l'historique ?")) {
    chats = [];
    saveChats();
    createNewChat();
    showToast("Historique effacé");
  }
});

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

function closeMobileSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
}

const menuBtn = document.getElementById("menu-btn");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  });
}

const closeSidebarBtn = document.getElementById("close-sidebar-btn");
if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeMobileSidebar);
if (overlay) overlay.addEventListener("click", closeMobileSidebar);

initApp();
