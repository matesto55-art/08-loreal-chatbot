/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestionText = document.getElementById("latestQuestionText");

// System prompt to guide the AI
const systemPrompt =
  "You are a helpful assistant for L'Oréal products. You only answer questions related to L'Oréal beauty products, skincare routines, makeup recommendations, and beauty tips. If a question is not related to these topics, politely refuse to answer.";

// Conversation state to keep context and history
const conversationMessages = [{ role: "system", content: systemPrompt }];
const conversationState = {
  userName: null,
  pastQuestions: [],
};

// Set initial message
chatWindow.innerHTML =
  "<div class='msg bot'>👋 Hello! How can I help you today?</div>";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;
  userInput.value = "";

  latestQuestionText.textContent = userMessage;
  document.getElementById("latestQuestion").classList.remove("hidden");

  // Track conversation history locally
  conversationMessages.push({ role: "user", content: userMessage });
  conversationState.pastQuestions.push(userMessage);

  if (!conversationState.userName) {
    const nameMatch = userMessage.match(
      /(?:my name is|I'm|I am)\s+([A-Za-z]+)/i,
    );
    if (nameMatch) {
      conversationState.userName = nameMatch[1];
    }
  }

  chatWindow.innerHTML += `<div class="msg user">${userMessage}</div>`;

  try {
    const response = await fetch("https://protect.matesto55.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationMessages }),
    });

    if (!response.ok) {
      throw new Error(`Worker request failed: ${response.status}`);
    }

    const data = await response.json();
    const botMessage =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't read the response. Please try again.";

    conversationMessages.push({ role: "assistant", content: botMessage });

    chatWindow.innerHTML += `<div class="msg bot">${botMessage}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    chatWindow.innerHTML += `<div class="msg error">Sorry, there was an error: ${error.message}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
