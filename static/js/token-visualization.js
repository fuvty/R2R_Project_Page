// Token Visualization Script
document.addEventListener('DOMContentLoaded', async function() {
  const tokenContainer = document.getElementById('token-content');
  if (!tokenContainer) return;
  
  try {
    // Fetch token data
    const response = await fetch('./static/js/tokens.json');
    if (!response.ok) {
      throw new Error(`Failed to load token data: ${response.status} ${response.statusText}`);
    }
    const tokenData = await response.json();
    
    // Render tokens
    renderTokens(tokenData);
  } catch (error) {
    console.error('Error loading token data:', error);
    
    // Display error message in the token content area
    tokenContainer.innerHTML = `
      <div style="color: #dc3545; padding: 1rem; background-color: #feecf0; border-radius: 6px;">
        <strong>Error loading token visualization:</strong><br>
        ${error.message || 'Could not load token data. Please check your network connection or try again later.'}
        <br><br>
        <small>Tip: Make sure you're viewing this page through a web server, not as a local file.</small>
      </div>
    `;
  }
});

function renderTokens(tokenData) {
  const tokenContainer = document.getElementById('token-content');
  if (!tokenContainer) return;
  
  tokenData.forEach((token, index) => {
    const tokenElement = createTokenElement(token, index);
    tokenContainer.appendChild(tokenElement);
  });
}

function createTokenElement(token, index) {
  // Create token span element
  const tokenElement = document.createElement('span');
  tokenElement.className = `token token-type-${token.usage_type}`;
  tokenElement.textContent = token.token_text;
  
  // Add hover functionality for type 1 and type 2 tokens (blue and red)
  if (token.usage_type === 1 || token.usage_type === 2) {
    tokenElement.classList.add('token-hover');
    
    // Create popover element
    const popover = createPopoverElement(token);
    tokenElement.appendChild(popover);
  }
  
  return tokenElement;
}

function createPopoverElement(token) {
  const popover = document.createElement('div');
  popover.className = 'token-popover';
  
  // Add arrow indicator
  const arrow = document.createElement('div');
  arrow.className = 'popover-arrow';
  popover.appendChild(arrow);
  
  // Small model diverge text section
  if (token.small_diverge_text) {
    const smallDivergeSection = document.createElement('div');
    smallDivergeSection.className = 'popover-section';
    
    const smallDivergeTitle = document.createElement('div');
    smallDivergeTitle.className = 'popover-title';
    smallDivergeTitle.textContent = 'Small Model Output:';
    smallDivergeSection.appendChild(smallDivergeTitle);
    
    const smallDivergeContent = document.createElement('div');
    smallDivergeContent.className = 'popover-content';
    smallDivergeContent.textContent = token.small_diverge_text || 'No data';
    smallDivergeSection.appendChild(smallDivergeContent);
    
    popover.appendChild(smallDivergeSection);
  }
  
  // Reference model diverge text section
  if (token.reference_diverge_text) {
    const refDivergeSection = document.createElement('div');
    refDivergeSection.className = 'popover-section';
    
    const refDivergeTitle = document.createElement('div');
    refDivergeTitle.className = 'popover-title';
    refDivergeTitle.textContent = 'Reference Model Output:';
    refDivergeSection.appendChild(refDivergeTitle);
    
    const refDivergeContent = document.createElement('div');
    refDivergeContent.className = 'popover-content';
    refDivergeContent.textContent = token.reference_diverge_text || 'No data';
    refDivergeSection.appendChild(refDivergeContent);
    
    popover.appendChild(refDivergeSection);
  }
  
  // Judge response section
  if (token.judge_response) {
    const judgeSection = document.createElement('div');
    judgeSection.className = 'popover-section';
    
    const judgeTitle = document.createElement('div');
    judgeTitle.className = 'popover-title';
    judgeTitle.textContent = 'Judge Response:';
    judgeSection.appendChild(judgeTitle);
    
    const judgeContent = document.createElement('div');
    judgeContent.className = 'popover-content';
    
    // Format judge response text
    const formattedJudgeResponse = formatJudgeResponse(token.judge_response);
    judgeContent.innerHTML = formattedJudgeResponse;
    
    // Add model tag based on judge response
    const modelTag = createModelTag(token.judge_response);
    if (modelTag) {
      judgeContent.appendChild(modelTag);
    }
    
    judgeSection.appendChild(judgeContent);
    popover.appendChild(judgeSection);
  }
  
  return popover;
}

function formatJudgeResponse(response) {
  if (!response) return '';
  
  // Replace ** with <strong> tags for bold text
  let formatted = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace newlines with <br> tags
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

function createModelTag(judgeResponse) {
  if (!judgeResponse) return null;
  
  const tag = document.createElement('span');
  tag.className = 'model-tag';
  
  if (judgeResponse.includes('Output: 0') || judgeResponse.includes('Answer (Output: 0)')) {
    tag.textContent = 'Small Model';
    tag.classList.add('small-model-tag');
  } else if (judgeResponse.includes('Output: 1') || judgeResponse.includes('Answer (Output: 1)')) {
    tag.textContent = 'Large Model';
    tag.classList.add('large-model-tag');
  } else {
    return null;
  }
  
  return tag;
}
