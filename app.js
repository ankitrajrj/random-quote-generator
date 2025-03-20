/* Disclaimer by Ankit Raj 
 This project contains comments in HTML, CSS, and JavaScript files to help understand why each part is used. 
 The comments explain the purpose of different sections, making it easier to learn and modify the code. 
 Feel free to explore and improve the project! Happy coding! 😊  */

 const quoteText = document.querySelector(".quote");
 const quoteBtn = document.querySelector("#new-quote-btn");
 const authorName = document.querySelector('.author .name');
 const soundBtn = document.querySelector('.sound');
 const copyBtn = document.querySelector('.copy');
 const twitterBtn = document.querySelector('.twitter');
 const exportBtn = document.querySelector('#export-btn');
 const notification = document.querySelector('#notification');
 const canvas = document.querySelector('#quote-canvas');
 const ctx = canvas.getContext('2d');
 const loadingCounter = document.querySelector('#loading-counter');
 
 // Show notification function
 function showNotification(message) {
   notification.textContent = message;
   notification.style.display = 'block';
   
   setTimeout(() => {
     notification.style.display = 'none';
   }, 2000);
 }
 
 // Function to change background using picsum.photos API
 function changeBackground() {
   return new Promise((resolve, reject) => {
     // Use a timestamp to prevent caching
     const timestamp = new Date().getTime();
     // Create a new image to preload
     const img = new Image();
     
     img.onload = function() {
       // Set the background image once it's loaded
       document.body.style.backgroundImage = `url('${img.src}')`;
       resolve();
     };
     
     img.onerror = function() {
       console.error("Failed to load background image");
       reject();
     };
     
     // Start loading the image
     img.src = `https://picsum.photos/1600/900?random=${timestamp}`;
   });
 }
 
 // Function to update loading counter
 function updateLoadingCounter(count) {
   loadingCounter.textContent = count;
   if (count <= 0) {
     loadingCounter.style.display = 'none';
   } else {
     loadingCounter.style.display = 'inline';
   }
 }
 
 // Fetch and display a random quote
 async function randomQuotes() {
   quoteBtn.classList.add('loading');
   quoteBtn.textContent = 'Loading Quote...';
   
   // Start loading counter
   let count = 3;
   updateLoadingCounter(count);
   const countInterval = setInterval(() => {
     count--;
     updateLoadingCounter(count);
     if (count <= 0) {
       clearInterval(countInterval);
     }
   }, 1000);
   
   try {
     // Change the background image and wait for it to load
     await changeBackground();
     
     // Fetch a random quote
     const response = await fetch("https://api.freeapi.app/api/v1/public/quotes/quote/random");
     const result = await response.json();
     
     if (result.data && result.data.content && result.data.author) {
       quoteText.innerHTML = result.data.content;
       authorName.innerHTML = result.data.author;
     } else {
       quoteText.innerHTML = "Failed to fetch quote.";
       authorName.innerHTML = "Unknown";
     }
   } catch (error) {
     console.error("Error:", error);
     quoteText.innerHTML = "Error fetching quote.";
     authorName.innerHTML = "Unknown";
   } finally {
     quoteBtn.textContent = 'New Quote';
     quoteBtn.classList.remove('loading');
     clearInterval(countInterval);
     updateLoadingCounter(0);
   }
 }
 
 // Text to speech functionality
 soundBtn.addEventListener('click', () => {
   let utterance = new SpeechSynthesisUtterance(`${quoteText.innerHTML} Quote By ${authorName.innerHTML}`);
   speechSynthesis.speak(utterance);
   showNotification("Speaking quote...");
 });
 
 // Copy to clipboard functionality
 copyBtn.addEventListener('click', () => {
   navigator.clipboard.writeText(quoteText.innerText + " — " + authorName.innerText).then(() => {
     copyBtn.innerHTML = "<i class='fas fa-check'></i>";
     showNotification("Quote copied to clipboard!");
     setTimeout(() => copyBtn.innerHTML = "<i class='fas fa-copy'></i>", 1500);
   }).catch(err => {
     console.error("Copy failed:", err);
     showNotification("Failed to copy quote.");
   });
 });
 
 // Twitter share functionality
 twitterBtn.addEventListener('click', () => {
   let twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(quoteText.innerText + " — " + authorName.innerText)}`;
   window.open(twitterUrl, '_blank');
 });
 
 // Export quote as image functionality
 exportBtn.addEventListener('click', () => {
   drawQuoteImage();
 });
 
 // Draw quote on canvas and export
 function drawQuoteImage() {
   // Clear canvas
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   
   // Use solid color background
   ctx.fillStyle = '#79c2d0';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   
   // Add semi-transparent overlay for better text readability
   ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   
   // Draw quote
   ctx.font = '28px Poppins';
   ctx.textAlign = 'center';
   ctx.fillStyle = 'white';
   
   // Handle multi-line text
   const quote = quoteText.innerText;
   const maxWidth = 700;
   const lineHeight = 40;
   wrapText(ctx, quote, canvas.width / 2, canvas.height / 2 - 50, maxWidth, lineHeight);
   
   // Draw attribution
   ctx.font = 'italic 20px Poppins';
   ctx.fillText(`— ${authorName.innerText}`, canvas.width / 2, canvas.height / 2 + 100);
   
   // Convert canvas to image and download
   const dataURL = canvas.toDataURL('image/png');
   const link = document.createElement('a');
   link.download = 'quote.png';
   link.href = dataURL;
   link.click();
   
   showNotification("Quote image saved!");
 }
 
 // Function to wrap text on canvas
 function wrapText(context, text, x, y, maxWidth, lineHeight) {
   const words = text.split(' ');
   let line = '';
   
   for (let n = 0; n < words.length; n++) {
     const testLine = line + words[n] + ' ';
     const metrics = context.measureText(testLine);
     const testWidth = metrics.width;
     
     if (testWidth > maxWidth && n > 0) {
       context.fillText(line, x, y);
       line = words[n] + ' ';
       y += lineHeight;
     } else {
       line = testLine;
     }
   }
   
   context.fillText(line, x, y);
 }
 
 // Load initial quote and background on page load
 window.addEventListener("load", () => {
   randomQuotes();
 });
 
 // New quote button click event
 quoteBtn.addEventListener("click", randomQuotes);