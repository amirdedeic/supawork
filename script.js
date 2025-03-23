document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const roadmapContainer = document.getElementById('roadmap-container');
    const roadmapContent = document.getElementById('roadmap-content');
    const apiKeyModal = document.getElementById('api-key-modal');
    const apiKeyForm = document.getElementById('api-key-form');
    const apiKeyInput = document.getElementById('api-key-input');
    const changeApiKeyBtn = document.getElementById('change-api-key');
    const downloadBtn = document.getElementById('download-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    const loadingOverlay = document.getElementById('loading-overlay');

    // State Variables
    let conversationState = 'goal'; // 'goal', 'progress', 'complete'
    let userGoal = '';
    let userProgress = '';
    let apiKey = localStorage.getItem('supawork_hf_api_key');
    
    // Check if API key exists
    if (!apiKey) {
        showApiKeyModal();
    }

    // Event Listeners
    chatForm.addEventListener('submit', handleChatSubmit);
    apiKeyForm.addEventListener('submit', handleApiKeySubmit);
    changeApiKeyBtn.addEventListener('click', showApiKeyModal);
    downloadBtn.addEventListener('click', downloadRoadmap);
    startOverBtn.addEventListener('click', resetConversation);

    // Functions
    function handleChatSubmit(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Process based on conversation state
        if (conversationState === 'goal') {
            userGoal = message;
            conversationState = 'progress';
            
            // Ask about progress
            setTimeout(() => {
                addMessage("That's a great goal! Now tell me: What have you achieved so far related to this goal?", 'system');
            }, 1000);
            
        } else if (conversationState === 'progress') {
            userProgress = message;
            conversationState = 'complete';
            
            // Generate roadmap
            setTimeout(() => {
                addMessage("Thank you! I'm creating your personalized roadmap now...", 'system');
                generateRoadmap(userGoal, userProgress);
            }, 1000);
        }
    }

    function handleApiKeySubmit(e) {
        e.preventDefault();
        const key = apiKeyInput.value.trim();
        
        if (!key) return;
        
        // Save API key to localStorage
        localStorage.setItem('supawork_hf_api_key', key);
        apiKey = key;
        
        // Hide modal
        apiKeyModal.style.display = 'none';
    }

    function addMessage(text, sender) {
        // Check if we should scroll to bottom (if user is already at bottom)
        const chatContainer = chatMessages.parentElement;
        const isAtBottom = chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 10;
        
        // Create and add message to chat
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        messageDiv.appendChild(paragraph);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom only if user was already at the bottom
        if (isAtBottom) {
            // Wait for the DOM to update with the new message
            requestAnimationFrame(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        }
    }

    async function generateRoadmap(goal, progress) {
        showLoading(true);
        
        try {
            const response = await callOpenAI(goal, progress);
            createRoadmapDisplay(response);
            showLoading(false);
            
            // Show roadmap container
            roadmapContainer.classList.remove('hidden');
            
        } catch (error) {
            showLoading(false);
            addMessage("I'm sorry, there was an error generating your roadmap. Please check your API key and try again.", 'system');
            console.error('Error generating roadmap:', error);
        }
    }

    async function callOpenAI(goal, progress) {
        // Using Hugging Face Inference API with Gemma-7b-it model
        const apiUrl = 'https://api-inference.huggingface.co/models/google/gemma-7b-it';
        
        const prompt = `<start_of_turn>user
I need a detailed roadmap to help me achieve a specific goal. 
        
My goal: ${goal}
        
What I've achieved so far: ${progress}
        
Create a comprehensive, practical plan with specific milestones and timeframes (e.g., by 1 week, by 2 weeks, by 1 month, by 3 months, by 6 months, etc.), showing realistic progress over time.
        
For each timeframe milestone:
1. Include 3-5 specific, actionable steps or tasks
2. Note expected outcomes or results
3. Include potential challenges and how to overcome them
        
Format the response as a clean timeline with clear markers for each time period. Be specific and practical, not generic.
        
Also include at the beginning:
1. A realistic estimate of how long it will take to fully achieve this goal
2. Key resources needed
3. Critical success factors
        
Ensure the advice is personalized based on the starting point and aligned with the ultimate goal.
<end_of_turn>

<start_of_turn>model`;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 2048,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        };
        
        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error calling Hugging Face API');
        }
        
        return data[0].generated_text;
    }

    function createRoadmapDisplay(content) {
        // Convert markdown to formatted HTML
        const formattedContent = formatMarkdown(content);
        
        // Create a styled timeline
        const timelineHTML = createTimeline(formattedContent);
        
        roadmapContent.innerHTML = timelineHTML;
    }

    function formatMarkdown(text) {
        // Basic markdown formatting
        // Handle headers
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Handle lists
        text = text.replace(/^\* (.*$)/gim, '<li>$1</li>');
        text = text.replace(/^- (.*$)/gim, '<li>$1</li>');
        text = text.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
        text = text.replace(/<\/li>\n<li>/g, '</li><li>');
        text = text.replace(/<\/li>\n*$/, '</li>');
        text = text.replace(/^\n*<li>/, '<ul><li>');
        text = text.replace(/<\/li>\n*$/, '</li></ul>');
        
        // Handle bold and italic
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>');
        text = text.replace(/\_(.*?)\_/g, '<em>$1</em>');
        
        // Handle paragraphs
        text = text.replace(/\n{2,}/g, '</p><p>');
        text = text.replace(/^(.+)(?:\n|$)/gm, function(m) {
            return m.match(/^<(\/?)(h\d|ul|ol|li|p)/) ? m : '<p>' + m + '</p>';
        });
        
        return text;
    }

    function createTimeline(content) {
        // Find time period headers (Week 1, Month 3, etc.)
        const timeRegex = /([A-Za-z]+\s+\d+|By \d+ [A-Za-z]+s?|By \d+ [A-Za-z]+s?|In \d+ [A-Za-z]+s?|First \d+ [A-Za-z]+s?)/gi;
        
        // Get all the overview content before the timeline
        let overviewSection = '';
        const firstTimeMatch = content.match(timeRegex);
        
        if (firstTimeMatch && firstTimeMatch[0]) {
            const firstTimeIndex = content.indexOf(firstTimeMatch[0]);
            if (firstTimeIndex > 0) {
                overviewSection = content.substring(0, firstTimeIndex);
            }
        }
        
        // Split content by time periods
        const sections = content.split(timeRegex).filter(Boolean);
        const timePeriods = content.match(timeRegex) || [];
        
        // Start building the HTML
        let timelineHTML = '';
        
        // Add overview section if it exists
        if (overviewSection) {
            timelineHTML += `
                <div class="roadmap-overview">
                    ${overviewSection}
                </div>
            `;
        }
        
        // Start the timeline
        timelineHTML += '<div class="timeline">';
        
        // Add each time period to the timeline
        for (let i = 0; i < timePeriods.length; i++) {
            if (sections[i + 1]) {
                timelineHTML += `
                    <div class="timeline-item">
                        <div class="timeline-marker">${timePeriods[i]}</div>
                        <div class="timeline-content">
                            ${sections[i + 1]}
                        </div>
                    </div>
                `;
            }
        }
        
        timelineHTML += '</div>';
        return timelineHTML;
    }

    function downloadRoadmap() {
        const roadmapText = roadmapContent.innerText;
        const filename = `${userGoal.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roadmap.txt`;
        
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`SUPAWORK.XYZ - YOUR GOAL ROADMAP\n\nGOAL: ${userGoal}\n\nCURRENT PROGRESS: ${userProgress}\n\n${roadmapText}`));
        element.setAttribute('download', filename);
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
    }

    function resetConversation() {
        conversationState = 'goal';
        userGoal = '';
        userProgress = '';
        
        // Clear chat
        chatMessages.innerHTML = '';
        addMessage("Welcome to SupaWork! Let's create a personalized plan to achieve your goal.", 'system');
        addMessage("First, tell me: What do you want to achieve?", 'system');
        
        // Hide roadmap
        roadmapContainer.classList.add('hidden');
    }

    function showApiKeyModal() {
        apiKeyModal.style.display = 'flex';
    }

    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
});
