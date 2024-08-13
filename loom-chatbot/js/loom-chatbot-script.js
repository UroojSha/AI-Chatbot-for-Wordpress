jQuery(document).ready(function($) {
    var conversationHistory = [];  // Initialize an array to store the conversation history

    // Initialize the chatbot as minimized
    $('.loom-chatbot-container').addClass('minimized');

    // Handle click on minimized chatbot to maximize
    $('.loom-chatbot-container').on('click', function() {
        if ($(this).hasClass('minimized')) {
            $(this).removeClass('minimized').addClass('maximized');
            $(this).find('.loom-chatbot-body').show();
            $(this).find('.loom-chatbot-footer').show();
            loadConversationHistory();  // Load conversation history when chatbot is maximized
        }
    });

    // Toggle functionality for minimizing the chatbot
    $('.minimize-button').on('click', function(e) {
        e.stopPropagation(); // Prevent the click event from bubbling up
        var $container = $(this).closest('.loom-chatbot-container');
        if (!$container.hasClass('minimized')) {
            $container.removeClass('maximized').addClass('minimized');
            $container.find('.loom-chatbot-body').hide();
            $container.find('.loom-chatbot-footer').hide();
        }
    });

    // Send message to the chatbot
    $('#loom-chatbot-send').on('click', function() {
        var question = $('#loom-chatbot-input').val();
        if (question === '') {
            return;
        }

        // Add user's question to the conversation history
        conversationHistory.push({role: 'user', content: question});
        displayMessage('user', question);

        $('#loom-chatbot-input').val('');
        $('.loom-chatbot-loading').show();

        $.ajax({
            type: 'POST',
            url: loom_chatbot_obj.ajax_url,
            data: {
                action: 'loom_chatbot_respond',
                question: question,
                security: loom_chatbot_obj.nonce
            },
            success: function(response) {
                $('.loom-chatbot-loading').hide();
                if (response.success) {
                    var answer = response.data.answer;
                    // Add bot's response to the conversation history
                    conversationHistory.push({role: 'bot', content: answer});
                    displayMessage('bot', answer);
                } else {
                    displayMessage('bot', 'I\'m sorry, I couldn\'t find an answer to your question.');
                }
            },
            error: function() {
                $('.loom-chatbot-loading').hide();
                displayMessage('bot', 'An error occurred. Please try again later.');
            }
        });
    });

    // Handle "Enter" key press to send message
    $('#loom-chatbot-input').on('keypress', function(e) {
        if (e.which == 13) {
            $('#loom-chatbot-send').click();
        }
    });

    function displayMessage(role, message) {
        var messageClass = (role === 'user') ? 'user-message' : 'bot-message';
        var messageHtml = '<div class="' + messageClass + '">' + message + '</div>';
        $('.loom-chatbot-messages').append(messageHtml);
    
        var messagesContainer = $('.loom-chatbot-messages');
        // Scroll to the bottom
        messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
    }
    
      
    // Function to load conversation history
    function loadConversationHistory() {
        // Clear current messages
        $('.loom-chatbot-messages').empty();
        // Display each message from the conversation history
        conversationHistory.forEach(function(entry) {
            displayMessage(entry.role, entry.content);
        });
    }
});
