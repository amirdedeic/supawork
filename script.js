document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const roadmapContainer = document.getElementById('roadmap-container');
    const roadmapContent = document.getElementById('roadmap-content');
    const changeApiKeyBtn = document.getElementById('change-api-key');
    const downloadBtn = document.getElementById('download-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const tagline = document.querySelector('.tagline');
    const header = document.querySelector('header');

    // State Variables
    let conversationState = 'goal'; // 'goal', 'progress', 'complete'
    let userGoal = '';
    let userProgress = '';
    let lastScrollTop = 0;
    
    // Lambda API endpoint - UPDATE THIS WITH YOUR ACTUAL ENDPOINT
    const LAMBDA_ENDPOINT = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod/generate-roadmap';
    
    // Initialize tagline visibility
    tagline.style.opacity = '1';
    tagline.style.transition = 'opacity 0.3s ease';
    
    // Scroll event listener for tagline visibility
    window.addEventListener('scroll', () => {
        // Get current scroll position
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only hide tagline after scrolling down a bit (e.g., 50px)
        if (scrollTop > 50) {
            tagline.style.opacity = '0';
            tagline.style.visibility = 'hidden';
            header.classList.add('compact-header');
        } else {
            tagline.style.opacity = '1';
            tagline.style.visibility = 'visible';
            header.classList.remove('compact-header');
        }
        
        // Save current scroll position
        lastScrollTop = scrollTop;
    });

    // Event Listeners
    chatForm.addEventListener('submit', handleChatSubmit);
    changeApiKeyBtn.addEventListener('click', handleChangeApiKey);
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

    function handleChangeApiKey() {
        alert("The API key is now securely stored on the server. You don't need to provide your own key.");
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        messageDiv.appendChild(paragraph);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom of the page (smoothly) so the user sees the newest messages
        requestAnimationFrame(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }

    async function generateRoadmap(goal, progress) {
        showLoading(true);
        
        try {
            const response = await fetch(LAMBDA_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ goal, progress })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error generating roadmap');
            }
            
            createRoadmapDisplay(data.generatedText);
            showLoading(false);
            
            // Show roadmap container
            roadmapContainer.classList.remove('hidden');
            
            // Scroll to the roadmap after it's displayed
            setTimeout(() => {
                roadmapContainer.scrollIntoView({ behavior: 'smooth' });
            }, 300);
            
        } catch (error) {
            showLoading(false);
            addMessage("I'm sorry, there was an error generating your roadmap. Please try again later.", 'system');
            console.error('Error generating roadmap:', error);
        }
    }

    function createRoadmapDisplay(content) {
        try {
            // Convert markdown to formatted HTML
            const formattedContent = formatMarkdown(content);
            
            // Create a styled timeline
            const timelineHTML = createTimeline(formattedContent);
            
            roadmapContent.innerHTML = timelineHTML;
        } catch (error) {
            console.error('Error formatting roadmap:', error);
            roadmapContent.innerHTML = `
                <div class="roadmap-error">
                    There was an error formatting your roadmap.
                </div>
                <div class="roadmap-content-full">
                    ${content}
                </div>
            `;
        }
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
        
        // If no timeline structure is detected, show full content
        if (!timePeriods.length) {
            return `
                <div class="roadmap-overview">
                    <p>Here's your personalized roadmap:</p>
                </div>
                <div class="roadmap-content-full">
                    ${content}
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
    
    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
});